
import React, { useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import type { SharedHabitData } from '../types';

const getSharedHabitsDB = (): Record<string, SharedHabitData> => {
    try {
        const db = localStorage.getItem('habitForgeSharedDB');
        return db ? JSON.parse(db) : {};
    } catch {
        return {};
    }
}

const FriendsView: React.FC = () => {
    const { state, userEmail } = useHabits();

    // Derive unique friends list from all shared habits
    const friends = useMemo(() => {
        const db = getSharedHabitsDB();
        const friendMap = new Map<string, { name: string; email: string; sharedHabitsCount: number }>();

        Object.values(db).forEach(sharedHabit => {
            const isMember = sharedHabit.members.some(m => m.email === userEmail);
            if (!isMember) return;

            sharedHabit.members.forEach(member => {
                if (member.email !== userEmail) {
                    if (friendMap.has(member.email)) {
                        const existing = friendMap.get(member.email)!;
                        existing.sharedHabitsCount += 1;
                    } else {
                        friendMap.set(member.email, {
                            name: member.name,
                            email: member.email,
                            sharedHabitsCount: 1
                        });
                    }
                }
            });
        });

        return Array.from(friendMap.values());
    }, [state.habits, userEmail]);

    if (friends.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-lg p-12 text-center animate-fade-in border border-gray-200 dark:border-gray-700 border-dashed">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold mb-2 text-neutral dark:text-white">No Friends Yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Start sharing habits to build your circle. When you invite someone to a habit, they'll appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {friends.map(friend => (
                <div key={friend.email} className="bg-white dark:bg-neutral-focus rounded-2xl shadow-md p-6 flex items-center space-x-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                        {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral dark:text-gray-100">{friend.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                        <div className="mt-2 inline-block bg-base-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {friend.sharedHabitsCount} Shared Habit{friend.sharedHabitsCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendsView;
