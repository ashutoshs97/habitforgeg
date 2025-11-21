
import React from 'react';

interface FoodScannerWidgetProps {
  onClick: () => void;
}

const FoodScannerWidget: React.FC<FoodScannerWidgetProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-sm border border-emerald-600 h-full flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] group"
    >
      {/* Background Element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>

      <div className="relative z-10">
          <h3 className="font-bold text-xs uppercase tracking-wider opacity-80 mb-1">Quick Action</h3>
          <div className="text-2xl font-extrabold flex items-center gap-2">
              <span>Scanner</span>
          </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium opacity-90">Snap & Track Calories</div>
          <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
      </div>
    </div>
  );
};

export default FoodScannerWidget;
