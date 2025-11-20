
import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const safePercentage = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full bg-base-300 dark:bg-neutral rounded-full h-2.5">
      <div
        className="bg-secondary h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${safePercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;