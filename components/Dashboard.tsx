
import React, { useState, useEffect } from 'react';
import Header from './Header';
import HabitList from './HabitList';
import AchievementsPanel from './AchievementsPanel';
import AddHabitModal from './AddHabitModal';
import ProgressPage from './ProgressPage';
import SharedProgressPage from './SharedProgressPage';
import ShareHabitModal from './ShareHabitModal';
import MotivationalPopup from './MotivationalPopup';
import PremiumModal from './PremiumModal';
import FriendsView from './FriendsView';
import PremiumView from './PremiumView';
import FoodScannerView from './FoodScannerView';
import GoalRefinementView from './GoalRefinementView';
import CalorieWidget from './CalorieWidget';
import PointTrackerWidget from './PointTrackerWidget';
import TopStreakWidget from './TopStreakWidget';
import FoodScannerWidget from './FoodScannerWidget';
import Chatbot from './Chatbot'; // Import Chatbot
import { useHabits } from '../context/HabitContext';
import type { Habit, Notification } from '../types';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-habits' | 'shared' | 'friends' | 'premium' | 'food-scanner' | 'refinement'>('my-habits');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [habitToShare, setHabitToShare] = useState<Habit | null>(null);
  const [popupNotification, setPopupNotification] = useState<Notification | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat state
  const [panicHabit, setPanicHabit] = useState<string | null>(null); // State for panic context

  const { state, dispatch } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  useEffect(() => {
    const socialNotification = state.notifications.find(
      n => !n.isRead && n.type === 'SOCIAL_COMPLETION'
    );
    if (socialNotification) {
      setPopupNotification(socialNotification);
    }
  }, [state.notifications]);


  const handleOpenShareModal = (habit: Habit) => {
    setHabitToShare(habit);
    setIsShareModalOpen(true);
  };

  const handleClosePopup = (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATIONS_AS_READ', payload: { ids: [id] } });
      setPopupNotification(null);
  }

  // Handle Panic Button Click from Habit Item
  const handlePanic = (habit: Habit) => {
      setPanicHabit(habit.name);
      setIsChatOpen(true);
  };

  const selectedHabit = state.habits.find(h => h.id === selectedHabitId);
  
  const tabs = [
      { id: 'my-habits', label: 'My Habits', icon: '🧘' },
      { id: 'shared', label: 'Shared', icon: '👥' },
      { id: 'friends', label: 'Friends', icon: '👋' },
      { id: 'food-scanner', label: 'Scanner', icon: '📸' }, 
      { id: 'refinement', label: 'Coach', icon: '🧬' }, 
      { id: 'premium', label: 'Premium', icon: '💎' },
  ] as const;

  const isFullWidthTab = activeTab === 'premium' || activeTab === 'food-scanner' || activeTab === 'refinement';

  return (
    <div className="min-h-screen bg-base-200 dark:bg-neutral">
      {popupNotification && (
          <MotivationalPopup
              notification={popupNotification}
              onClose={() => handleClosePopup(popupNotification.id)}
          />
      )}
      <Header onAddHabit={() => setIsAddModalOpen(true)} />
      <main className="container mx-auto p-3 md:p-8">
        {selectedHabit ? (
          selectedHabit.sharingDetails ? (
            <SharedProgressPage habit={selectedHabit} onBack={() => setSelectedHabitId(null)} />
          ) : (
            <ProgressPage habit={selectedHabit} onBack={() => setSelectedHabitId(null)} />
          )
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-2xl mb-6 md:mb-8 overflow-x-auto no-scrollbar max-w-3xl mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'bg-white dark:bg-neutral-focus text-primary shadow-sm scale-100' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5'
                            }
                        `}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 animate-fade-in">
                <div className={`lg:col-span-2 space-y-4 md:space-y-8 ${isFullWidthTab ? 'lg:col-span-3' : ''}`}>
                  {activeTab === 'my-habits' && (
                      <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {/* Premium Banner */}
                             {!state.user.isPremium && (
                                <div 
                                    onClick={() => setActiveTab('premium')}
                                    className="md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:shadow-xl transition-shadow h-full min-h-[140px] md:min-h-[160px]"
                                >
                                    <div className="mb-4 sm:mb-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-2xl">👑</span>
                                            <h3 className="text-lg md:text-xl font-bold">Unlock Premium Insights</h3>
                                        </div>
                                        <p className="text-gray-300 text-xs md:text-sm max-w-md">Get AI-powered predictions and analytics.</p>
                                    </div>
                                    <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition transform hover:scale-105 shadow-md whitespace-nowrap text-xs md:text-sm">
                                        Upgrade
                                    </button>
                                </div>
                             )}
                             
                             <div className="col-span-1 h-32 md:h-40 lg:h-auto"><CalorieWidget /></div>
                             <div className="col-span-1 h-32 md:h-40 lg:h-auto"><PointTrackerWidget /></div>
                             <div className="col-span-1 h-32 md:h-40 lg:h-auto"><TopStreakWidget /></div>
                             <div className="col-span-1 h-32 md:h-40 lg:h-auto"><FoodScannerWidget onClick={() => setActiveTab('food-scanner')} /></div>
                          </div>

                          {/* Pass onPanic handler to HabitList */}
                          <HabitList 
                            filter="personal" 
                            onViewProgress={(habitId) => setSelectedHabitId(habitId)} 
                            onShare={handleOpenShareModal}
                            onPanic={handlePanic} 
                          />
                      </>
                  )}
                  
                  {activeTab === 'shared' && (
                      <HabitList filter="shared" onViewProgress={(habitId) => setSelectedHabitId(habitId)} onShare={handleOpenShareModal} />
                  )}
                  
                  {activeTab === 'friends' && <FriendsView />}
                  {activeTab === 'food-scanner' && <FoodScannerView />}
                  {activeTab === 'refinement' && <GoalRefinementView />}
                  {activeTab === 'premium' && <PremiumView />}
                </div>
                
                {!isFullWidthTab && (
                    <div className="space-y-8">
                        <AchievementsPanel />
                        {activeTab === 'friends' && (
                            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                                <h3 className="font-bold text-primary mb-2">Invite Friends</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Sharing habits increases your success rate by 3x. Invite a friend to a habit today!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </>
        )}
      </main>
      
      {/* Floating Chatbot Button (always visible unless chat is open) */}
      {!isChatOpen && (
          <button 
            onClick={() => { setPanicHabit(null); setIsChatOpen(true); }}
            className="fixed bottom-6 right-6 bg-primary hover:bg-primary-focus text-white p-4 rounded-full shadow-2xl z-40 transition-transform hover:scale-110 animate-fade-in"
            title="Chat with Forgey"
          >
              <span className="text-2xl">🤖</span>
          </button>
      )}

      {/* Chatbot Window */}
      {isChatOpen && (
          <Chatbot onClose={() => setIsChatOpen(false)} panicContext={panicHabit || undefined} />
      )}

      <AddHabitModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      {habitToShare && (
        <ShareHabitModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            habit={habitToShare}
        />
      )}
    </div>
  );
};

export default Dashboard;
