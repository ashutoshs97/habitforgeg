
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface CalorieLog {
  id: number;
  foodName: string;
  calories: number;
  timestamp: number;
}

interface AnalysisResult {
  food_item_name: string;
  calories_value_kcals: number;
}

const FoodScannerView: React.FC = () => {
  const [logs, setLogs] = useState<CalorieLog[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('habitForge_calorieLogs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
      
      const savedGoal = localStorage.getItem('habitForge_dailyCalorieGoal');
      if (savedGoal) {
          const parsed = parseInt(savedGoal, 10);
          if(!isNaN(parsed)) setDailyGoal(parsed);
      }
    } catch (e) {
      console.error("Failed to load calorie data", e);
    }

    const handleGoalUpdate = () => {
        const g = localStorage.getItem('habitForge_dailyCalorieGoal');
        if(g) setDailyGoal(parseInt(g, 10));
    };
    window.addEventListener('calorieGoalUpdated', handleGoalUpdate);
    return () => window.removeEventListener('calorieGoalUpdated', handleGoalUpdate);
  }, []);

  // Save logs to localStorage whenever they change and trigger event
  useEffect(() => {
    localStorage.setItem('habitForge_calorieLogs', JSON.stringify(logs));
    // Dispatch event to notify CalorieWidget
    window.dispatchEvent(new Event('calorieLogUpdated'));
  }, [logs]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const base64Image = await convertToBase64(file);
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
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
              text: "Analyze this image. Identify the main food item and estimate the calorie content for the portion displayed."
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
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
          },
          temperature: 0.4
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setAnalysisResult(data);
      } else {
        throw new Error("No response text from AI");
      }

    } catch (err: any) {
      console.error(err);
      setError("Could not identify food. Please try a clearer image or check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddLog = () => {
    if (!analysisResult) return;

    const newLog: CalorieLog = {
      id: Date.now(),
      foodName: analysisResult.food_item_name,
      calories: analysisResult.calories_value_kcals,
      timestamp: Date.now()
    };

    setLogs(prev => [newLog, ...prev]);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalCalories = logs.reduce((sum, item) => {
      // Filter for today only
      const itemDate = new Date(item.timestamp);
      const today = new Date();
      if(itemDate.getDate() === today.getDate() && 
         itemDate.getMonth() === today.getMonth() && 
         itemDate.getFullYear() === today.getFullYear()) {
          return sum + item.calories;
      }
      return sum;
  }, 0);
  
  const percentage = Math.min(100, (totalCalories / dailyGoal) * 100);

  return (
    <div className="animate-fade-in">
       <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden text-white relative mb-8 p-8 md:p-12">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                 <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                 </pattern>
                 <rect width="100%" height="100%" fill="url(#grid-pattern)" />
             </svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
                 <h2 className="text-3xl md:text-4xl font-extrabold mb-2">AI Food Scanner</h2>
                 <p className="text-indigo-200">Snap a photo of your meal to track calories instantly.</p>
             </div>
             <div className="text-right bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                 <div className="text-sm text-indigo-200 uppercase tracking-wider font-bold">Today's Calories</div>
                 <div className="text-3xl font-bold">{totalCalories} <span className="text-base font-normal opacity-70">/ {dailyGoal} kcal</span></div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Scanner */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-neutral-focus p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-neutral dark:text-white mb-4 flex items-center gap-2">
                      <span>📸</span> New Entry
                  </h3>
                  
                  {!previewUrl ? (
                      <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary transition group bg-base-200 dark:bg-neutral"
                      >
                          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <p className="font-medium text-gray-600 dark:text-gray-300">Click to upload photo</p>
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
                      <div className="rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-700 bg-black h-80 flex items-center justify-center">
                          <img src={previewUrl} alt="Preview" className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`} />
                          
                          {isAnalyzing && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white z-20">
                                  <div className="relative w-16 h-16 mb-4">
                                      <div className="absolute inset-0 border-4 border-gray-500 rounded-full"></div>
                                      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                  <span className="font-bold tracking-wide animate-pulse text-lg drop-shadow-lg">Analyzing Food...</span>
                                  <span className="text-xs text-gray-300 mt-2 font-medium drop-shadow-md">Powered by Gemini AI</span>
                              </div>
                          )}

                          {!isAnalyzing && (
                            <button 
                                onClick={() => { setPreviewUrl(null); setAnalysisResult(null); setError(null); }}
                                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition z-10"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          )}
                      </div>
                  )}

                  {error && (
                      <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-4 rounded-xl text-sm flex items-start gap-3 animate-pop-in shadow-sm">
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <div>
                              <p className="font-bold">Analysis Failed</p>
                              <p>{error}</p>
                          </div>
                      </div>
                  )}

                  {analysisResult && (
                      <div className="mt-6 animate-slide-in-up">
                          <div className="bg-base-200 dark:bg-neutral border border-primary/20 rounded-xl p-5 flex justify-between items-center">
                              <div>
                                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Identified Item</p>
                                  <h4 className="text-2xl font-bold text-neutral dark:text-white">{analysisResult.food_item_name}</h4>
                              </div>
                              <div className="text-right">
                                  <span className="text-3xl font-bold text-primary">{analysisResult.calories_value_kcals}</span>
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">kcal</span>
                              </div>
                          </div>
                          <button 
                              onClick={handleAddLog}
                              className="w-full mt-4 bg-primary hover:bg-primary-focus text-white font-bold py-3 px-4 rounded-xl transition-transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2"
                          >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              Add to Daily Log
                          </button>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Column: Logs */}
          <div className="lg:col-span-1 h-full">
              <div className="bg-white dark:bg-neutral-focus p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col min-h-[500px]">
                  <h3 className="text-xl font-bold text-neutral dark:text-white mb-6">Today's Log</h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className={`font-bold ${percentage > 100 ? 'text-error' : 'text-success'}`}>{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full bg-base-300 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-error' : 'bg-success'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {logs.filter(item => {
                        const itemDate = new Date(item.timestamp);
                        const today = new Date();
                        return itemDate.getDate() === today.getDate() && 
                               itemDate.getMonth() === today.getMonth() && 
                               itemDate.getFullYear() === today.getFullYear();
                    }).length === 0 ? (
                        <div className="text-center text-gray-400 py-12 italic">
                            <div className="text-4xl mb-2">🍽️</div>
                            No meals logged today.
                        </div>
                    ) : (
                        logs.filter(item => {
                            const itemDate = new Date(item.timestamp);
                            const today = new Date();
                            return itemDate.getDate() === today.getDate() && 
                                   itemDate.getMonth() === today.getMonth() && 
                                   itemDate.getFullYear() === today.getFullYear();
                        })
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-base-200 dark:bg-neutral rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm">
                                    🍎
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-neutral dark:text-gray-200 line-clamp-1">{log.foodName}</div>
                                    <div className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                            </div>
                            <div className="font-bold text-sm text-neutral dark:text-gray-300 whitespace-nowrap">{log.calories} kcal</div>
                        </div>
                        ))
                    )}
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};

export default FoodScannerView;
