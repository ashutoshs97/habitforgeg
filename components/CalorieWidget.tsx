
import React, { useState, useEffect } from 'react';

interface CalorieLog {
  id: number;
  foodName: string;
  calories: number;
  timestamp: number;
}

const CalorieWidget: React.FC = () => {
  const [todayCalories, setTodayCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("2500");

  const calculateCalories = () => {
    try {
      const savedLogs = localStorage.getItem('habitForge_calorieLogs');
      if (savedLogs) {
        const logs: CalorieLog[] = JSON.parse(savedLogs);
        const today = new Date();
        
        const total = logs.reduce((sum, item) => {
          const itemDate = new Date(item.timestamp);
          if (
            itemDate.getDate() === today.getDate() && 
            itemDate.getMonth() === today.getMonth() && 
            itemDate.getFullYear() === today.getFullYear()
          ) {
            return sum + item.calories;
          }
          return sum;
        }, 0);
        
        setTodayCalories(total);
      }
    } catch (e) {
      console.error("Error calculating calories", e);
    }
  };

  useEffect(() => {
    // Load Goal
    const storedGoal = localStorage.getItem('habitForge_dailyCalorieGoal');
    if (storedGoal) {
        const parsed = parseInt(storedGoal, 10);
        if (!isNaN(parsed)) {
            setDailyGoal(parsed);
            setInputValue(storedGoal);
        }
    }

    calculateCalories();

    // Listen for storage events (triggered by FoodScannerView or other tabs)
    const handleUpdate = () => {
        calculateCalories();
        // Also check for goal updates from other components
        const currentStoredGoal = localStorage.getItem('habitForge_dailyCalorieGoal');
        if (currentStoredGoal) setDailyGoal(parseInt(currentStoredGoal, 10));
    };
    
    window.addEventListener('calorieLogUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('calorieGoalUpdated', handleUpdate);
    
    const interval = setInterval(calculateCalories, 2000);

    return () => {
      window.removeEventListener('calorieLogUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('calorieGoalUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleSave = () => {
      const newGoal = parseInt(inputValue, 10);
      if (!isNaN(newGoal) && newGoal > 0) {
          setDailyGoal(newGoal);
          localStorage.setItem('habitForge_dailyCalorieGoal', newGoal.toString());
          window.dispatchEvent(new Event('calorieGoalUpdated'));
      } else {
          setInputValue(dailyGoal.toString());
      }
      setIsEditing(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSave();
      }
      if (e.key === 'Escape') {
          setIsEditing(false);
          setInputValue(dailyGoal.toString());
      }
  }

  const percentage = Math.min(100, (todayCalories / dailyGoal) * 100);

  return (
    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Today's Calories</h3>
                {!isEditing && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
                        className="text-indigo-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Goal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                )}
            </div>
            
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">{todayCalories}</span>
                <span className="text-indigo-200 font-medium flex items-center">
                    /&nbsp;
                    {isEditing ? (
                        <div className="flex items-center">
                            <input 
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="w-20 bg-black/20 text-white border border-white/30 rounded px-1 py-0 text-xl font-bold focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50"
                            />
                        </div>
                    ) : (
                        <span 
                            onClick={() => setIsEditing(true)} 
                            className="cursor-pointer hover:text-white hover:underline decoration-dashed decoration-white/40 underline-offset-4 transition-colors"
                            title="Click to set daily goal"
                        >
                            {dailyGoal} kcal
                        </span>
                    )}
                </span>
            </div>
            
            {/* Mini Progress Bar */}
            <div className="w-full bg-black/20 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                    className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    </div>
  );
};

export default CalorieWidget;
