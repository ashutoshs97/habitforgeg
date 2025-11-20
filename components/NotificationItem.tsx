
import React from 'react';
import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
}

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'ACHIEVEMENT':
      return '🏆';
    case 'STREAK_MILESTONE':
      return '🔥';
    case 'SOCIAL_INVITE':
      return '💌';
    case 'SOCIAL_COMPLETION':
      return '🤝';
    case 'SOCIAL_COMMENT':
      return '💬';
    default:
      return '🔔';
  }
};

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  return (
    <div className="p-4 flex items-start space-x-4 border-b dark:border-gray-700/50 hover:bg-base-200 dark:hover:bg-neutral transition-colors">
      <div className="text-2xl mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1">
        <p className={`text-sm ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-neutral dark:text-gray-100 font-semibold'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {timeSince(new Date(notification.createdAt))}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
      )}
    </div>
  );
};

export default NotificationItem;
