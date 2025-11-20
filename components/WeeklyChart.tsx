
import React from 'react';

interface WeeklyChartProps {
  completionDates: string[];
  color: string;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ completionDates, color }) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const completionsByDay = new Array(7).fill(0);

  completionDates.forEach(isoDate => {
    const dayIndex = new Date(isoDate).getDay();
    completionsByDay[dayIndex]++;
  });

  const maxCompletions = Math.max(...completionsByDay);
  const chartHeight = 120; // in pixels

  return (
    <div className="flex justify-between items-end h-[150px] space-x-2 sm:space-x-4 px-2">
      {weekDays.map((day, index) => {
        const count = completionsByDay[index];
        const barHeight = maxCompletions > 0 ? (count / maxCompletions) * chartHeight : 0;

        return (
          <div key={day} className="flex-1 flex flex-col items-center">
            <div className="text-sm font-bold text-neutral dark:text-gray-200 relative w-full flex justify-center">
              <span className="z-10">{count}</span>
            </div>
            <div
              className="w-full rounded-t-lg transition-all duration-500 ease-out group relative"
              style={{ height: `${chartHeight}px` }}
            >
                <div 
                    className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                    style={{ 
                        height: `${barHeight}px`,
                        backgroundColor: color,
                        minHeight: barHeight > 0 ? '4px' : '0px'
                    }}
                />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-2">{day}</div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyChart;
