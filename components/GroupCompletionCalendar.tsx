
import React, { useRef } from 'react';
import type { SharedHabitData } from '../types';

interface GroupCompletionCalendarProps {
  members: SharedHabitData['members'];
}

const GroupCompletionCalendar: React.FC<GroupCompletionCalendarProps> = ({ members }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setDate(today.getDate() - 365);

  const completionsByDate: Record<string, string[]> = {}; // dateString -> [userEmail1, userEmail2]
  members.forEach(member => {
      member.completions.forEach(isoDate => {
          const dateString = new Date(isoDate).toISOString().split('T')[0];
          if (!completionsByDate[dateString]) {
              completionsByDate[dateString] = [];
          }
          completionsByDate[dateString].push(member.email);
      });
  });

  const days = [];
  let currentDate = new Date(yearAgo);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start on a Sunday

  for (let i = 0; i < 371; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const getTooltip = (date: Date, completers: string[]) => {
    const dateStr = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    if (completers.length === 0) {
        return `${dateStr}\nNo completions.`;
    }
    const completerNames = completers.map(email => members.find(m => m.email === email)?.name || 'Unknown');
    return `${dateStr}\nCompleted by: ${completerNames.join(', ')}`;
  };
  
  const getFillStyle = (completersCount: number, totalMembers: number) => {
    const percentage = totalMembers > 0 ? completersCount / totalMembers : 0;
    if (percentage === 0) return { background: 'bg-gray-200 dark:bg-gray-700' };
    if (percentage < 0.5) return { background: 'bg-green-200 dark:bg-green-900' };
    if (percentage < 1) return { background: 'bg-green-400 dark:bg-green-700' };
    return { background: 'bg-green-600 dark:bg-green-500' };
  };

  return (
    <div>
        <div ref={scrollContainerRef} className="pb-2 no-scrollbar overflow-x-auto">
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {days.map((day, index) => {
                 const dateString = day.toISOString().split('T')[0];
                 const completers = completionsByDate[dateString] || [];
                 const isFuture = day > today;
                 const { background } = getFillStyle(completers.length, members.length);

                 return (
                    <div key={index} className="relative group">
                        <div className={`w-4 h-4 rounded-sm ${isFuture ? 'bg-transparent' : background}`} />
                        {!isFuture && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 bg-neutral-focus text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-pre-wrap text-center">
                                {getTooltip(day, completers)}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-focus rotate-45"></div>
                            </div>
                        )}
                    </div>
                 )
              })}
            </div>
        </div>
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
                <button onClick={() => handleScroll('left')} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="w-16 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                </div>
                <button onClick={() => handleScroll('right')} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <div className="flex justify-end space-x-2 items-center text-xs text-gray-500">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
                <span>More</span>
            </div>
        </div>
    </div>
  );
};

export default GroupCompletionCalendar;