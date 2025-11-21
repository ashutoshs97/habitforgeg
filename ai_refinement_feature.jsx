
/**
 * @file ai_refinement_feature.jsx
 * @description A self-contained MERN stack prototype for an "AI-Powered Goal Refinement" feature.
 * 
 * ARCHITECTURE:
 * - Frontend: React component to trigger analysis and display strategic advice.
 * - Backend: Express server integrating Google Gemini 2.5 Flash for behavioral data analysis.
 * - Database: In-memory simulation of 30-day habit logs showing specific failure patterns.
 * 
 * HOW TO RUN:
 * This file is designed to be run in a Node.js environment.
 * Ensure you have installed: express, cors, @google/genai, react, react-dom
 */

// ===================================================================================
//
// ⚙️ MOCK DATABASE & CONFIGURATION
//
// ===================================================================================

const GEMINI_API_KEY = "AIzaSyAQNW-Eh3JvlDGLHh4kcj83YCujSat61-0";

// Simulated User Habits
const mockHabits = [
  { id: 101, name: "6 AM HIIT Workout", category: "Health" },
  { id: 102, name: "Read 10 Pages", category: "Mindfulness" },
  { id: 103, name: "No Sugar", category: "Diet" }
];

// Simulated 30-Day Log Data
// PATTERN: 
// - Habit 101 (Workout) fails frequently on weekdays (Mon-Fri), succeeds on Weekends.
// - Habit 102 (Read) succeeds 90% of the time.
const mockHabitLogs = (() => {
    const logs = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
        const dateString = date.toISOString().split('T')[0];

        // Habit 101: 6 AM Workout
        // Fails (completed: false) on weekdays (1-5), Succeeds on weekends (0, 6)
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        logs.push({
            habit_id: 101,
            habit_name: "6 AM HIIT Workout",
            date: dateString,
            completed: isWeekend ? true : Math.random() > 0.8 // 20% chance on weekdays
        });

        // Habit 102: Reading
        // High success rate
        logs.push({
            habit_id: 102,
            habit_name: "Read 10 Pages",
            date: dateString,
            completed: Math.random() > 0.1
        });
    }
    return logs;
})();

// ===================================================================================
//
// ⚛️ REACT FRONTEND APPLICATION
//
// ===================================================================================

let React, useState, useEffect;
try {
  React = require("react");
  ({ useState, useEffect } = React);
} catch (e) {
  if (typeof window !== 'undefined' && window.React) {
    React = window.React;
    useState = React.useState;
    useEffect = React.useEffect;
  }
}

/**
 * Component: GoalRefinementCard
 * Triggers AI analysis and displays the result.
 */
const GoalRefinementCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
        const response = await fetch('http://localhost:4004/api/refine-goal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 'user_demo' })
        });

        if (!response.ok) {
            throw new Error("Analysis failed. Server might be offline.");
        }

        const data = await response.json();
        setAnalysis(data);
    } catch (err) {
        console.error(err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
                    <span className="text-4xl">🧬</span> AI Goal Refinement
                </h2>
                <p className="text-blue-100 text-lg max-w-md">
                    Our AI analyzes your failure patterns to suggest smarter, more achievable goals.
                </p>
            </div>
        </div>

        <div className="p-8">
            {!analysis && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-8 text-lg">
                        Ready to optimize your routine? We'll analyze your last 30 days of activity.
                    </p>
                    <button 
                        onClick={handleAnalyze}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-indigo-200 transition-transform transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        Analyze My Goals
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="text-center py-12">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Crunching the Numbers...</h3>
                    <p className="text-gray-500">Identifying behavior patterns in your logs.</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                    <div className="text-2xl">⚠️</div>
                    <div>
                        <h3 className="font-bold text-lg">Analysis Failed</h3>
                        <p>{error}</p>
                        <button onClick={handleAnalyze} className="text-indigo-600 font-bold hover:underline mt-2">Try Again</button>
                    </div>
                </div>
            )}

            {analysis && (
                <div className="animate-fade-in-up space-y-6">
                    {/* Stat Card */}
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl p-5">
                            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Habit to Refine</p>
                            <h3 className="text-xl font-bold text-gray-900">{analysis.habit_to_refine}</h3>
                        </div>
                        <div className="flex-1 bg-red-50 border border-red-100 rounded-2xl p-5">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Failure Rate</p>
                            <h3 className="text-xl font-bold text-red-600">{analysis.failure_rate_percent}%</h3>
                        </div>
                    </div>

                    {/* Main Insight */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative">
                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-2 rounded-lg shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        
                        <h3 className="text-lg font-bold text-indigo-900 mb-2">Suggested Refinement</h3>
                        <p className="text-xl font-medium text-gray-800 mb-6">"{analysis.refinement_suggestion}"</p>
                        
                        <div className="bg-white rounded-xl p-4 border border-indigo-100/50">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">The Logic</h4>
                            <p className="text-gray-600 leading-relaxed">{analysis.rationale}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">
                            Dismiss
                        </button>
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                            Apply Change
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

/**
 * Main App Component
 */
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans flex items-center justify-center">
        <GoalRefinementCard />
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
    const { GoogleGenAI, Type } = require("@google/genai");

    const app = express();
    const PORT = 4004;

    app.use(cors());
    app.use(express.json());

    /**
     * GOAL REFINEMENT ENDPOINT
     * Securely analyzes user logs to find patterns.
     */
    app.post('/api/refine-goal', async (req, res) => {
        const { user_id } = req.body;
        console.log(`[Backend] Received refinement request for ${user_id}...`);

        // 1. Retrieve User Logs (Simulated)
        // In a real app, we would query MongoDB here using user_id
        const userLogs = mockHabitLogs;

        try {
            // 2. Initialize AI Client
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

            // 3. Construct Prompt
            // We provide the raw logs and ask the AI to act as a data analyst
            const systemInstruction = `
                You are an expert Behavioral Data Analyst for a habit-tracking application. 
                Your goal is to identify the user's biggest pain point and suggest a concrete, easier alternative.
            `;

            const prompt = `
                Analyze the provided JSON log data representing the last 30 days of habit activity.
                
                Task:
                1. Calculate the success rate for each habit.
                2. Identify the single habit with the LOWEST success rate.
                3. Analyze the context (e.g., does it fail on weekdays vs weekends? Is the time too early?).
                4. Generate a 'Refinement Suggestion' that lowers the barrier to entry (e.g., changing time, reducing duration).
                
                Data:
                ${JSON.stringify(userLogs)}
            `;

            // 4. Define Strict Output Schema
            const refinementSchema = {
                type: Type.OBJECT,
                properties: {
                    habit_to_refine: { 
                        type: Type.STRING,
                        description: "The name of the habit performing poorly."
                    },
                    failure_rate_percent: { 
                        type: Type.INTEGER,
                        description: "The percentage of times this habit was failed/skipped."
                    },
                    refinement_suggestion: { 
                        type: Type.STRING,
                        description: "A specific, actionable change to the habit (e.g., 'Move to 7 AM' or 'Start with 5 mins')."
                    },
                    rationale: { 
                        type: Type.STRING,
                        description: "A brief explanation of why this change will help, based on the data pattern."
                    }
                },
                required: ["habit_to_refine", "failure_rate_percent", "refinement_suggestion", "rationale"]
            };

            // 5. Call Gemini API
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: refinementSchema,
                    temperature: 0.2 // Low temperature for analytical precision
                }
            });

            // 6. Parse and Return
            const result = JSON.parse(response.text);
            console.log("[Backend] Analysis Complete:", result.habit_to_refine);
            
            // Simulate network delay for UI effect
            setTimeout(() => res.json(result), 1000);

        } catch (error) {
            console.error("[Backend] AI Error:", error);
            res.status(500).json({ error: "Failed to analyze goals." });
        }
    });

    app.listen(PORT, () => {
        console.log(`\n🧬 AI Refinement Prototype running on port ${PORT}`);
    });
}

if (typeof module !== 'undefined') { module.exports = App; }
