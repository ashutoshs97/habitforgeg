
import React from 'react';
import { useHabits } from '../context/HabitContext';

const PointTrackerWidget: React.FC = () => {
  const { state } = useHabits();
  const { user } = state;
  const pointsForNextLevel = 100;
  const pointsInCurrentLevel = user.willpowerPoints % pointsForNextLevel;
  const percentage = Math.min(100, (pointsInCurrentLevel / pointsForNextLevel) * 100);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800 h-full flex flex-col justify-between relative overflow-hidden">
      {/* Background Element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 dark:bg-blue-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
      
      <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-xs uppercase tracking-wider opacity-70">Current Level</h3>
            <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                LVL {user.level}
            </span>
          </div>
          <div className="text-3xl font-extrabold">{user.willpowerPoints} <span className="text-sm font-medium opacity-70">WP</span></div>
      </div>
      
      <div className="mt-4 relative z-10">
          <div className="flex justify-between text-xs font-semibold mb-1 opacity-80">
              <span>Next Level</span>
              <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800/50 rounded-full h-2 overflow-hidden">
             <div 
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-1000 ease-out" 
                style={{width: `${percentage}%`}}
             ></div>
          </div>
      </div>
    </div>
  );
};

export default PointTrackerWidget;
