
/**
 * @file data_export_feature.jsx
 * @description A self-contained React/Node.js (Express) application prototype.
 * This file demonstrates a "Secure Data Export" feature where users can download
 * their habit tracking history as a CSV file.
 * 
 * FEATURES:
 * - In-memory user progress database.
 * - Backend CSV generation logic (without external heavy libraries).
 * - Secure file download handling using HTTP Headers (Content-Disposition).
 * - Frontend Blob handling to trigger downloads without page refreshes.
 */

// ===================================================================================
//
// ⚙️ MOCK DATABASE & DATA
//
// ===================================================================================

/**
 * @typedef {Object} ProgressLog
 * @property {number} id
 * @property {string} userId
 * @property {string} date - ISO Date string (YYYY-MM-DD)
 * @property {string} habit_name
 * @property {string} status - 'Completed' | 'Skipped' | 'Failed'
 * @property {number} points_earned
 */

/** @type {ProgressLog[]} */
const mockProgressData = [
  { id: 1, userId: 'user_777', date: '2023-10-01', habit_name: 'Morning Meditation', status: 'Completed', points_earned: 10 },
  { id: 2, userId: 'user_777', date: '2023-10-01', habit_name: 'Drink 2L Water', status: 'Completed', points_earned: 5 },
  { id: 3, userId: 'user_777', date: '2023-10-02', habit_name: 'Morning Meditation', status: 'Skipped', points_earned: 0 },
  { id: 4, userId: 'user_777', date: '2023-10-02', habit_name: 'Drink 2L Water', status: 'Completed', points_earned: 5 },
  { id: 5, userId: 'user_777', date: '2023-10-03', habit_name: 'Morning Meditation', status: 'Completed', points_earned: 10 },
  { id: 6, userId: 'user_777', date: '2023-10-03', habit_name: 'Read 20 Pages', status: 'Completed', points_earned: 15 },
  { id: 7, userId: 'user_999', date: '2023-10-01', habit_name: 'Morning Run', status: 'Completed', points_earned: 20 }, // Different User
];

// ===================================================================================
//
// ⚛️ REACT FRONTEND APPLICATION
//
// ===================================================================================

let React, useState;
try {
  React = require("react");
  ({ useState } = React);
} catch (e) {
  if (typeof window !== 'undefined' && window.React) {
    React = window.React;
    useState = React.useState;
  }
}

/**
 * Component: DataExportButton
 * Handles the secure fetching of the CSV blob and triggering the browser download.
 */
const DataExportButton = ({ userId }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      // 1. Secure Fetch Request
      // We use fetch instead of window.open to allow for future Auth headers (e.g., Authorization: Bearer token)
      const response = await fetch(`http://localhost:4003/api/export/csv/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ...' // This is where you'd pass the token in a real app
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // 2. Handle Binary Data (Blob)
      // The backend returns a stream (text/csv), so we convert it to a Blob
      const blob = await response.blob();
      
      // 3. Create Temporary Download Link
      // This trick triggers the browser's native download behavior without navigating away
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from header or default
      const disposition = response.headers.get('Content-Disposition');
      let filename = `habit_data_${userId}.csv`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // 4. Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Your Data</h3>
      <p className="text-sm text-gray-500 mb-6">
        Download a complete history of your habits, streaks, and points. 
        You own your data.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
           ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isDownloading}
        className={`
            w-full flex items-center justify-center px-4 py-3 rounded-xl font-bold text-white transition-all
            ${isDownloading 
                ? 'bg-gray-400 cursor-wait' 
                : 'bg-gray-900 hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]'
            }
        `}
      >
        {isDownloading ? (
             <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparing CSV...
             </div>
        ) : (
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Data (CSV)
            </div>
        )}
      </button>
      <p className="text-center text-xs text-gray-400 mt-3">Format: .csv (Excel compatible)</p>
    </div>
  );
};

/**
 * Main App Component
 */
const App = () => {
  // Simulate a logged-in user context
  const currentUser = { id: 'user_777', name: 'Jordan' };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center font-sans">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Account Settings</h1>
        
        <DataExportButton userId={currentUser.id} />
        
        <div className="mt-12 max-w-md text-center text-gray-400 text-sm">
            <p>Prototype Mode: Check console for download logs.</p>
        </div>
    </div>
  );
};

// ===================================================================================
//
// 🌐 NODE.JS (EXPRESS) BACKEND SERVER
//
// ===================================================================================

if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    const express = require('express');
    const cors = require('cors');
    const app = express();
    const PORT = 4003;

    app.use(cors());

    /**
     * Helper: Convert JSON Array to CSV String
     * Manually implemented to avoid external 'json2csv' dependency for this prototype.
     */
    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        
        // 1. Extract Headers
        const headers = Object.keys(data[0]);
        
        // 2. Map Rows
        const rows = data.map(row => {
            return headers.map(fieldName => {
                let val = row[fieldName] || '';
                // Escape quotes and wrap in quotes if it contains commas
                const stringVal = String(val);
                if (stringVal.includes(',') || stringVal.includes('"')) {
                    return `"${stringVal.replace(/"/g, '""')}"`;
                }
                return stringVal;
            }).join(',');
        });
        
        // 3. Combine
        return [headers.join(','), ...rows].join('\r\n');
    };

    /**
     * 1. EXPORT CSV ENDPOINT
     */
    app.get('/api/export/csv/:userId', (req, res) => {
        const { userId } = req.params;
        console.log(`[Backend] Received Export Request for: ${userId}`);

        // 1. Simulate DB Lookup (Filter mock data by user)
        const userLogs = mockProgressData.filter(log => log.userId === userId);

        if (userLogs.length === 0) {
            return res.status(404).json({ error: "No data found for this user." });
        }

        try {
            // 2. Format Data (Remove internal IDs if necessary, sanitize)
            const cleanData = userLogs.map(({ id, userId, ...rest }) => rest);

            // 3. Convert to CSV
            const csvString = convertToCSV(cleanData);

            // 4. Set Secure Download Headers
            // 'text/csv' tells the browser it's a CSV file
            res.setHeader('Content-Type', 'text/csv');
            // 'attachment' forces the browser to download instead of displaying text
            res.setHeader('Content-Disposition', `attachment; filename="habitforge_export_${userId}_${Date.now()}.csv"`);
            
            // 5. Send Stream
            res.status(200).send(csvString);
            console.log(`[Backend] Export Successful. Sent ${csvString.length} bytes.`);

        } catch (error) {
            console.error("Export Error:", error);
            res.status(500).json({ error: "Failed to generate export." });
        }
    });

    app.listen(PORT, () => {
        console.log(`\n📂 Data Export Prototype running on port ${PORT}`);
    });
}

if (typeof module !== 'undefined') { module.exports = App; }
