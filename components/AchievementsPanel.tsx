import React from 'react';
import { useHabits } from '../context/HabitContext';
import { ACHIEVEMENTS } from '../constants';
import Badge from './Badge';

const AchievementsPanel: React.FC = () => {
  const { state } = useHabits();
  const { user } = state;

  return (
    <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 text-neutral dark:text-gray-100">Achievements</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-y-6 gap-x-4">
        {ACHIEVEMENTS.map(ach => (
          <Badge
            key={ach.id}
            achievement={ach}
            isUnlocked={user.unlockedAchievementIds.includes(ach.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsPanel;