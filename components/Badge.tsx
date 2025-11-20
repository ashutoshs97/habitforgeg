import React from 'react';
import type { Achievement } from '../types';

interface BadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const Badge: React.FC<BadgeProps> = ({ achievement, isUnlocked }) => {
  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl text-center transition-all duration-300
        ${isUnlocked ? 'bg-gradient-to-br from-amber-200 to-amber-300 shadow-md' : 'bg-base-200 dark:bg-neutral'}
      `}
      title={isUnlocked ? `${achievement.name}: ${achievement.description}`: `${achievement.name} (Locked)`}
    >
      <div className={`text-4xl transition-all duration-500 ${isUnlocked ? 'filter-none drop-shadow-lg' : 'filter grayscale opacity-40'}`}>
        {achievement.emoji}
      </div>
      <div className={`text-xs mt-2 font-bold ${isUnlocked ? 'text-amber-900' : 'text-gray-500 dark:text-gray-400'}`}>
        {achievement.name}
      </div>
    </div>
  );
};

export default Badge;