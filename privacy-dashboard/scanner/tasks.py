from celery import shared_task
from django.db import transaction
from .models import Website, Report
from .scraper import scan_url
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, soft_time_limit=120)
def scan_website_task(self, website_id):
    try:
        website = Website.objects.get(id=website_id)
    except Website.DoesNotExist:
        return

    try:
        data = scan_url(website.url)
    except Exception as e:
        logger.exception("Scan failed for %s: %s", website.url, e)
        # optionally record failure in DB
        raise self.retry(exc=e, countdown=30)

    # Save report in a transaction
    with transaction.atomic():
        Report.objects.create(
            website=website,
            tracker_count=data["tracker_count"],
            cookie_count=data["cookie_count"],
            third_party_scripts=data["third_party_scripts"],  # ensure JSONField or serialized
            headers=data.get("headers", {}),
            privacy_score=data["score"],
            grade=data["grade"],
            evidence=data.get("evidence", {}),
            scanned_at=data["timestamp"]
        )
        website.last_scanned = timezone.now()
        website.save(update_fields=["last_scanned"])
