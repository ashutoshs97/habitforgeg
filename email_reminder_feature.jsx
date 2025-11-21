
/**
 * @file email_reminder_feature.jsx
 * @description A self-contained MERN stack prototype for an "Email Reminder" feature.
 * 
 * ARCHITECTURE:
 * - Frontend: React component to subscribe to notifications and trigger test emails.
 * - Backend: Express server simulating an SMTP transport (Nodemailer) to send emails.
 * 
 * HOW TO RUN:
 * This file is designed to be run in a Node.js environment.
 * Ensure you have installed: express, cors, react, react-dom
 */

// ===================================================================================
//
// ⚙️ MOCK DATABASE & CONFIGURATION
//
// ===================================================================================

// Simulated Subscribers DB
const mockSubscribers = [
    { email: 'alex@example.com', time: '09:00', active: true },
    { email: 'jordan@example.com', time: '20:00', active: false }
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
 * Component: EmailReminderSettings
 */
const EmailReminderSettings = () => {
  const [email, setEmail] = useState('alex@example.com');
  const [time, setTime] = useState('09:00');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
        const res = await fetch('http://localhost:4005/api/reminders/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, time, active: true })
        });
        const data = await res.json();
        setIsSubscribed(true);
        setStatusMsg(data.message);
    } catch (e) {
        setStatusMsg("Error subscribing.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    setIsLoading(true);
    try {
        const res = await fetch('http://localhost:4005/api/reminders/send-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        setStatusMsg(data.message);
    } catch (e) {
        setStatusMsg("Error sending test email.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Email Reminders</h1>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Reminder Time</label>
                    <input 
                        type="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Processing...' : (isSubscribed ? 'Update Settings' : 'Enable Reminders')}
                </button>

                <div className="pt-4 border-t border-gray-100">
                    <button 
                        onClick={handleSendTest}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                        Send Test Email Now
                    </button>
                </div>

                {statusMsg && (
                    <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg text-center animate-pulse">
                        {statusMsg}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

/**
 * Main App Component
 */
const App = () => {
  return <EmailReminderSettings />;
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
    const PORT = 4005;

    app.use(cors());
    app.use(express.json());

    // --- Mock Nodemailer Transport ---
    // In production, use: const nodemailer = require('nodemailer');
    const mockSendEmail = async (to, subject, html) => {
        console.log("\n--- 📧 EMAIL SENT (MOCKED) ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
        console.log("------------------------------\n");
        return true;
    };

    /**
     * 1. SUBSCRIBE ENDPOINT
     */
    app.post('/api/reminders/subscribe', (req, res) => {
        const { email, time, active } = req.body;
        const index = mockSubscribers.findIndex(s => s.email === email);
        
        if (index >= 0) {
            mockSubscribers[index] = { email, time, active };
        } else {
            mockSubscribers.push({ email, time, active });
        }
        
        console.log(`[Backend] Subscribed ${email} for ${time}`);
        res.json({ success: true, message: `Reminders set for ${time}` });
    });

    /**
     * 2. SEND TEST EMAIL ENDPOINT
     */
    app.post('/api/reminders/send-test', async (req, res) => {
        const { email } = req.body;
        
        try {
            await mockSendEmail(
                email,
                "HabitForge Reminder: Time to crush it! 💪",
                "<p>Hey! This is your test reminder. <strong>Don't forget to log your habits today!</strong></p>"
            );
            res.json({ success: true, message: `Test email sent to ${email}` });
        } catch (error) {
            res.status(500).json({ error: "Failed to send email" });
        }
    });

    app.listen(PORT, () => {
        console.log(`\n📧 Email Reminder Prototype running on port ${PORT}`);
    });
}

if (typeof module !== 'undefined') { module.exports = App; }
