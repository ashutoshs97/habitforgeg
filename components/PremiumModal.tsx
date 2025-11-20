
import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useHabits();
  const { isPremium } = state.user;
  
  // Payment Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Reset state when modal opens/closes
  useEffect(() => {
      if(isOpen) {
          setPaymentStatus('idle');
          setCardNumber('');
          setExpiry('');
          setCvc('');
          setName('');
          setIsProcessing(false);
      }
  }, [isOpen]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length <= 19) {
          setCardNumber(formatCardNumber(val));
      }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API processing time
    setTimeout(() => {
        setIsProcessing(false);
        setPaymentStatus('success');
        
        // Grant Premium Status
        setTimeout(() => {
            dispatch({ type: 'UPGRADE_TO_PREMIUM' });
        }, 1000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-pop-in max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Left Section: Benefits (Visible on Desktop) */}
        <div className={`p-8 md:w-1/2 flex flex-col justify-center text-white bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden`}>
           <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                   <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                       <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                   </pattern>
                   <rect width="100%" height="100%" fill="url(#grid)" />
               </svg>
           </div>
           
           <div className="relative z-10">
               <div className="inline-block p-3 bg-white/10 backdrop-blur-md rounded-2xl text-4xl mb-6 shadow-lg">💎</div>
               <h2 className="text-3xl font-bold mb-2">Premium Insights</h2>
               <p className="text-gray-300 mb-8 text-lg leading-relaxed">Upgrade your habit tracking with AI-powered analytics and unlimited history.</p>
               
               <ul className="space-y-4">
                   {[
                       "Unlimited Habit History",
                       "AI-Powered Streak Predictions",
                       "Advanced Data Visualizations",
                       "Exclusive 'Supporter' Badge"
                   ].map((item, i) => (
                       <li key={i} className="flex items-center text-gray-200">
                           <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 text-green-400">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                           </div>
                           {item}
                       </li>
                   ))}
               </ul>
               
               <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center">
                   <div>
                       <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Price</p>
                       <p className="text-3xl font-bold text-white">$9.99</p>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Access</p>
                       <p className="text-white font-medium">Lifetime</p>
                   </div>
               </div>
           </div>
        </div>

        {/* Right Section: Payment Form */}
        <div className="md:w-1/2 bg-white dark:bg-neutral p-8 flex flex-col relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {isPremium || paymentStatus === 'success' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Premium!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Your transaction was successful. Enjoy your new features.</p>
                    <button onClick={onClose} className="w-full py-3 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-bold rounded-xl transition-all transform hover:scale-105">
                        Continue to Dashboard
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded">SECURE</span>
                            Payment Details
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your details to upgrade.</p>
                    </div>

                    <form onSubmit={handlePay} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Cardholder Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-focus border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Card Number</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    required
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={handleCardChange}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-neutral-focus border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition font-mono"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Expiry</label>
                                <input 
                                    type="text" 
                                    required
                                    maxLength={5}
                                    value={expiry}
                                    onChange={e => {
                                        let v = e.target.value.replace(/[^0-9]/g, '');
                                        if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                                        setExpiry(v);
                                    }}
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-focus border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-center"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">CVC</label>
                                <input 
                                    type="text" 
                                    required
                                    maxLength={3}
                                    value={cvc}
                                    onChange={e => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="123"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-focus border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-center"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-focus text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-95 flex justify-center items-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    `Pay $9.99`
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4 flex justify-center items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                SSL Encrypted Transaction
                            </p>
                        </div>
                    </form>
                    
                    {/* Test Credentials Hint */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-300 text-center">
                            <strong>Demo Mode:</strong> You can use any non-empty values to test the upgrade flow. No real charge will be made.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
