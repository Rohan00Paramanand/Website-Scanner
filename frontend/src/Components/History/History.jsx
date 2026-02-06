import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosClient";
import "../Results/Results.css"; // Reuse premium styles

const History = () => {
    const navigate = useNavigate();
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get("websites/");
                // Sort by last scanned
                const sorted = response.data.sort((a, b) => new Date(b.last_scanned) - new Date(a.last_scanned));
                setWebsites(sorted);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("Failed to load scan history.");
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h2 className="text-xl font-light tracking-wide">Loading History...</h2>
            </div>
        );
    }

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

                <h1 className="text-3xl font-bold mb-8">Scan History</h1>

                {error && (
                    <div className="glass-panel p-4 rounded-lg text-red-400 mb-6 border-red-500/20 bg-red-500/10">
                        {error}
                    </div>
                )}

                {websites.length === 0 ? (
                    <div className="glass-panel p-12 rounded-xl text-center">
                        <p className="text-gray-400 text-lg mb-4">No scans found.</p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Start a New Scan
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {websites.map((site) => (
                            <div
                                key={site.id}
                                className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                                onClick={() => navigate("/results", { state: { websiteId: site.id } })}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold truncate pr-4" title={site.url}>
                                        {site.name || site.url}
                                    </h3>
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <div className="text-sm text-gray-400 mb-2">
                                    {site.url}
                                </div>
                                <div className="text-xs text-gray-500 mt-4 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Last scanned: {site.last_scanned ? new Date(site.last_scanned).toLocaleDateString() : 'Never'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
