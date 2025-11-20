
export enum HabitType {
  GOOD = 'GOOD',
  BAD = 'BAD',
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  type: HabitType;
  streak: number;
  completionHistory: string[]; // Array of ISO date strings
  createdAt: string; // ISO date string
  color: string;
  sharingDetails?: SharedHabitDetails;
}

export interface User {
  name: string;
  level: number;
  willpowerPoints: number;
  unlockedAchievementIds: string[];
  isPremium: boolean;
}

export interface Achievement {
  id:string;
  name: string;
  description: string;
  emoji: string;
  milestone: (data: { habits: Habit[]; user: User }) => boolean;
}

export type NotificationType =
  | 'ACHIEVEMENT'
  | 'STREAK_MILESTONE'
  | 'SOCIAL_INVITE'
  | 'SOCIAL_COMPLETION'
  | 'SOCIAL_COMMENT';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string; // ISO date string
  isRead: boolean;
}

export interface UserSettings {
  startOfWeek: 'Sun' | 'Mon';
  soundEnabled: boolean;
  reminderTime: string;
  emailNotifs: boolean;
  socialNotifs: boolean;
}

export interface AppState {
  user: User;
  habits: Habit[];
  newlyUnlockedAchievements: string[];
  notifications: Notification[];
  settings: UserSettings;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

// Social Feature Types
export interface SharedHabitDetails {
  sharedHabitId: string;
  ownerEmail: string;
  sharedWith: string[]; // array of emails
}

export interface Comment {
  id: string;
  authorEmail: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface SharedHabitData {
  id: string;
  ownerEmail: string;
  habitName: string;
  habitEmoji: string;
  habitColor: string;
  members: {
    email: string;
    name: string;
    completions: string[]; // ISO date strings
  }[];
  comments: Comment[];
}
