
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';

// API Configuration
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface AnalysisResult {
  habit_to_refine: string;
  failure_rate_percent: number;
  refinement_suggestion: string;
  rationale: string;
}

const GoalRefinementView: React.FC = () => {
  const { state } = useHabits();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
        if (state.habits.length === 0) {
            throw new Error("You don't have any habits to analyze yet! Add some habits and track them for a few days.");
        }

        // Prepare data for Backend
        const habitData = state.habits.map(h => ({
            name: h.name,
            streak: h.streak,
            completionCount: h.completionHistory.length,
            lastCompleted: h.completionHistory[h.completionHistory.length - 1] || 'Never',
            completionHistory: h.completionHistory.slice(-30) 
        }));

        // Call Unified Backend
        const response = await fetch(`${API_URL}/api/refine-goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitData })
        });

        if (!response.ok) {
            throw new Error("Backend analysis failed.");
        }

        const result = await response.json();
        setAnalysis(result);

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to analyze goals.");
    } finally {
        setIsLoading(false);
    }
  };

  // ... (Rest of the UI/JSX is identical to previous version) ...
  return (
    <div className="animate-fade-in">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl shadow-2xl overflow-hidden text-white relative mb-8 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
                        <span>🧬</span> AI Goal Refinement
                    </h2>
                    <p className="text-indigo-100 text-lg max-w-xl">
                        Struggling to stick to a habit? Our AI analyzes your tracking history to find failure patterns and suggests smarter, easier goals.
                    </p>
                </div>
                {!analysis && !isLoading && (
                    <button 
                        onClick={handleAnalyze}
                        className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 whitespace-nowrap"
                    >
                        Analyze My Habits
                    </button>
                )}
            </div>
        </div>

        <div className="max-w-3xl mx-auto">
            {isLoading && (
                <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-12 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral dark:text-white mb-2">Crunching the Numbers...</h3>
                    <p className="text-gray-500 dark:text-gray-400">Identifying behavior patterns in your logs.</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl flex items-start gap-4 text-red-600 dark:text-red-300">
                    <div className="text-2xl">⚠️</div>
                    <div>
                        <h3 className="font-bold text-lg">Analysis Failed</h3>
                        <p>{error}</p>
                        <button onClick={handleAnalyze} className="font-bold hover:underline mt-2">Try Again</button>
                    </div>
                </div>
            )}

            {analysis && (
                <div className="animate-slide-in-up space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-2xl p-6">
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Habit to Refine</p>
                            <h3 className="text-2xl font-bold text-neutral dark:text-white">{analysis.habit_to_refine}</h3>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-6">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Estimated Struggle</p>
                            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{analysis.failure_rate_percent}% <span className="text-sm font-normal text-neutral dark:text-gray-400">failure rate</span></h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-focus border border-indigo-100 dark:border-gray-700 rounded-3xl p-8 relative shadow-lg overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                        
                        <div className="flex items-start gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Suggested Refinement</h3>
                                <p className="text-2xl font-medium text-neutral dark:text-white mb-6 leading-snug">"{analysis.refinement_suggestion}"</p>
                                
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">The Logic</h4>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.rationale}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => setAnalysis(null)}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Dismiss
                        </button>
                        <button 
                            onClick={() => {
                                alert("In the full version, this would open the habit editor to apply the change!");
                            }}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105"
                        >
                            Apply Change
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default GoalRefinementView;
