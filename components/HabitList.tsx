
import React from 'react';
import { useHabits } from '../context/HabitContext';
import HabitItem from './HabitItem';
import type { Habit } from '../types';

interface HabitListProps {
  onViewProgress: (habitId: string) => void;
  onShare: (habit: Habit) => void;
  onPanic?: (habit: Habit) => void; // Added panic handler
  filter?: 'all' | 'personal' | 'shared';
}

const HabitList: React.FC<HabitListProps> = ({ onViewProgress, onShare, onPanic, filter = 'all' }) => {
  const { state } = useHabits();

  const filteredHabits = state.habits.filter(habit => {
    if (filter === 'personal') return !habit.sharingDetails;
    if (filter === 'shared') return !!habit.sharingDetails;
    return true;
  });

  if (filteredHabits.length === 0) {
    if (filter === 'shared') {
        return (
            <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-12 text-center animate-fade-in border border-gray-200 dark:border-gray-700 border-dashed">
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-2xl font-bold mb-2 text-neutral dark:text-white">No Shared Habits Yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                  Habits are easier when you build them together. Share a habit to start a streak with a friend!
                </p>
            </div>
        );
    }
    
    if (filter === 'personal') {
        return (
            <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-12 text-center animate-fade-in border border-gray-200 dark:border-gray-700">
                <div className="text-6xl mb-4">⚔️</div>
                <h2 className="text-2xl font-bold mb-2 text-neutral dark:text-white">Your Forge is Empty</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  It's time to create your first personal habit. Click 'New Habit' to begin.
                </p>
            </div>
        );
    }

    return (
      <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-12 text-center animate-fade-in border border-gray-200 dark:border-gray-700">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="text-2xl font-bold mb-2 text-neutral dark:text-white">Your Forge is Ready</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          It's time to create your first habit. Click 'New Habit' to begin your journey of self-improvement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredHabits.map(habit => (
        <HabitItem 
            key={habit.id} 
            habit={habit} 
            onViewProgress={onViewProgress} 
            onShare={onShare}
            onPanic={onPanic}
        />
      ))}
    </div>
  );
};

export default HabitList;
