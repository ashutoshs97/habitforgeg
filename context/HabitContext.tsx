
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Habit, User, AppState, SharedHabitData, Comment, SharedHabitDetails, Notification, NotificationType, UserSettings } from '../types';
import { HabitType } from '../types';
import { ACHIEVEMENTS, COLOR_OPTIONS } from '../constants';

type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'COMPLETE_HABIT'; payload: { habitId: string; today: Date } }
  | { type: 'ADD_HABIT'; payload: { name: string; emoji: string; type: HabitType; color: string } }
  | { type: 'UPDATE_HABIT'; payload: { habitId: string; name: string } }
  | { type: 'DELETE_HABIT'; payload: { habitId: string } }
  | { type: 'RESET_STREAKS' }
  | { type: 'CLEAR_NEW_ACHIEVEMENTS' }
  | { type: 'SHARE_HABIT'; payload: { habit: Habit; friendEmail: string } }
  | { type: 'ADD_COMMENT'; payload: { sharedHabitId: string, text: string } }
  | { type: 'MARK_NOTIFICATIONS_AS_READ'; payload: { ids: string[] } }
  | { type: 'MARK_ALL_NOTIFICATIONS_AS_READ' }
  | { type: 'UNSHARE_HABIT_WITH_MEMBER', payload: { habit: Habit, memberEmail: string } }
  | { type: 'UPGRADE_TO_PREMIUM' }
  | { type: 'CANCEL_SUBSCRIPTION' }
  | { type: 'UPDATE_SETTINGS', payload: Partial<UserSettings> };

// --- LOCALSTORAGE HELPERS for Social Features ---
const SHARED_DB_KEY = 'habitForgeSharedDB';
const USERS_STORAGE_KEY = 'habitForgeUsers';

const getSharedHabitsDB = (): Record<string, SharedHabitData> => {
    try {
        const db = localStorage.getItem(SHARED_DB_KEY);
        return db ? JSON.parse(db) : {};
    } catch {
        return {};
    }
}

const saveSharedHabitsDB = (db: Record<string, SharedHabitData>) => {
    localStorage.setItem(SHARED_DB_KEY, JSON.stringify(db));
}

const findUserByEmail = (email: string): { name: string; email: string } | null => {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        if (!users) return null;
        const parsedUsers = JSON.parse(users);
        return parsedUsers.find((u: any) => u.email === email) || null;
    } catch {
        return null;
    }
};

const updateUserState = (email: string, updateFn: (state: AppState) => AppState) => {
    const storageKey = `habitForgeState_${email}`;
    try {
        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
            const savedState: AppState = JSON.parse(savedStateJSON);
            const newState = updateFn(savedState);
            localStorage.setItem(storageKey, JSON.stringify(newState));
        }
    } catch (error) {
        console.error(`Could not update state for user ${email}`, error);
    }
};


// --- DATE UTILS ---
const isSameDay = (d1: Date, d2: Date): boolean =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isYesterday = (d1: Date, d2: Date): boolean => {
    const yesterday = new Date(d2);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(d1, yesterday);
}

// --- STREAK CALCULATION ---
const calculateHabitStreak = (habit: Habit): number => {
    if (habit.type === HabitType.BAD) {
        // For BAD habits: Streak = Days since last incident (or creation if no incidents)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastIncidentDate = new Date(habit.createdAt);
        if (habit.completionHistory.length > 0) {
            // Get the most recent incident
            const sortedHistory = [...habit.completionHistory].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            lastIncidentDate = new Date(sortedHistory[0]);
        }
        lastIncidentDate.setHours(0, 0, 0, 0);

        // Difference in days
        const diffTime = today.getTime() - lastIncidentDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    } 
    
    // For GOOD habits: Consecutive days logic
    if (habit.completionHistory.length === 0) return 0;

    const uniqueDays = [...new Set(habit.completionHistory.map(iso => iso.split('T')[0]))]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime());
    
    const lastCompletedDate = uniqueDays[0];
    if (!lastCompletedDate) return 0;

    const today = new Date();
    // If not completed today AND not completed yesterday, streak is broken (0)
    // Exception: If completed today, streak continues.
    if (!isSameDay(lastCompletedDate, today) && !isYesterday(lastCompletedDate, today)) {
        return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
        const current = uniqueDays[i];
        const next = uniqueDays[i+1];
        const expectedPrevious = new Date(current);
        expectedPrevious.setDate(expectedPrevious.getDate() - 1);
        if (isSameDay(next, expectedPrevious)) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

const createNotification = (type: NotificationType, message: string): Notification => ({
    id: crypto.randomUUID(),
    type,
    message,
    createdAt: new Date().toISOString(),
    isRead: false,
});

const DEFAULT_SETTINGS: UserSettings = {
    startOfWeek: 'Sun',
    soundEnabled: true,
    reminderTime: '09:00',
    emailNotifs: true,
    socialNotifs: true,
};

// --- REDUCER ---
const habitReducer = (state: AppState, action: Action): AppState => {
  const currentUserEmail = (state as any).userEmail; // Injected on provider init

  switch (action.type) {
    case 'LOAD_STATE': {
        const loadedState = action.payload;
        if (loadedState.habits) {
            loadedState.habits = loadedState.habits.map((h, i) => {
                const habitWithColor = { ...h, color: h.color || COLOR_OPTIONS[i % COLOR_OPTIONS.length] };
                if (!habitWithColor.completionHistory) {
                    return { ...habitWithColor, completionHistory: (h as any).lastCompleted ? [(h as any).lastCompleted] : [] };
                }
                // Migration: Ensure type exists
                if (!habitWithColor.type) {
                    habitWithColor.type = HabitType.GOOD;
                }
                return habitWithColor;
            });
        }
        if (loadedState.user && loadedState.user.isPremium === undefined) {
            loadedState.user.isPremium = false;
        }
        if (!loadedState.settings) {
            loadedState.settings = DEFAULT_SETTINGS;
        }
        return { ...loadedState, notifications: loadedState.notifications || [] };
    }
    case 'COMPLETE_HABIT': {
      const { habitId, today } = action.payload;
      const todayString = today.toISOString();
      const todayDateString = todayString.split('T')[0];
      let newNotifications: Notification[] = [];

      const habitToUpdate = state.habits.find(h => h.id === habitId);
      if (!habitToUpdate) return state;

      // Logic check based on type
      if (habitToUpdate.type === HabitType.GOOD) {
          // Prevent double completion for Good Habits
          if (habitToUpdate.completionHistory.some(iso => iso.startsWith(todayDateString))) {
              return state; 
          }
      } 
      // For BAD habits, "Completing" means logging an incident (Relapse).
      // We allow logging multiple incidents per day.
      
      const oldStreak = habitToUpdate.streak;
      let newWillpowerPoints = state.user.willpowerPoints;

      // Update local habit state
      const updatedHabits = state.habits.map(habit => {
        if (habit.id === habitId) {
          const updatedHistory = [...habit.completionHistory, todayString];
          
          // Re-calculate streak using the robust function (passing updated history temporarily)
          const tempHabit = { ...habit, completionHistory: updatedHistory };
          const streak = calculateHabitStreak(tempHabit);
          
          // Points logic
          if (habit.type === HabitType.GOOD) {
              newWillpowerPoints += 10 + streak * 2;
          } else {
              // No points for breaking a bad habit streak.
              // Maybe a small penalty? For now, we just reset.
          }
          
          return { ...habit, completionHistory: updatedHistory, streak };
        }
        return habit;
      });
      
      const newStreak = updatedHabits.find(h => h.id === habitId)!.streak;
      
      // Notifications only for Good Habits on streak increase
      if (habitToUpdate.type === HabitType.GOOD) {
          const streakMilestones = [3, 7, 14, 30, 60, 100];
          if (streakMilestones.includes(newStreak) && newStreak > oldStreak) {
              newNotifications.push(createNotification('STREAK_MILESTONE', `You've hit a ${newStreak}-day streak on "${habitToUpdate.name}"!`));
          }
      }

      // Handle shared habit logic
      if (habitToUpdate.sharingDetails) {
          const sharedDB = getSharedHabitsDB();
          const sharedHabit = sharedDB[habitToUpdate.sharingDetails.sharedHabitId];
          if(sharedHabit) {
              const currentUserInGroup = sharedHabit.members.find(m => m.email === currentUserEmail);
              if (currentUserInGroup) {
                  currentUserInGroup.completions.push(todayString);
                  
                  if (habitToUpdate.type === HabitType.GOOD) {
                      const otherMembers = sharedHabit.members.filter(m => m.email !== currentUserEmail);
                      const friendCompletedToday = otherMembers.some(m => m.completions.some(iso => iso.startsWith(todayDateString)));

                      if (friendCompletedToday) {
                          newNotifications.push(createNotification('SOCIAL_COMPLETION', `You and a friend both completed '${habitToUpdate.name}' today! (+25 WP)`));
                          newWillpowerPoints += 25; // Bonus points!
                      }
                      
                      // Notify other members
                      otherMembers.forEach(member => {
                          updateUserState(member.email, friendState => ({
                              ...friendState,
                              notifications: [
                                  ...friendState.notifications,
                                  createNotification('SOCIAL_COMPLETION', `${state.user.name} completed "${habitToUpdate.name}" today!`)
                              ]
                          }));
                      });
                  }
              }
              saveSharedHabitsDB(sharedDB);
          }
      }

      const updatedUser: User = { ...state.user, willpowerPoints: newWillpowerPoints, level: Math.floor(newWillpowerPoints / 100) };

      const newlyUnlocked = ACHIEVEMENTS.filter(ach => 
        !state.user.unlockedAchievementIds.includes(ach.id) && 
        ach.milestone({ habits: updatedHabits, user: updatedUser })
      ).map(ach => ach.id);
      
      if (newlyUnlocked.length > 0) {
        updatedUser.unlockedAchievementIds = [...state.user.unlockedAchievementIds, ...newlyUnlocked];
        newlyUnlocked.forEach(achId => {
            const achievement = ACHIEVEMENTS.find(a => a.id === achId);
            if (achievement) {
                newNotifications.push(createNotification('ACHIEVEMENT', `Achievement Unlocked: ${achievement.name}!`));
            }
        });
      }

      return { ...state, user: updatedUser, habits: updatedHabits, newlyUnlockedAchievements: newlyUnlocked, notifications: [...state.notifications, ...newNotifications] };
    }
    case 'ADD_HABIT': {
        const newHabit: Habit = {
            id: crypto.randomUUID(),
            name: action.payload.name,
            emoji: action.payload.emoji,
            type: action.payload.type,
            color: action.payload.color,
            streak: 0,
            completionHistory: [],
            createdAt: new Date().toISOString()
        };
        const habits = [...state.habits, newHabit];
        const user = { ...state.user };
        
        const newlyUnlocked = ACHIEVEMENTS.filter(ach => 
            !user.unlockedAchievementIds.includes(ach.id) && 
            ach.milestone({ habits, user })
        ).map(ach => ach.id);

        if (newlyUnlocked.length > 0) {
            user.unlockedAchievementIds = [...user.unlockedAchievementIds, ...newlyUnlocked];
        }

        return { ...state, habits, user, newlyUnlockedAchievements: newlyUnlocked };
    }
    case 'UPDATE_HABIT': {
        const { habitId, name } = action.payload;
        const updatedHabits = state.habits.map(h => 
            h.id === habitId ? { ...h, name } : h
        );
        return { ...state, habits: updatedHabits };
    }
    case 'DELETE_HABIT': {
        return { ...state, habits: state.habits.filter(h => h.id !== action.payload.habitId) };
    }
    case 'RESET_STREAKS': {
        // Re-calculate streaks for all habits (good and bad)
        const updatedHabits = state.habits.map(habit => {
           const streak = calculateHabitStreak(habit);
           return { ...habit, streak };
        });
        return { ...state, habits: updatedHabits };
    }
    case 'CLEAR_NEW_ACHIEVEMENTS':
        return { ...state, newlyUnlockedAchievements: [] };
        
    case 'SHARE_HABIT': {
        const { habit, friendEmail } = action.payload;
        
        if (friendEmail === currentUserEmail) return state; // Can't share with self
        const friend = findUserByEmail(friendEmail);
        if (!friend) {
            alert("User not found. Make sure your friend has a HabitForge account and you've entered the correct email.");
            return state;
        }

        const sharedDB = getSharedHabitsDB();
        let sharedHabitId = habit.sharingDetails?.sharedHabitId;

        if (sharedHabitId && sharedDB[sharedHabitId]) { 
            const sharedHabit = sharedDB[sharedHabitId];
            if (!sharedHabit.members.some(m => m.email === friendEmail)) {
                sharedHabit.members.push({ email: friend.email, name: friend.name, completions: [] });
            }
        } else { 
            sharedHabitId = crypto.randomUUID();
            sharedDB[sharedHabitId] = {
                id: sharedHabitId,
                ownerEmail: currentUserEmail,
                habitName: habit.name,
                habitEmoji: habit.emoji,
                habitColor: habit.color,
                comments: [],
                members: [
                    { email: currentUserEmail, name: state.user.name, completions: habit.completionHistory },
                    { email: friend.email, name: friend.name, completions: [] }
                ]
            };
        }
        saveSharedHabitsDB(sharedDB);
        
        updateUserState(friendEmail, friendState => {
            if (friendState.habits.some(h => h.sharingDetails?.sharedHabitId === sharedHabitId)) return friendState;
            const newSharedHabitForFriend: Habit = {
                ...habit,
                id: crypto.randomUUID(),
                streak: 0,
                completionHistory: [],
                sharingDetails: {
                    sharedHabitId: sharedHabitId!,
                    ownerEmail: currentUserEmail,
                    sharedWith: []
                }
            };
            const newNotification = createNotification('SOCIAL_INVITE', `${state.user.name} invited you to join the habit "${habit.name}"!`);
            return {
                ...friendState,
                habits: [...friendState.habits, newSharedHabitForFriend],
                notifications: [...friendState.notifications, newNotification]
            };
        });

        const updatedHabits = state.habits.map(h => {
            if (h.id === habit.id) {
                const sharingDetails: SharedHabitDetails = {
                    sharedHabitId: sharedHabitId!,
                    ownerEmail: currentUserEmail,
                    sharedWith: [...new Set([...(h.sharingDetails?.sharedWith || []), friendEmail])]
                };
                return { ...h, sharingDetails };
            }
            return h;
        });

        return { ...state, habits: updatedHabits };
    }
    case 'ADD_COMMENT': {
        const { sharedHabitId, text } = action.payload;
        const sharedDB = getSharedHabitsDB();
        const sharedHabit = sharedDB[sharedHabitId];
        if (sharedHabit) {
            const newComment: Comment = {
                id: crypto.randomUUID(),
                authorEmail: currentUserEmail,
                authorName: state.user.name,
                text,
                createdAt: new Date().toISOString()
            };
            sharedHabit.comments.push(newComment);
            saveSharedHabitsDB(sharedDB);
            
            sharedHabit.members.forEach(member => {
                if (member.email !== currentUserEmail) {
                    updateUserState(member.email, friendState => ({
                        ...friendState,
                        notifications: [
                            ...friendState.notifications,
                            createNotification('SOCIAL_COMMENT', `${state.user.name} commented on "${sharedHabit.habitName}".`)
                        ]
                    }));
                }
            });
        }
        return { ...state };
    }
    case 'MARK_NOTIFICATIONS_AS_READ':
        return {
            ...state,
            notifications: state.notifications.map(n => action.payload.ids.includes(n.id) ? { ...n, isRead: true } : n)
        };
    case 'MARK_ALL_NOTIFICATIONS_AS_READ':
        return {
            ...state,
            notifications: state.notifications.map(n => ({...n, isRead: true}))
        }
    case 'UNSHARE_HABIT_WITH_MEMBER': {
        const { habit, memberEmail } = action.payload;
        if (!habit.sharingDetails) return state;

        const sharedDB = getSharedHabitsDB();
        const sharedHabit = sharedDB[habit.sharingDetails.sharedHabitId];
        if (!sharedHabit || sharedHabit.ownerEmail !== currentUserEmail) return state;

        sharedHabit.members = sharedHabit.members.filter(m => m.email !== memberEmail);
        
        let updatedHabits = state.habits;

        if (sharedHabit.members.length < 2) {
            delete sharedDB[habit.sharingDetails.sharedHabitId];
            updatedHabits = state.habits.map(h => h.id === habit.id ? { ...h, sharingDetails: undefined } : h);
        } else {
             updatedHabits = state.habits.map(h => {
                if (h.id === habit.id && h.sharingDetails) {
                    return { ...h, sharingDetails: { ...h.sharingDetails, sharedWith: h.sharingDetails.sharedWith.filter(email => email !== memberEmail)}}
                }
                return h;
            });
        }
        saveSharedHabitsDB(sharedDB);

        updateUserState(memberEmail, friendState => ({
            ...friendState,
            habits: friendState.habits.filter(h => h.sharingDetails?.sharedHabitId !== habit.sharingDetails!.sharedHabitId)
        }));

        return { ...state, habits: updatedHabits };
    }
    case 'UPGRADE_TO_PREMIUM':
        return {
            ...state,
            user: { ...state.user, isPremium: true },
            notifications: [
                ...state.notifications,
                createNotification('ACHIEVEMENT', 'Welcome to Premium! You have unlocked Advanced Insights.')
            ]
        };
    case 'CANCEL_SUBSCRIPTION':
        return {
            ...state,
            user: { ...state.user, isPremium: false },
            notifications: [
                ...state.notifications,
                createNotification('ACHIEVEMENT', 'Subscription cancelled. You have been reverted to the Free plan.')
            ]
        };
    case 'UPDATE_SETTINGS':
        return {
            ...state,
            settings: { ...state.settings, ...action.payload }
        };
    default:
      return state;
  }
};

const HabitContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action>, userEmail: string } | undefined>(undefined);

interface HabitProviderProps {
  children: ReactNode;
  user: { name: string; email: string };
}

const getInitialStateForUser = (user: { name: string; email: string }): AppState => {
    const storageKey = `habitForgeState_${user.email}`;
    const defaultState: AppState = {
      user: {
        name: user.name,
        level: 1,
        willpowerPoints: 0,
        unlockedAchievementIds: [],
        isPremium: false,
      },
      habits: [],
      newlyUnlockedAchievements: [],
      notifications: [],
      settings: DEFAULT_SETTINGS
    };

    try {
        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
            const savedState: AppState = JSON.parse(savedStateJSON);
            savedState.user.name = user.name;
            savedState.notifications = savedState.notifications || [];
            if (savedState.user.isPremium === undefined) savedState.user.isPremium = false;
            if (!savedState.settings) savedState.settings = DEFAULT_SETTINGS;
            return savedState;
        }
    } catch (error) {
        console.error("Could not load state from localStorage", error);
    }
    return defaultState;
};

export const HabitProvider: React.FC<HabitProviderProps> = ({ children, user }) => {
  const storageKey = `habitForgeState_${user.email}`;
  
  const reducerWithUser = (state: AppState, action: Action) => {
      const stateWithUser = { ...state, userEmail: user.email };
      return habitReducer(stateWithUser, action);
  }

  const [state, dispatch] = useReducer(reducerWithUser, user, getInitialStateForUser);

  useEffect(() => {
    dispatch({ type: 'RESET_STREAKS' });
    const interval = setInterval(() => {
        const currentState = getInitialStateForUser(user);
        if (JSON.stringify(currentState) !== JSON.stringify(state)) {
            dispatch({ type: 'LOAD_STATE', payload: currentState });
        }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
        const stateToSave = { ...state };
        delete (stateToSave as any).userEmail;
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Could not save state to localStorage", error);
    }
  }, [state, storageKey]);

  return (
    <HabitContext.Provider value={{ state, dispatch, userEmail: user.email }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
