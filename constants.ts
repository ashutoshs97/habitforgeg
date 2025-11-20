import type { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // --- STREAKS ---
  {
    id: 'ach_first_step',
    name: 'First Step',
    description: 'Complete a habit for the first time.',
    emoji: '🌱',
    milestone: ({ user }) => user.willpowerPoints > 0,
  },
  {
    id: 'ach_on_a_roll',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak on any habit.',
    emoji: '🔥',
    milestone: ({ habits }) => habits.some(h => h.streak >= 3),
  },
  {
    id: 'ach_week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak on any habit.',
    emoji: '⚔️',
    milestone: ({ habits }) => habits.some(h => h.streak >= 7),
  },
  {
    id: 'ach_unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak on any habit.',
    emoji: '🚀',
    milestone: ({ habits }) => habits.some(h => h.streak >= 30),
  },
  {
    id: 'ach_legendary',
    name: 'Legendary Consistency',
    description: 'Maintain a 100-day streak. You are a machine!',
    emoji: '👑',
    milestone: ({ habits }) => habits.some(h => h.streak >= 100),
  },

  // --- VOLUME ---
  {
    id: 'ach_dedication',
    name: 'Dedication',
    description: 'Complete habits 50 times in total.',
    emoji: '🏋️',
    milestone: ({ habits }) => habits.reduce((acc, h) => acc + h.completionHistory.length, 0) >= 50,
  },
  {
    id: 'ach_century_club',
    name: 'Century Club',
    description: 'Complete habits 100 times in total.',
    emoji: '💯',
    milestone: ({ habits }) => habits.reduce((acc, h) => acc + h.completionHistory.length, 0) >= 100,
  },

  // --- CREATION & VARIETY ---
  {
    id: 'ach_forge_master',
    name: 'Forge Master',
    description: 'Create 5 different habits.',
    emoji: '🛠️',
    milestone: ({ habits }) => habits.length >= 5,
  },
  {
    id: 'ach_rainbow',
    name: 'Taste the Rainbow',
    description: 'Have habits of 3 different colors.',
    emoji: '🎨',
    milestone: ({ habits }) => new Set(habits.map(h => h.color)).size >= 3,
  },

  // --- LEVELING ---
  {
    id: 'ach_level_5',
    name: 'High Five',
    description: 'Reach Level 5.',
    emoji: '🖐️',
    milestone: ({ user }) => user.level >= 5,
  },
  {
    id: 'ach_level_10',
    name: 'Double Digits',
    description: 'Reach Level 10.',
    emoji: '⭐',
    milestone: ({ user }) => user.level >= 10,
  },
  {
    id: 'ach_point_collector',
    name: 'Point Collector',
    description: 'Earn 1000 Willpower Points.',
    emoji: '💰',
    milestone: ({ user }) => user.willpowerPoints >= 1000,
  },

  // --- TIMING & SPECIFIC ---
  {
    id: 'ach_perfect_day',
    name: 'Perfect Day',
    description: 'Complete all your active habits in one day (min 3 habits).',
    emoji: '🌟',
    milestone: ({ habits }) => {
        if (habits.length < 3) return false;
        const today = new Date().toISOString().split('T')[0];
        return habits.every(h => h.completionHistory.some(d => d.startsWith(today)));
    },
  },
  {
    id: 'ach_weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete a habit on a Saturday or Sunday.',
    emoji: '🏖️',
    milestone: ({ habits }) => {
        return habits.some(h => h.completionHistory.some(d => {
            const day = new Date(d).getDay();
            return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
        }));
    },
  },

  // --- SOCIAL ---
  {
    id: 'ach_social_butterfly',
    name: 'Social Butterfly',
    description: 'Share a habit with a friend.',
    emoji: '🦋',
    milestone: ({ habits }) => habits.some(h => !!h.sharingDetails),
  },
];

export const EMOJI_OPTIONS = ['💪', '🧘', '📖', '💧', '🏃', '🚭', '📱', '🥗', '😴', '🎨', '🎸', '🧠', '💊', '🧹'];

export const COLOR_OPTIONS = [
  '#5D5FEF', // Primary Purple
  '#11D1A9', // Secondary Teal
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#10B981', // Emerald
];