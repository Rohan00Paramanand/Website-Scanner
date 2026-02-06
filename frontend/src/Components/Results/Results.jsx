import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axiosClient";
import "./Results.css";

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { websiteId } = location.state || {};
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!websiteId) {
            setError("No website ID provided.");
            setLoading(false);
            return;
        }

        let attempts = 0;
        const maxAttempts = 30;
        const pollInterval = 2000;

        const pollReports = async () => {
            try {
                const response = await axios.get(`reports/?website=${websiteId}`);
                if (response.data.length > 0) {
                    // Sort by newest first
                    const sortedReports = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setReports(sortedReports);
                    setLoading(false);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(pollReports, pollInterval);
                } else {
                    setLoading(false);
                    setError("Scan timed out or no reports found yet.");
                }
            } catch (err) {
                console.error("Error fetching reports:", err);
                setLoading(false);
                setError("Failed to fetch reports.");
            }
        };

        pollReports();
    }, [websiteId]);

    const getGradeColor = (grade) => {
        const colors = {
            'A': 'text-green-400',
            'B': 'text-blue-400',
            'C': 'text-yellow-400',
            'D': 'text-orange-400',
            'F': 'text-red-500'
        };
        return colors[grade] || 'text-gray-400';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h2 className="text-xl font-light tracking-wide">Scanning Website...</h2>
                <p className="text-gray-400 text-sm mt-2">Analyzing trackers, cookies, and security headers</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
                <div className="glass-panel p-8 rounded-xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Scan Failed</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const latestReport = reports[0];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate("/")}
                    className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Score Card */}
                    <div className="glass-panel p-8 rounded-2xl lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold mb-2">Privacy Audit Results</h1>
                            <p className="text-gray-400 mb-6">Scan completed on {new Date(latestReport.created_at).toLocaleString()}</p>
                        </div>

                        <div className="flex items-end gap-6">
                            <div className="text-center">
                                <div className={`text-8xl font-black ${getGradeColor(latestReport.grade)}`}>
                                    {latestReport.grade}
                                </div>
                                <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Overall Grade</div>
                            </div>
                            <div className="h-24 w-px bg-gray-700 mx-4"></div>
                            <div>
                                <div className="text-5xl font-bold mb-1">{latestReport.privacy_score}</div>
                                <div className="text-sm text-gray-400">Privacy Score / 100</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold text-red-400">{latestReport.tracker_count}</div>
                                <div className="text-sm text-gray-400">Trackers Blocked</div>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold text-orange-400">{latestReport.cookie_count}</div>
                                <div className="text-sm text-gray-400">Cookies Found</div>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Evidence */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                            Third-Party Domains
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {latestReport.evidence?.third_party_domains?.length > 0 ? (
                                latestReport.evidence.third_party_domains.map((domain, idx) => (
                                    <div key={idx} className="glass-card p-3 rounded-lg flex items-center justify-between">
                                        <span className="text-gray-300">{domain}</span>
                                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Tracker</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No third-party domains detected.</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
                            Network Requests
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {latestReport.evidence?.network_requests?.length > 0 ? (
                                latestReport.evidence.network_requests.slice(0, 50).map((req, idx) => (
                                    <div key={idx} className="glass-card p-3 rounded-lg">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-mono text-blue-400">{req.method}</span>
                                            <span className="text-xs text-gray-500">{req.resource_type}</span>
                                        </div>
                                        <div className="text-sm text-gray-300 truncate" title={req.url}>
                                            {req.url}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No network requests captured.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;
