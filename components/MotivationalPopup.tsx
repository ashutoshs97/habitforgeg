
import React, { useEffect } from 'react';
import type { Notification } from '../types';

interface MotivationalPopupProps {
  notification: Notification;
  onClose: () => void;
}

const MotivationalPopup: React.FC<MotivationalPopupProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Popup disappears after 5 seconds

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const pointsMatch = notification.message.match(/\(\+(\d+) WP\)/);
  const points = pointsMatch ? parseInt(pointsMatch[1], 10) : null;

  return (
    <div className="fixed top-24 right-6 bg-white dark:bg-neutral-focus shadow-2xl rounded-2xl p-6 w-full max-w-sm z-50 animate-pop-in border-l-4 border-secondary">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-3xl mr-4">🎉</div>
        <div>
            <p className="font-bold text-neutral dark:text-white">{notification.message}</p>
            {points && (
                <p className="text-sm font-semibold text-secondary mt-1">
                    +{points} Willpower Points!
                </p>
            )}
        </div>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MotivationalPopup;
