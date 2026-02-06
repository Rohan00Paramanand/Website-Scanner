import React, { useState } from "react";
import axios from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import "./Scanner.css";

const Scanner = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReports([]);

    try {
      // Ensure CSRF cookie present for authenticated requests
      await axios.get("csrf/");
      // 1. Create Website
      const createResponse = await axios.post("websites/", {
        url: url,
        name: name,
      });
      const websiteId = createResponse.data.id;

      // 2. Trigger Scan
      await axios.post(`websites/${websiteId}/scan/`);

      // Redirect to results page immediately
      navigate("/results", { state: { websiteId } });

    } catch (err) {
      console.error("Scan failed:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Session expired or unauthorized. Please log in again.");
        // Optional: redirect to login or clear auth state here if you have access to context/hooks
        // For now, just showing the message is safer than a hard redirect without context
      } else {
        setError("Failed to start scan. Please check your input and try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div id="scanner-section" className="scanner-container">
      <h2 className="scanner-title">Website Scanner</h2>
      <form onSubmit={handleScan} className="scanner-form">
        <div className="form-group">
          <label htmlFor="name">Website Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website Name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="url">Website URL</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Website URL"
            required
          />
        </div>
        <button type="submit" className="scan-button" disabled={loading}>
          {loading ? "Scanning..." : "Start Scan"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {reports.length > 0 && (
        <div className="results-container">
          <h3>Scan Results</h3>
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <h4>Report #{report.id}</h4>
                <p>
                  <strong>Status:</strong> {report.status || "Completed"}
                </p>
                <pre>{JSON.stringify(report.data, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
