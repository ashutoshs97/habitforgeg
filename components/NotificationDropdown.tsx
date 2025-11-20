
import React from 'react';
import { useHabits } from '../context/HabitContext';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { state, dispatch } = useHabits();

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_AS_READ' });
  };
  
  const sortedNotifications = [...state.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-focus rounded-xl shadow-2xl border dark:border-gray-700 animate-pop-in z-50">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h4 className="font-bold text-neutral dark:text-white">Notifications</h4>
        <button
          onClick={handleMarkAllRead}
          className="text-sm text-primary hover:underline font-semibold"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {sortedNotifications.length > 0 ? (
          sortedNotifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-8">
            You have no new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;