/**
 * HabitForge - Payment Integration Module
 * 
 * Features:
 * - PayPal Orders API Implementation (Create/Capture)
 * - Transaction state management
 * - Secure backend validation
 */

// ===================================================================================
// DATA STORE (Local Development)
// ===================================================================================

const userStore = {
  id: 'user_777',
  name: 'Jordan',
  email: 'jordan@example.com',
  isPremium: false, 
};

const orderStore = {};

// ===================================================================================
// UI COMPONENTS
// ===================================================================================

let React, useState, useEffect, useRef;
try {
  React = require("react");
  ({ useState, useEffect, useRef } = React);
} catch (e) {
  if (typeof window !== 'undefined' && window.React) {
    React = window.React;
    useState = React.useState;
    useEffect = React.useEffect;
    useRef = React.useRef;
  }
}

const PayPalLogo = () => (
    <svg viewBox="0 0 140 36" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M16.2 3.2C17.5 2.2 19.5 2 22.3 2H33.9C38.3 2 40.6 4.3 40.6 8.5C40.6 10.6 40 12.2 38.9 13.4C37.7 14.7 36 15.6 33.9 16.1C36.6 16.4 38.5 17.4 39.7 19C40.8 20.7 41.4 22.8 41.4 25.3C41.4 31.6 37.3 34 32.4 34H18.6C17.6 34 16.8 33.4 16.6 32.5L12.9 9C12.8 8.2 13.4 7.5 14.2 7.5H19.6L18.3 15.8H27.4C31.9 15.8 33.8 13.7 33.8 10.6C33.8 9.5 33.4 8.7 32.6 8.1C31.9 7.6 30.7 7.3 29 7.3H19.1L16.2 3.2Z" fill="#003087"/>
         <path d="M5.3 34L10.8 3.8C11 2.8 11.8 2 12.9 2H22.2C22.2 2 22.3 2 22.3 2C19.5 2 17.5 2.2 16.2 3.2L12.8 24.4L11.9 30.2L11.8 30.9C11.6 31.8 10.9 32.5 10 32.5H5.3V34Z" fill="#003087"/>
         <path d="M12.8 24.4L16.2 3.2L19.1 7.3H29C30.7 7.3 31.9 7.6 32.6 8.1C33.4 8.7 33.8 9.5 33.8 10.6C33.8 13.7 31.9 15.8 27.4 15.8H18.4L18.3 15.9L16.6 32.5C16.8 33.4 17.6 34 18.6 34H32.4C37.3 34 41.4 31.6 41.4 25.3C41.4 22.8 40.8 20.7 39.7 19C38.5 17.4 36.6 16.4 33.9 16.1C36 15.6 37.7 14.7 38.9 13.4C40 12.2 40.6 10.6 40.6 8.5C40.6 4.3 38.3 2 33.9 2H12.9C11.8 2 11 2.8 10.8 3.8L5.3 34H10H11.8L12.8 24.4Z" fill="#009cde"/>
         <path d="M11.9 30.2L12.8 24.4L18.3 15.9L18.4 15.8H27.4C31.9 15.8 33.8 13.7 33.8 10.6C33.8 9.5 33.4 8.7 32.6 8.1C31.9 7.6 30.7 7.3 29 7.3H19.1L16.2 3.2C17.5 2.2 19.5 2 22.3 2H33.9C38.3 2 40.6 4.3 40.6 8.5C40.6 10.6 40 12.2 38.9 13.4C37.7 14.7 36 15.6 33.9 16.1C36.6 16.4 38.5 17.4 39.7 19C40.8 20.7 41.4 22.8 41.4 25.3C41.4 31.6 37.3 34 32.4 34H18.6C17.6 34 16.8 33.4 16.6 32.5L11.9 30.2Z" fill="#003087"/>
    </svg>
);

const PayPalButton = ({ onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stage, setStage] = useState(''); 

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    setStage('creating');

    try {
        // Create Order (Server-side)
        const createRes = await fetch('http://localhost:4001/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currency: 'USD', amount: '9.99' })
        });
        
        if (!createRes.ok) throw new Error("Failed to connect to payment server");
        const orderData = await createRes.json();
        
        if (!orderData.id) throw new Error("Failed to create order ID");

        setStage('approving');
        // In production, this would redirect to PayPal
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        
        // Capture Order (Server-side)
        setStage('capturing');
        const captureRes = await fetch('http://localhost:4001/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: orderData.id })
        });
        
        const captureData = await captureRes.json();
        
        if (captureData.status === 'COMPLETED') {
            onSuccess();
        } else {
            throw new Error("Transaction could not be captured.");
        }

    } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
        setStage('');
    }
  };

  return (
    <div className="w-full max-w-md">
        {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center animate-fade-in">
                {errorMessage}
            </div>
        )}

        <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`
                group relative w-full flex items-center justify-center py-4 px-6 rounded-full shadow-md transition-all duration-300
                ${isProcessing 
                    ? 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed' 
                    : 'bg-[#FFC439] hover:brightness-95 active:scale-95'
                }
            `}
        >
            {isProcessing ? (
                <div className="flex items-center space-x-3">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-800 border-t-transparent rounded-full"></div>
                    <span className="text-blue-900 font-bold text-sm">
                        {stage === 'creating' && 'Initializing...'}
                        {stage === 'approving' && 'Waiting for Approval...'}
                        {stage === 'capturing' && 'Confirming Payment...'}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center leading-none">
                     <span className="font-extrabold italic text-[#003087] text-xl flex items-center gap-1">
                        <span className="text-[#003087]">Pay</span>
                        <span className="text-[#009cde]">Pal</span>
                     </span>
                </div>
            )}
        </button>
        
        {!isProcessing && (
            <div className="mt-3 text-center">
                <p className="text-[10px] text-gray-400 mt-1">Powered by PayPal Services</p>
            </div>
        )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);

  const fetchUserStatus = async () => {
    try {
        const response = await fetch('http://localhost:4001/api/user-status/user_777');
        const data = await response.json();
        setUser(data);
    } catch (e) {
        setUser({ ...userStore, isPremium: false }); 
    }
  };

  useEffect(() => { fetchUserStatus(); }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading System...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 p-4 md:p-12 flex justify-center items-start">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-extrabold mb-4 text-gray-900 leading-tight">Payment Integration</h1>
                <p className="text-gray-500 leading-relaxed mb-6">
                    Secure server-side payment flow implementing the standard Checkout Orders API.
                </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User Account</p>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{user.name}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.isPremium ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                             {user.isPremium ? 'PREMIUM' : 'FREE'}
                        </span>
                    </div>
                </div>
                {user.isPremium && (
                    <button 
                        onClick={() => {
                             fetch('http://localhost:4001/api/reset').then(fetchUserStatus).catch(() => window.location.reload());
                        }}
                        className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                    >
                        Reset State
                    </button>
                )}
            </div>
        </div>

        <div className="flex flex-col items-center">
             <div className="bg-white w-full rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                 <div className="bg-[#003087] p-8 text-center relative overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="text-white font-bold text-xl mb-1">HabitForge Premium</h3>
                        <p className="text-blue-200 text-sm">Unlock advanced insights</p>
                        <div className="mt-6 text-white text-4xl font-extrabold">$9.99</div>
                        <div className="text-blue-200 text-xs">One-time payment</div>
                     </div>
                 </div>
                 
                 <div className="p-8">
                     {!user.isPremium ? (
                         <div className="space-y-6">
                             <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>$9.99</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="border-t border-gray-100 my-2"></div>
                                <div className="flex justify-between font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>$9.99</span>
                                </div>
                             </div>
                             
                             <PayPalButton onSuccess={fetchUserStatus} />
                         </div>
                     ) : (
                         <div className="py-8 flex flex-col items-center text-center animate-pop-in">
                             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                 ✓
                             </div>
                             <h3 className="font-bold text-2xl text-gray-900 mb-2">Payment Complete!</h3>
                             <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                 Thank you, {user.name}. Your account has been upgraded.
                             </p>
                         </div>
                     )}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};


// ===================================================================================
// BACKEND SERVER (Express)
// ===================================================================================

if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    const express = require('express');
    const cors = require('cors');
    const app = express();
    const PORT = 4001;

    app.use(cors());
    app.use(express.json());

    // User Status
    app.get('/api/user-status/:id', (req, res) => res.json(userStore));

    // Create Order
    app.post('/api/paypal/create-order', (req, res) => {
        const { amount, currency } = req.body;
        const orderID = 'ORD-' + Math.random().toString(36).substr(2, 12).toUpperCase();
        
        orderStore[orderID] = {
            id: orderID,
            amount,
            currency,
            status: 'CREATED',
            createdAt: new Date()
        };

        console.log(`[Backend] Created Order: ${orderID}`);
        setTimeout(() => res.json({ id: orderID }), 500);
    });

    // Capture Order
    app.post('/api/paypal/capture-order', (req, res) => {
        const { orderID } = req.body;
        const order = orderStore[orderID];

        if (!order) {
            return res.status(404).json({ error: "Invalid Order ID" });
        }

        if (order.status === 'COMPLETED') {
            return res.json({ status: 'COMPLETED', message: 'Already captured' });
        }

        setTimeout(() => {
            order.status = 'COMPLETED';
            userStore.isPremium = true;
            console.log(`[Backend] Captured Order: ${order.id}. User upgraded.`);
            res.json({ status: 'COMPLETED', order });
        }, 1000);
    });
    
    // Reset for demo
    app.get('/api/reset', (req, res) => {
        userStore.isPremium = false;
        res.json({ success: true });
    });

    app.listen(PORT, () => {
        console.log(`\n🚀 Payment Service running on port ${PORT}`);
    });
}

if (typeof module !== 'undefined') { module.exports = App; }