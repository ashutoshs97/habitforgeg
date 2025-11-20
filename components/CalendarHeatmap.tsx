
import React from 'react';
import { useHabits } from '../context/HabitContext';

interface CalendarHeatmapProps {
  completionDates: string[];
  color: string;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ completionDates, color }) => {
  const { state } = useHabits();
  const startOfWeek = state.settings?.startOfWeek || 'Sun';
  
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setDate(today.getDate() - 365);

  const datesSet = new Set(completionDates.map(d => new Date(d).toISOString().split('T')[0]));

  const days = [];
  let currentDate = new Date(yearAgo);
  
  // Align the first day to the configured Start of Week
  const dayOfWeek = currentDate.getDay();
  let diff = dayOfWeek;
  if (startOfWeek === 'Mon') {
      diff = (dayOfWeek + 6) % 7; // Mon (1) -> 0, Sun (0) -> 6
  }
  currentDate.setDate(currentDate.getDate() - diff);

  for (let i = 0; i < 371; i++) { // Approx 53 weeks
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const weekDays = startOfWeek === 'Sun' 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getTooltip = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const getIntensityClass = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (datesSet.has(dateString)) {
        return 'completed';
    }
    return 'not-completed';
  }

  return (
    <div>
        <div className="grid grid-rows-7 grid-flow-col gap-1">
          {days.map((day, index) => {
             const intensity = getIntensityClass(day);
             const isFuture = day > today;
             return (
                <div key={index} className="relative group">
                    <div
                        className={`w-4 h-4 rounded-sm ${isFuture ? 'bg-transparent' : (intensity === 'completed' ? '' : 'bg-gray-200 dark:bg-gray-700')}`}
                        style={{ backgroundColor: intensity === 'completed' && !isFuture ? color : undefined }}
                    />
                    {!isFuture && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-neutral-focus text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {getTooltip(day)}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-focus rotate-45"></div>
                        </div>
                    )}
                </div>
             )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
            <span>{yearAgo.toLocaleString('default', { month: 'short' })}</span>
            <span>{today.toLocaleString('default', { month: 'short' })}</span>
        </div>
    </div>
  );
};

export default CalendarHeatmap;
