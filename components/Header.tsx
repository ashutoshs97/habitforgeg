
import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from './ProgressBar';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { ACHIEVEMENTS } from '../constants';
import PremiumModal from './PremiumModal';
import SettingsModal from './SettingsModal';

interface HeaderProps {
  onAddHabit: () => void;
}

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onAddHabit }) => {
  const { state, dispatch } = useHabits();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState<string | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { user } = state;

  useEffect(() => {
    if (state.newlyUnlockedAchievements.length > 0) {
      const latestAchievementId = state.newlyUnlockedAchievements[0];
      const achievement = ACHIEVEMENTS.find(a => a.id === latestAchievementId);
      if (achievement) {
        setAchievementMessage(achievement.name);
        const timer = setTimeout(() => {
          // This logic runs if the user DOESN'T click the confetti or dismiss button manually
          setAchievementMessage(null);
          dispatch({ type: 'CLEAR_NEW_ACHIEVEMENTS' });
        }, 4000); // Display for 4 seconds
        return () => clearTimeout(timer);
      }
    } else {
        // If the array is cleared externally (e.g. by clicking the confetti), clear the message immediately
        setAchievementMessage(null);
    }
  }, [state.newlyUnlockedAchievements, dispatch]);

  const handleDismissAchievement = () => {
      setAchievementMessage(null);
      dispatch({ type: 'CLEAR_NEW_ACHIEVEMENTS' });
  };

  const pointsForNextLevel = 100;
  const pointsInCurrentLevel = user.willpowerPoints % pointsForNextLevel;
  const progressPercentage = (pointsInCurrentLevel / pointsForNextLevel) * 100;
  
  const unreadCount = state.notifications.filter(n => !n.isRead).length;
  
  const isCelebrating = !!achievementMessage;

  return (
    <>
      <header className={`sticky top-0 z-40 shadow-sm transition-colors duration-500 ${isCelebrating ? 'bg-green-600' : 'bg-white/70 dark:bg-neutral-focus/70 backdrop-blur-lg'}`}>
        <div className="container mx-auto px-4 md:px-8 py-2 md:py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
              <div className={`text-xl md:text-3xl font-bold tracking-tighter ${isCelebrating ? 'text-white' : 'text-primary'}`}>HabitForge</div>
              <div className={`hidden md:block border-l ${isCelebrating ? 'border-white/30' : 'dark:border-gray-700'} pl-4`}>
                  <div className={`text-md font-semibold ${isCelebrating ? 'text-white' : 'text-neutral dark:text-gray-100'}`}>Welcome, {user.name}!</div>
                   <div className={`text-xs ${isCelebrating ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>Level {user.level} &middot; {user.willpowerPoints} WP</div>
              </div>
          </div>

          <div className="flex-1 text-center px-4">
            {isCelebrating && (
              <div className="text-white font-bold text-sm md:text-lg animate-fade-in flex items-center justify-center gap-2">
                <span>✨ <span className="hidden sm:inline">Achievement Unlocked:</span> {achievementMessage}! ✨</span>
                <button 
                    onClick={handleDismissAchievement}
                    className="ml-2 p-1 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
                    title="Dismiss"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-28 hidden lg:block">
                   <ProgressBar percentage={progressPercentage} />
              </div>
              
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className={`font-bold py-1.5 px-2.5 md:py-2 md:px-3 rounded-xl shadow-md transition-all duration-300 flex items-center space-x-1 transform hover:scale-105 text-xs md:text-base
                  ${user.isPremium 
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600' 
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-black hover:to-gray-800'
                  }`}
              >
                  <span>{user.isPremium ? '💎' : '👑'}</span>
                  <span className="hidden md:inline">{user.isPremium ? 'Premium' : 'Go Premium'}</span>
              </button>

              <button
                onClick={onAddHabit}
                className="bg-primary hover:bg-primary-focus text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-xl shadow-md transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                title="Add a new habit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden md:inline">New Habit</span>
              </button>
              <div className="relative">
                  <button
                      onClick={() => setIsNotificationsOpen(prev => !prev)}
                      className={`${isCelebrating ? 'text-white/80 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'} transition-colors p-2 rounded-full hover:bg-black/10`}
                      title="Notifications"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 block h-4 w-4 md:h-5 md:w-5 rounded-full bg-error ring-2 ring-white dark:ring-neutral-focus text-white text-[10px] md:text-xs flex items-center justify-center font-bold">
                              {unreadCount}
                          </span>
                      )}
                  </button>
                  {isNotificationsOpen && <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />}
              </div>
              
              <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className={`${isCelebrating ? 'text-white/80 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'} transition-colors p-2 rounded-full hover:bg-black/10 hidden sm:block`}
                  title="Settings"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              </button>
              
              <button
                  onClick={toggleTheme}
                  className={`${isCelebrating ? 'text-white/80 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'} transition-colors p-2 rounded-full hover:bg-black/10 hidden sm:block`}
                  title="Toggle Theme"
              >
                  {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={signOut}
                className={`${isCelebrating ? 'text-white/80 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-primary'} transition-colors p-2 rounded-full hover:bg-black/10`}
                title="Sign Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
          </div>
        </div>
      </header>
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  );
};

export default Header;
