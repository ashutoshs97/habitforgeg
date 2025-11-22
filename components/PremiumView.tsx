
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import PremiumModal from './PremiumModal';

const PremiumView: React.FC = () => {
  const { state } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden text-white relative">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
               <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid-pattern)" />
           </svg>
        </div>

        <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">💎</div>
                    <span className="text-yellow-400 font-bold tracking-wider uppercase text-xs md:text-sm">Premium Access</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight">
                    {state.user.isPremium ? "You are a Premium Member" : "Unlock Your Full Potential"}
                </h2>
                <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 max-w-xl">
                    {state.user.isPremium 
                        ? "Thank you for supporting HabitForge. You have access to all advanced features, AI insights, and unlimited history."
                        : "Get AI-powered habit predictions, advanced analytics, unlimited history, and exclusive themes to supercharge your growth."}
                </p>
                
                {!state.user.isPremium && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-base md:text-lg transition-transform transform hover:scale-105 shadow-xl"
                    >
                        Upgrade for $9.99
                    </button>
                )}
            </div>
            
            <div className="md:w-1/3 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 w-full">
                <h3 className="font-bold text-lg md:text-xl mb-4">Included Features</h3>
                <ul className="space-y-4">
                   {[
                       "Unlimited Habit History",
                       "AI-Powered Streak Predictions",
                       "Advanced Data Visualizations",
                       "Exclusive 'Supporter' Badge",
                       "Priority Support"
                   ].map((item, i) => (
                       <li key={i} className="flex items-center text-gray-200 text-sm md:text-base">
                           <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 text-green-400 shrink-0">
                               <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                           </div>
                           {item}
                       </li>
                   ))}
               </ul>
            </div>
        </div>
      </div>
      
      <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default PremiumView;
