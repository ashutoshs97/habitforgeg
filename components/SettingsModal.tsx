import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PremiumModal from './PremiumModal';

// API Configuration
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useHabits();
    const { user, settings } = state;
    const { currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const handleCancelSubscription = () => {
        if (window.confirm("Are you sure you want to cancel your Premium subscription? You will lose access to exclusive features.")) {
            dispatch({ type: 'CANCEL_SUBSCRIPTION' });
        }
    };

    const handleDeleteAccount = () => {
        const confirmText = prompt("This will permanently delete your account and all habit data. Type 'DELETE' to confirm.");
        if (confirmText === 'DELETE') {
            alert("Account deletion simulation: Your data would be wiped here.");
            // In a real app, calls API then signOut()
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const { habits } = state;
            
            const response = await fetch(`${API_URL}/api/export/csv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ habits })
            });

            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `habitforge_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to download data. Please try again later.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!settings.emailNotifs) {
            alert("Please enable Email Digests first.");
            return;
        }
        setIsSendingEmail(true);
        try {
            const response = await fetch(`${API_URL}/api/reminders/send-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser?.email })
            });
            
            const data = await response.json();
            if (data.success) {
                alert(`Test reminder sent to ${currentUser?.email}!`);
            } else {
                throw new Error("Failed to send");
            }
        } catch (error) {
            console.error("Email error:", error);
            alert("Could not send test email. Ensure backend is running.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
             <div className="bg-white dark:bg-neutral-focus w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-pop-in max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-focus z-10">
                    <h2 className="text-2xl font-bold text-neutral dark:text-white">Settings</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Profile Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-neutral dark:text-gray-200 mb-4">Profile</h3>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-neutral dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                                <button className="text-xs text-primary hover:underline mt-1">Edit Profile</button>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* General Preferences */}
                    <section>
                         <h3 className="text-lg font-semibold text-neutral dark:text-gray-200 mb-4">General Preferences</h3>
                         <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-neutral dark:text-gray-200">Appearance</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 transition text-sm font-medium text-neutral dark:text-white"
                                 >
                                    {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                                 </button>
                             </div>

                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-neutral dark:text-gray-200">Start of Week</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Adjust calendar views</p>
                                 </div>
                                 <div className="flex bg-base-200 dark:bg-gray-800 rounded-lg p-1 border border-gray-300 dark:border-gray-600">
                                     <button 
                                        type="button"
                                        onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { startOfWeek: 'Sun' } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition ${settings.startOfWeek === 'Sun' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
                                     >
                                         Sunday
                                     </button>
                                     <button 
                                        type="button"
                                        onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { startOfWeek: 'Mon' } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition ${settings.startOfWeek === 'Mon' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
                                     >
                                         Monday
                                     </button>
                                 </div>
                             </div>

                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-neutral dark:text-gray-200">Sound Effects</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Play sounds on completion & achievements</p>
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { soundEnabled: !settings.soundEnabled } })}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${settings.soundEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                                 >
                                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.soundEnabled ? 'translate-x-5' : ''}`} />
                                 </button>
                             </div>
                         </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Notifications */}
                    <section>
                         <h3 className="text-lg font-semibold text-neutral dark:text-gray-200 mb-4">Notifications</h3>
                         <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-neutral dark:text-gray-200">Daily Reminder</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Get a nudge to check your habits</p>
                                 </div>
                                 <input 
                                    type="time" 
                                    value={settings.reminderTime}
                                    onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { reminderTime: e.target.value } })}
                                    className="bg-base-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                 />
                             </div>

                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-neutral dark:text-gray-200">Email Digests</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Weekly summary of your progress</p>
                                     {settings.emailNotifs && (
                                         <button 
                                            onClick={handleSendTestEmail}
                                            disabled={isSendingEmail}
                                            className="text-xs text-primary hover:text-primary-focus underline mt-1 disabled:opacity-50"
                                         >
                                             {isSendingEmail ? 'Sending...' : 'Send Test Email'}
                                         </button>
                                     )}
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { emailNotifs: !settings.emailNotifs } })}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${settings.emailNotifs ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                                 >
                                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.emailNotifs ? 'translate-x-5' : ''}`} />
                                 </button>
                             </div>

                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-neutral dark:text-gray-200">Social Activity</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Alerts when friends interact</p>
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { socialNotifs: !settings.socialNotifs } })}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${settings.socialNotifs ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                                 >
                                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.socialNotifs ? 'translate-x-5' : ''}`} />
                                 </button>
                             </div>
                         </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Subscription Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-neutral dark:text-gray-200 mb-4">Subscription</h3>
                        <div className="bg-base-200 dark:bg-neutral p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Current Plan</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xl font-bold ${user.isPremium ? 'text-primary' : 'text-neutral dark:text-white'}`}>
                                            {user.isPremium ? 'Premium Plan' : 'Free Plan'}
                                        </span>
                                        {user.isPremium && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-200">
                                                PRO
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {user.isPremium ? (
                                     <div className="text-right">
                                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                            Active
                                        </p>
                                     </div>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                {user.isPremium ? (
                                    <button 
                                        type="button"
                                        onClick={handleCancelSubscription}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                    >
                                        Cancel Subscription
                                    </button>
                                ) : (
                                     <button 
                                        type="button"
                                        onClick={() => setIsPremiumModalOpen(true)}
                                        className="bg-primary hover:bg-primary-focus text-white font-medium text-sm px-6 py-2 rounded-lg shadow-md transition"
                                    >
                                        Upgrade to Premium
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                    
                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Data Management Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-neutral dark:text-gray-200 mb-4">Data Management</h3>
                        <div className="bg-base-200 dark:bg-neutral p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-neutral dark:text-white">Export Data</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download your complete habit history as a CSV file.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={handleExportData}
                                disabled={isExporting}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-neutral dark:text-white flex items-center gap-2 disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Download CSV</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Danger Zone */}
                    <section>
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-800/30 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-red-600 dark:text-red-400">Delete Account</p>
                                <p className="text-sm text-red-400/80 mt-1">Permanently delete your account and all data.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium text-red-600 dark:text-red-400"
                            >
                                Delete
                            </button>
                        </div>
                    </section>
                </div>
                
                <div className="bg-gray-50 dark:bg-neutral p-4 flex justify-end sticky bottom-0 z-10 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium text-neutral dark:text-white">
                        Close
                    </button>
                </div>
             </div>
             
             <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
        </div>
    );
};

export default SettingsModal;