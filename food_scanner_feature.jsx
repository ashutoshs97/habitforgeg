
/**
 * @file food_scanner_feature.jsx
 * @description A self-contained MERN stack prototype for a "Food Item Scanner" feature.
 * 
 * ARCHITECTURE:
 * - Frontend: React components for Image Upload, Analysis Display, and Calorie Logging.
 * - Backend: Express server integrating Google Gemini 2.5 Flash for multimodal image analysis.
 * - Database: In-memory simulation for user calorie logs.
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

// Simulated Database
const mockDB = {
  user: {
    id: 'user_123',
    name: 'Alex',
    dailyCalorieGoal: 2500
  },
  // Logs array stores: { id, foodName, calories, timestamp }
  calorieLogs: [
    { id: 1, foodName: "Oatmeal & Blueberries", calories: 350, timestamp: new Date().setHours(8, 0, 0) },
    { id: 2, foodName: "Grilled Chicken Salad", calories: 450, timestamp: new Date().setHours(13, 0, 0) }
  ]
};

// ===================================================================================
//
// ⚛️ REACT FRONTEND APPLICATION
//
// ===================================================================================

let React, useState, useEffect, useRef;
try {
  React = require("react");
  ({ useState, useEffect, useRef } = React);
} catch (e) {
  if (typeof window !== 'undefined' && window.React) {
    React = window.React;
    useState = React.useState;
    useEffect = React.useEffect;
    useRef = React.useRef;
  }
}

/**
 * Utility: Convert File object to Base64 string
 */
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // Returns "data:image/png;base64,..."
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Component: CalorieLogTable
 * Displays the daily history and calculates totals.
 */
const CalorieLogTable = ({ logs }) => {
  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
  const percentage = Math.min(100, (totalCalories / mockDB.user.dailyCalorieGoal) * 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Daily Log</h3>
          <p className="text-sm text-gray-500">Today's Nutrition</p>
        </div>
        <div className="text-right">
           <div className="text-3xl font-extrabold text-green-600">{totalCalories}</div>
           <div className="text-xs text-gray-400 font-semibold uppercase">kcal consumed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
        <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`} 
            style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8 italic">No meals logged yet.</div>
        ) : (
            logs.map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">
                        🍽️
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{log.foodName}</div>
                        <div className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                </div>
                <div className="font-bold text-gray-700">{log.calories} kcal</div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

/**
 * Component: DashboardScanner
 * Handles Image Upload -> Analysis -> Confirmation
 */
const DashboardScanner = ({ onLogAdded }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Handle File Selection
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      // Convert to Base64 for API
      const base64Image = await convertToBase64(file);

      // Call Backend API
      const response = await fetch('http://localhost:4002/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      if (!response.ok) throw new Error('Failed to analyze image');
      
      const data = await response.json();
      setAnalysisResult(data); // Expects: { food_item_name, calories_value_kcals }

    } catch (err) {
      console.error(err);
      setError("Could not identify food. Please try a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle "Add to Log"
  const handleAddLog = async () => {
    if (!analysisResult) return;

    try {
        const response = await fetch('http://localhost:4002/api/log-calories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                food_item_name: analysisResult.food_item_name,
                calories_value_kcals: analysisResult.calories_value_kcals,
                user_id: mockDB.user.id
            })
        });
        
        const updatedLogs = await response.json();
        onLogAdded(updatedLogs);
        
        // Reset State
        setPreviewUrl(null);
        setAnalysisResult(null);
        if(fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
        console.error(err);
        setError("Failed to save log.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>📸</span> AI Food Scanner
        </h3>
        <p className="text-gray-500 text-sm mb-6">Upload a photo of your meal. Gemini AI will estimate the calories.</p>

        {/* Image Upload Area */}
        {!previewUrl ? (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition group"
            >
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <p className="font-medium text-gray-600">Click to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
            </div>
        ) : (
            <div className="rounded-xl overflow-hidden relative border border-gray-200 bg-gray-900 h-64 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain opacity-80" />
                
                {isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white">
                        <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-semibold tracking-wide animate-pulse">Analyzing with Gemini...</span>
                    </div>
                )}

                <button 
                    onClick={() => { setPreviewUrl(null); setAnalysisResult(null); }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        )}

        {/* Analysis Results */}
        {error && (
            <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
            </div>
        )}

        {analysisResult && (
            <div className="mt-6 animate-slide-in-up">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Identified Item</p>
                    <div className="flex justify-between items-end">
                        <h4 className="text-2xl font-bold text-gray-800">{analysisResult.food_item_name}</h4>
                        <span className="text-xl font-bold text-blue-600">{analysisResult.calories_value_kcals} <span className="text-sm font-medium text-blue-400">kcal</span></span>
                    </div>
                </div>
                <button 
                    onClick={handleAddLog}
                    className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2"
                >
                    <span>➕</span> Add to Daily Log
                </button>
            </div>
        )}
    </div>
  );
};

/**
 * Main App Component
 */
const App = () => {
  const [logs, setLogs] = useState([]);

  // Initial Data Fetch (Mock)
  useEffect(() => {
    setLogs(mockDB.calorieLogs);
  }, []);

  const handleLogUpdate = (updatedLogs) => {
    setLogs(updatedLogs);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Nutrition Tracker</h1>
        <p className="text-gray-500 mt-2">Multimodal AI food scanning powered by Gemini.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Scanner */}
        <div className="lg:col-span-2">
            <DashboardScanner onLogAdded={handleLogUpdate} />
        </div>

        {/* Right Column: Logs */}
        <div className="h-full min-h-[500px]">
            <CalorieLogTable logs={logs} />
        </div>
      </main>
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
    const { GoogleGenAI, Type } = require("@google/genai"); // Official SDK

    const app = express();
    const PORT = 4002;

    app.use(cors());
    app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

    /**
     * 1. SCAN FOOD ENDPOINT (Multimodal Analysis)
     */
    app.post('/api/scan-food', async (req, res) => {
        console.log("[Backend] Received Image Analysis Request...");
        const { imageBase64 } = req.body; // "data:image/png;base64,..."

        if (!imageBase64) {
            return res.status(400).json({ error: "No image data provided" });
        }

        try {
            // 1. Initialize SDK with the Constant Key
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            
            // 2. Prepare Image Part
            // Extract the actual base64 data (remove "data:image/xxx;base64," prefix)
            const base64Data = imageBase64.split(',')[1];
            // Detect mime type from the prefix
            const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));

            // 3. Configure Response Schema for Strict JSON
            const foodSchema = {
                type: Type.OBJECT,
                properties: {
                    food_item_name: { 
                        type: Type.STRING,
                        description: "The generic name of the food item identified in the image."
                    },
                    calories_value_kcals: { 
                        type: Type.INTEGER,
                        description: "The estimated calorie count for the portion shown."
                    }
                },
                required: ["food_item_name", "calories_value_kcals"]
            };

            // 4. Call GenerateContent
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        },
                        {
                            text: "Analyze this image. Identify the main food item and estimate the calorie content for the portion displayed. Return ONLY a JSON object."
                        }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: foodSchema,
                    temperature: 0.4 // Lower temperature for more factual/stable answers
                }
            });

            // 5. Parse and Return
            const analysis = JSON.parse(response.text);
            console.log("[Backend] Analysis Success:", analysis);
            res.json(analysis);

        } catch (error) {
            console.error("[Backend] Gemini Error:", error);
            res.status(500).json({ error: "AI Analysis Failed", details: error.message });
        }
    });

    /**
     * 2. LOG CALORIES ENDPOINT
     */
    app.post('/api/log-calories', (req, res) => {
        const { food_item_name, calories_value_kcals, user_id } = req.body;

        const newLog = {
            id: Date.now(),
            foodName: food_item_name,
            calories: calories_value_kcals,
            timestamp: Date.now()
        };

        mockDB.calorieLogs.push(newLog);
        
        // Sort logs by newest first for the UI
        const sortedLogs = [...mockDB.calorieLogs].sort((a, b) => b.timestamp - a.timestamp);
        
        console.log(`[Backend] Logged: ${food_item_name} (${calories_value_kcals} kcal)`);
        res.json(sortedLogs);
    });

    app.listen(PORT, () => {
        console.log(`\n🥗 Food Scanner Prototype running on port ${PORT}`);
    });
}

if (typeof module !== 'undefined') { module.exports = App; }
