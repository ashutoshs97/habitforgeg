
import React, { useState, useEffect } from 'react';
import type { Habit, SharedHabitData } from '../types';
import GroupCompletionCalendar from './GroupCompletionCalendar';
import CommentBox from './CommentBox';

interface SharedProgressPageProps {
  habit: Habit;
  onBack: () => void;
}

const getSharedHabitData = (sharedHabitId?: string): SharedHabitData | null => {
    if (!sharedHabitId) return null;
    try {
        const db = localStorage.getItem('habitForgeSharedDB');
        const parsedDB = db ? JSON.parse(db) : {};
        return parsedDB[sharedHabitId] || null;
    } catch {
        return null;
    }
}

const SharedProgressPage: React.FC<SharedProgressPageProps> = ({ habit, onBack }) => {
  const [sharedData, setSharedData] = useState<SharedHabitData | null>(
      getSharedHabitData(habit.sharingDetails?.sharedHabitId)
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSharedData(getSharedHabitData(habit.sharingDetails?.sharedHabitId));
    }, 2000);
    return () => clearInterval(interval);
  }, [habit.sharingDetails]);

  if (!sharedData) {
      return (
        <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">Loading shared habit data...</p>
        </div>
      );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-base-300 dark:bg-white/10 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">{habit.emoji}</span>
          </div>
            <div>
                <h1 className="text-3xl font-bold text-neutral dark:text-white">{habit.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Group Progress</p>
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

      <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
              <h3 className="text-xl font-bold mb-4 text-neutral dark:text-gray-100">Group Completion Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">See your group's activity for the last year.</p>
              <GroupCompletionCalendar members={sharedData.members} />
          </div>
          <div className="lg:col-span-2 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-8">
              <h3 className="text-xl font-bold mb-4 text-neutral dark:text-gray-100">Group Chat</h3>
              <CommentBox sharedHabitId={sharedData.id} comments={sharedData.comments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedProgressPage;
