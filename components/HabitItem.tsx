
import React, { useState, useEffect } from 'react';
import type { Habit } from '../types';
import { HabitType } from '../types';
import { useHabits } from '../context/HabitContext';

interface HabitItemProps {
  habit: Habit;
  onViewProgress: (habitId: string) => void;
  onShare: (habit: Habit) => void;
  onPanic?: (habit: Habit) => void; // Optional panic handler for Bad habits
}

const GroupIcon: React.FC<{className?: string; title?: string;}> = ({className, title}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        {title && <title>{title}</title>}
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);

const HabitItem: React.FC<HabitItemProps> = ({ habit, onViewProgress, onShare, onPanic }) => {
  const { dispatch } = useHabits();
  const [isClicking, setIsClicking] = useState(false);
  const [triggerCelebration, setTriggerCelebration] = useState(false);

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const isCompletedToday = habit.completionHistory.some(iso => iso.startsWith(todayString));
  const isBadHabit = habit.type === HabitType.BAD;

  useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      if (triggerCelebration) {
          timer = setTimeout(() => {
              setTriggerCelebration(false);
          }, 1000);
      }
      return () => {
          if (timer) clearTimeout(timer);
      };
  }, [triggerCelebration]);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isBadHabit) {
        // For Bad habits, "Complete" means "Reset" (Slipped Up)
        if (window.confirm("Are you sure you want to reset your streak? Honesty is key to progress.")) {
            dispatch({ type: 'COMPLETE_HABIT', payload: { habitId: habit.id, today } });
        }
    } else {
        if (!isCompletedToday) {
            setIsClicking(true);
            setTimeout(() => {
                dispatch({ type: 'COMPLETE_HABIT', payload: { habitId: habit.id, today } });
                setIsClicking(false);
                setTriggerCelebration(true); 
            }, 150);
        }
    }
  };
  
  const handlePanic = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onPanic) onPanic(habit);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
        dispatch({ type: 'DELETE_HABIT', payload: { habitId: habit.id } });
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onShare(habit);
  };

  const handleViewProgressClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViewProgress(habit.id);
  };

  return (
    <div
      className={`rounded-2xl shadow-lg p-4 md:p-5 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-pop-in relative overflow-hidden cursor-default 
      ${isBadHabit ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-neutral-focus'}`}
      style={{ borderLeft: `6px solid ${habit.color || (isBadHabit ? '#EF4444' : '#5D5FEF')}` }}
    >
      {/* Card Body */}
      <div className="flex items-center space-x-3 md:space-x-5 z-10 flex-grow cursor-pointer select-none" onClick={(e) => {
          e.stopPropagation();
          onViewProgress(habit.id);
      }}> 
        <div className="text-3xl md:text-4xl transform transition-transform duration-300 group-hover:scale-110">{habit.emoji}</div>
        <div>
          <div className="flex items-center space-x-2">
              <h3 className={`text-base md:text-lg font-bold line-clamp-1 ${isBadHabit ? 'text-red-900 dark:text-red-100' : 'text-neutral dark:text-gray-100'}`}>{habit.name}</h3>
              {habit.sharingDetails && <GroupIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" title="Shared Habit" />}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5 md:mt-1">
            <span 
              className="text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full transition-colors"
              style={{
                backgroundColor: isBadHabit ? '#FEE2E2' : `${habit.color}20`,
                color: isBadHabit ? '#EF4444' : habit.color
              }}
            >
              {isBadHabit ? `🛡️ ${habit.streak} Days Free` : `🔥 ${habit.streak} Day Streak`}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1 sm:space-x-3 z-10">
        
        {/* Secondary Buttons */}
        <div className="flex space-x-1 lg:invisible lg:group-hover:visible opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
            <button type="button" onClick={handleShareClick} className="text-gray-400 hover:text-secondary transition-all p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
            </button>
            <button type="button" onClick={handleViewProgressClick} className="text-gray-400 hover:text-info transition-all p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Stats">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
            </button>
            <button type="button" onClick={handleDelete} className="text-gray-400 hover:text-error transition-all p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* Primary Action Button */}
        {isBadHabit ? (
            <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={handlePanic}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95"
                    title="Panic! Get Help"
                >
                    <span className="text-lg md:text-xl">🆘</span>
                </button>
                <button
                    type="button"
                    onClick={handleComplete}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 border-gray-200 hover:border-red-400 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all active:scale-95"
                    title="I Slipped Up (Reset Counter)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        ) : (
            <button
                type="button"
                onClick={handleComplete}
                disabled={isCompletedToday}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-out relative
                    ${isCompletedToday
                    ? 'text-white scale-100 cursor-default shadow-inner'
                    : 'bg-base-200 dark:bg-neutral text-gray-300 dark:text-gray-500 hover:bg-secondary hover:text-white dark:hover:border-secondary hover:shadow-lg'
                    }
                    ${isClicking ? 'scale-90' : isCompletedToday ? 'scale-100' : 'hover:scale-110'}
                `}
                style={{ 
                    borderColor: isCompletedToday ? habit.color : 'transparent',
                    backgroundColor: isCompletedToday ? habit.color : undefined
                }}
                aria-label={`Complete ${habit.name}`}
            >
                {triggerCelebration && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: habit.color }}></div>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 md:h-7 md:w-7 transition-all duration-300 ${isCompletedToday ? 'scale-100' : 'scale-75 opacity-70 hover:opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </button>
        )}
      </div>
    </div>
  );
};

export default HabitItem;
