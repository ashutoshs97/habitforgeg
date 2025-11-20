
import React from 'react';
import { useHabits } from '../context/HabitContext';

const TopStreakWidget: React.FC = () => {
  const { state } = useHabits();
  
  const topHabit = state.habits.reduce((prev, current) => {
      return (prev.streak > current.streak) ? prev : current;
  }, { name: 'Start a habit', streak: 0, emoji: '🌱' });

  const hasStreak = topHabit.streak > 0;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-800 h-full flex flex-col justify-between relative overflow-hidden">
      {/* Background Element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>

      <div className="relative z-10">
          <h3 className="font-bold text-xs uppercase tracking-wider opacity-70 mb-1">Top Streak</h3>
          <div className="text-3xl font-extrabold flex items-baseline gap-1">
              {topHabit.streak} <span className="text-sm font-medium opacity-70">days</span>
          </div>
      </div>
      
      <div className="mt-2 flex items-center gap-3 font-medium relative z-10 bg-white/50 dark:bg-black/20 p-2 rounded-lg backdrop-blur-sm">
          <span className="text-2xl">{topHabit.emoji}</span>
          <span className="truncate text-sm">{hasStreak ? topHabit.name : "No active streaks"}</span>
      </div>
    </div>
  );
};

export default TopStreakWidget;
