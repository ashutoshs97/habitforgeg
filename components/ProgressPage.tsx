
import React from 'react';
import type { Habit } from '../types';
import CalendarHeatmap from './CalendarHeatmap';
import WeeklyChart from './WeeklyChart';

interface ProgressPageProps {
  habit: Habit;
  onBack: () => void;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ habit, onBack }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <span className="text-4xl">{habit.emoji}</span>
            <div>
                <h1 className="text-3xl font-bold text-neutral dark:text-white">{habit.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">Your progress overview</p>
            </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white dark:bg-neutral-focus text-neutral dark:text-white font-bold py-2 px-4 rounded-xl shadow-md hover:bg-base-300 dark:hover:bg-neutral-focus/50 transition-all duration-300 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Dashboard</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-neutral dark:text-gray-100">Completion Calendar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Showing your activity for the last year.</p>
            <CalendarHeatmap completionDates={habit.completionHistory} color={habit.color} />
        </div>
        <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-neutral dark:text-gray-100">Weekly Performance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Which days are you most consistent?</p>
            <WeeklyChart completionDates={habit.completionHistory} color={habit.color} />
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
