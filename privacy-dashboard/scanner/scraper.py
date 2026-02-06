from playwright.sync_api import sync_playwright, TimeoutError as PWTimeoutError
from bs4 import BeautifulSoup
import tldextract
from datetime import datetime
from urllib.parse import urlparse, urljoin
import socket
import ipaddress
import time
import logging

logger = logging.getLogger(__name__)

def is_allowed_target(url, resolver_timeout=5):
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False, "unsupported-scheme"
    hostname = parsed.hostname
    if not hostname:
        return False, "no-hostname"

    # Quick reject explicit IPs in private ranges
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False, "private-or-loopback-ip"
    except ValueError:
        # not a literal IP; do DNS resolution to check
        try:
            infos = socket.getaddrinfo(hostname, None)
            for info in infos:
                addr = info[4][0]
                ip = ipaddress.ip_address(addr)
                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                    return False, "dns-resolved-private-ip"
        except Exception:
            # DNS may fail; allow DNS failure to be handled later (but log)
            logger.debug("DNS resolution failed for %s", hostname, exc_info=True)
            pass

    return True, None


def extract_registered_domain(u):
    try:
        ext = tldextract.extract(u)
        return ext.registered_domain or ""
    except Exception:
        return ""


def cookie_is_third_party(cookie_domain, main_registered_domain):
    if not cookie_domain:
        return True
    cd = cookie_domain.lstrip(".")
    return extract_registered_domain(cd) != main_registered_domain


def scan_url(url, page_timeout=30000, overall_timeout=None):
    """
    Scans the page with Playwright and returns a report dictionary.

    - page_timeout: timeout for navigation and wait_for_load_state in ms
    - overall_timeout: optional overall timeout in seconds (not enforced here)
    """
    allowed, reason = is_allowed_target(url)
    if not allowed:
        raise ValueError(f"Target not allowed: {reason}")

    network_requests = []  # list of dicts: {id, url, domain, resource_type, method, timestamp, status, response_headers}
    cookies = []
    third_party_domains = set()
    request_index = {}  # map request._guid -> network_requests index (best-effort)

    html = ""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()  # isolates cookies per scan
        page = context.new_page()

        # capture requests
        def on_request(req):
            try:
                req_id = getattr(req, "_impl_obj", None)
                req_url = req.url
                resource_type = req.resource_type
                domain = extract_registered_domain(req_url)
                entry = {
                    "id": id(req),  # simple id
                    "url": req_url,
                    "resource_type": resource_type,
                    "method": req.method,
                    "domain": domain,
                    "timestamp": datetime.utcnow().isoformat(),
                }
                request_index[id(req)] = len(network_requests)
                network_requests.append(entry)
            except Exception:
                logger.exception("on_request error")

        page.on("request", on_request)

        # capture responses (status, headers)
        def on_response(resp):
            try:
                # Try to associate by object id
                rid = id(resp.request)
                idx = request_index.get(rid)
                status = resp.status
                headers = resp.headers
                if idx is not None and idx < len(network_requests):
                    network_requests[idx].update({
                        "status": status,
                        "response_headers": headers,
                    })
                else:
                    # fallback: best-effort match by url
                    rurl = resp.url
                    for nr in reversed(network_requests):
                        if nr.get("url") == rurl and "status" not in nr:
                            nr["status"] = status
                            nr["response_headers"] = headers
                            break
            except Exception:
                logger.exception("on_response error")

        page.on("response", on_response)

        try:
            page.goto(url, timeout=page_timeout)
            page.wait_for_load_state("networkidle", timeout=page_timeout)
            page.wait_for_timeout(1500)
            html = page.content()
            cookies = context.cookies()
        except PWTimeoutError:
            # partial capture is acceptable; get whatever content we have
            try:
                html = page.content()
            except Exception:
                html = ""
            logger.warning("Page load timed out for %s", url)
        except Exception:
            logger.exception("Unexpected exception during page load")
            try:
                html = page.content()
            except Exception:
                html = ""
        finally:
            # ensure we close page and context
            try:
                page.close()
            except Exception:
                pass
            try:
                context.close()
            except Exception:
                pass
            try:
                browser.close()
            except Exception:
                pass

    # parse DOM script tags (resolve relative URLs)
    soup = BeautifulSoup(html or "", "html.parser")
    scripts = soup.find_all("script")
    script_srcs = []
    for s in scripts:
        src = s.get("src")
        if src:
            absolute = urljoin(url, src)
            script_srcs.append(absolute)

    main_domain = extract_registered_domain(url)
    third_party_scripts = []
    for src in script_srcs:
        domain = extract_registered_domain(src)
        if domain and domain != main_domain:
            third_party_scripts.append({"src": src, "domain": domain})

    # get third-party domains seen in network requests (registered domain dedup)
    for nr in network_requests:
        d = nr.get("domain")
        if d and d != main_domain:
            third_party_domains.add(d)

    # cookie classification: collect cookie info and mark cross-site vs host-only
    cookie_count = len(cookies)
    cookie_info = []
    for c in cookies:
        name = c.get("name")
        domain = c.get("domain", "")
        is_third = cookie_is_third_party(domain, main_domain)
        cookie_info.append({
            "name": name,
            "domain": domain,
            "is_third_party": is_third,
            "httpOnly": c.get("httpOnly"),
            "secure": c.get("secure"),
            "sameSite": c.get("sameSite"),
            "expires": c.get("expires"),
            "path": c.get("path"),
        })
    cross_site_cookies = sum(1 for c in cookie_info if c["is_third_party"])

    tracker_count = len(third_party_domains)  # naive: distinct third-party registered domains
    evidence = {
        "network_requests": network_requests,
        "script_srcs": script_srcs,
        "third_party_domains": sorted(third_party_domains),
        "third_party_script_tags": third_party_scripts,
        "cookie_info": cookie_info,
    }

    # Scoring (placeholder - replace with list-based classification for accuracy)
    penalty_trackers = tracker_count * 8
    penalty_cookies = cookie_count * 2
    score = max(0, 100 - penalty_trackers - penalty_cookies)

    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    return {
        "tracker_count": tracker_count,
        "cookie_count": cookie_count,
        "cross_site_cookie_count": cross_site_cookies,
        "third_party_scripts": third_party_scripts,
        "third_party_domains": sorted(third_party_domains),
        "network_requests": network_requests,
        "headers": {},
        "score": score,
        "grade": grade,
        "timestamp": datetime.utcnow(),
        "evidence": evidence,
    }
