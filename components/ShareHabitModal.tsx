
import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import type { Habit, SharedHabitData } from '../types';

interface ShareHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
}

const getSharedHabitData = (sharedHabitId?: string): SharedHabitData | null => {
    if (!sharedHabitId) return null;
    try {
        const db = localStorage.getItem('habitForgeSharedDB');
        const parsedDB = db ? JSON.parse(db) : {};
        return parsedDB[sharedHabitId] || null;
    } catch {
        return null;
    }
}

const ShareHabitModal: React.FC<ShareHabitModalProps> = ({ isOpen, onClose, habit }) => {
  const [friendEmail, setFriendEmail] = useState('');
  const { dispatch, userEmail } = useHabits();
  const [sharedData, setSharedData] = useState<SharedHabitData | null>(null);

  useEffect(() => {
    if (isOpen) {
        setSharedData(getSharedHabitData(habit.sharingDetails?.sharedHabitId));
    }
  }, [isOpen, habit, habit.sharingDetails]); // Re-fetch data if habit sharing details change

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendEmail.trim()) {
      dispatch({ type: 'SHARE_HABIT', payload: { habit, friendEmail: friendEmail.trim() } });
      setFriendEmail('');
      // Force a refresh of the shared data after sharing
      setTimeout(() => setSharedData(getSharedHabitData(habit.sharingDetails?.sharedHabitId)), 100);
    }
  };
  
  const handleRemoveMember = (memberEmail: string) => {
    if (window.confirm(`Are you sure you want to remove this member from the habit?`)) {
        dispatch({ type: 'UNSHARE_HABIT_WITH_MEMBER', payload: { habit, memberEmail }});
        setTimeout(() => setSharedData(getSharedHabitData(habit.sharingDetails?.sharedHabitId)), 100);
    }
  }

  if (!isOpen) return null;
  
  const isOwner = sharedData?.ownerEmail === userEmail;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-xl p-8 w-full max-w-md animate-pop-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2 text-neutral dark:text-gray-100">Share "{habit.name}"</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Invite friends to join this habit and motivate each other.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="email"
              value={friendEmail}
              onChange={e => setFriendEmail(e.target.value)}
              className="flex-grow px-4 py-3 bg-white dark:bg-neutral border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Friend's email address"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-focus shadow-lg shadow-primary/30 transition"
            >
              Invite
            </button>
          </div>
        </form>
        
        {sharedData && sharedData.members.length > 0 && (
            <div className="mt-8">
                <h3 className="font-semibold text-neutral dark:text-gray-200 mb-3">Sharing with:</h3>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {sharedData.members.map(member => (
                        <li key={member.email} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-base-200 dark:bg-neutral p-2 rounded-lg">
                            <span>{member.name} ({member.email === userEmail ? "You" : member.email})</span>
                            {isOwner && member.email !== userEmail && (
                                <button onClick={() => handleRemoveMember(member.email)} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-base-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareHabitModal;
