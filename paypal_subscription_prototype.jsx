
/**
 * @file paypal_subscription_prototype.jsx
 * @description A self-contained React/Node.js (Express) application prototype.
 * This file simulates the PayPal "Create Order" -> "Approve" -> "Capture Order" flow.
 * 
 * FEATURES:
 * - Simulated Backend for PayPal Orders API.
 * - Frontend PayPalButton with "Processing" states.
 * - Prevents multiple submissions by disabling the button during the transaction.
 */

// ===================================================================================
//
// ⚙️ CONFIGURATION & MOCK DATA
//
// ===================================================================================

// Simulated User Database (In-Memory)
const mockUserDB = {
  id: 'user_777',
  name: 'Jordan',
  email: 'jordan@example.com',
  isPremium: false, 
};

// Simulated Order Store
const mockOrders = {};

// ===================================================================================
//
// ⚛️ REACT FRONTEND APPLICATION
//
// ===================================================================================

// Handle module resolution for different environments (Node vs Browser)
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

/**
 * PayPalLogo Component
 */
const PayPalLogo = () => (
    <svg viewBox="0 0 140 36" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M16.2 3.2C17.5 2.2 19.5 2 22.3 2H33.9C38.3 2 40.6 4.3 40.6 8.5C40.6 10.6 40 12.2 38.9 13.4C37.7 14.7 36 15.6 33.9 16.1C36.6 16.4 38.5 17.4 39.7 19C40.8 20.7 41.4 22.8 41.4 25.3C41.4 31.6 37.3 34 32.4 34H18.6C17.6 34 16.8 33.4 16.6 32.5L12.9 9C12.8 8.2 13.4 7.5 14.2 7.5H19.6L18.3 15.8H27.4C31.9 15.8 33.8 13.7 33.8 10.6C33.8 9.5 33.4 8.7 32.6 8.1C31.9 7.6 30.7 7.3 29 7.3H19.1L16.2 3.2Z" fill="#003087"/>
         <path d="M5.3 34L10.8 3.8C11 2.8 11.8 2 12.9 2H22.2C22.2 2 22.3 2 22.3 2C19.5 2 17.5 2.2 16.2 3.2L12.8 24.4L11.9 30.2L11.8 30.9C11.6 31.8 10.9 32.5 10 32.5H5.3V34Z" fill="#003087"/>
         <path d="M12.8 24.4L16.2 3.2L19.1 7.3H29C30.7 7.3 31.9 7.6 32.6 8.1C33.4 8.7 33.8 9.5 33.8 10.6C33.8 13.7 31.9 15.8 27.4 15.8H18.4L18.3 15.9L16.6 32.5C16.8 33.4 17.6 34 18.6 34H32.4C37.3 34 41.4 31.6 41.4 25.3C41.4 22.8 40.8 20.7 39.7 19C38.5 17.4 36.6 16.4 33.9 16.1C36 15.6 37.7 14.7 38.9 13.4C40 12.2 40.6 10.6 40.6 8.5C40.6 4.3 38.3 2 33.9 2H12.9C11.8 2 11 2.8 10.8 3.8L5.3 34H10H11.8L12.8 24.4Z" fill="#009cde"/>
         <path d="M11.9 30.2L12.8 24.4L18.3 15.9L18.4 15.8H27.4C31.9 15.8 33.8 13.7 33.8 10.6C33.8 9.5 33.4 8.7 32.6 8.1C31.9 7.6 30.7 7.3 29 7.3H19.1L16.2 3.2C17.5 2.2 19.5 2 22.3 2H33.9C38.3 2 40.6 4.3 40.6 8.5C40.6 10.6 40 12.2 38.9 13.4C37.7 14.7 36 15.6 33.9 16.1C36.6 16.4 38.5 17.4 39.7 19C40.8 20.7 41.4 22.8 41.4 25.3C41.4 31.6 37.3 34 32.4 34H18.6C17.6 34 16.8 33.4 16.6 32.5L11.9 30.2Z" fill="#003087"/>
    </svg>
);

/**
 * PayPalButton Component
 * Handles the full payment lifecycle: Create -> Approve -> Capture
 */
const PayPalButton = ({ onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stage, setStage] = useState(''); // 'creating', 'approving', 'capturing'

  const handlePayment = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    
    setIsProcessing(true);
    setErrorMessage('');
    setStage('creating');

    try {
        // 1. Create Order (Backend)
        const createRes = await fetch('http://localhost:4001/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currency: 'USD', amount: '9.99' })
        });
        
        if (!createRes.ok) throw new Error("Failed to connect to payment server");
        const orderData = await createRes.json();
        
        if (!orderData.id) throw new Error("Failed to create order ID");

        // 2. Simulate User Approval (Frontend/PayPal Popup)
        setStage('approving');
        // In a real app, the PayPal popup opens here. We simulate the user logging in and clicking "Pay Now".
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for "login"
        
        // 3. Capture Order (Backend)
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
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                    <svg className="animate-spin h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-blue-900 font-bold text-sm">
                        {stage === 'creating' && 'Initializing...'}
                        {stage === 'approving' && 'Waiting for Approval...'}
                        {stage === 'capturing' && 'Confirming Payment...'}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center leading-none">
                     {/* Mock PayPal Button Visual */}
                     <span className="font-extrabold italic text-[#003087] text-xl flex items-center gap-1">
                        <span className="text-[#003087]">Pay</span>
                        <span className="text-[#009cde]">Pal</span>
                     </span>
                </div>
            )}
            
            {!isProcessing && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#003087]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            )}
        </button>
        
        {!isProcessing && (
            <div className="mt-3 text-center">
                <div className="flex justify-center space-x-2 grayscale opacity-50">
                    <div className="h-4 w-8 bg-gray-300 rounded"></div>
                    <div className="h-4 w-8 bg-gray-300 rounded"></div>
                    <div className="h-4 w-8 bg-gray-300 rounded"></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Powered by PayPal Sandbox</p>
            </div>
        )}
    </div>
  );
};

/**
 * Main Prototype App Component
 */
const App = () => {
  const [user, setUser] = useState(null);

  const fetchUserStatus = async () => {
    try {
        const response = await fetch('http://localhost:4001/api/user-status/user_777');
        const data = await response.json();
        setUser(data);
    } catch (e) {
        // Fallback if backend isn't running
        setUser({ ...mockUserDB, isPremium: false }); 
    }
  };

  useEffect(() => { fetchUserStatus(); }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Initializing Prototype...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 p-4 md:p-12 flex justify-center items-start">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Context & Status */}
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-extrabold mb-4 text-gray-900 leading-tight">PayPal Integration Prototype</h1>
                <p className="text-gray-500 leading-relaxed mb-6">
                    This prototype demonstrates a secure server-side payment flow using the PayPal Orders API.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                        <span>Client requests order creation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                        <span>User approves payment (simulated)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
                        <span>Server captures funds & updates DB</span>
                    </div>
                </div>
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

        {/* Right Column: The Checkout Flow */}
        <div className="flex flex-col items-center">
             <div className="bg-white w-full rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                 <div className="bg-[#003087] p-8 text-center relative overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="text-white font-bold text-xl mb-1">HabitForge Premium</h3>
                        <p className="text-blue-200 text-sm">Unlock advanced insights</p>
                        <div className="mt-6 text-white text-4xl font-extrabold">$9.99</div>
                        <div className="text-blue-200 text-xs">One-time payment</div>
                     </div>
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
                     <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
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
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                             </div>
                             <h3 className="font-bold text-2xl text-gray-900 mb-2">Payment Complete!</h3>
                             <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                 Thank you, {user.name}. Your account has been upgraded to Premium status.
                             </p>
                             <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100 w-full">
                                 <code className="text-xs text-gray-400">Transaction ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}</code>
                             </div>
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
//
// 🌐 NODE.JS (EXPRESS) BACKEND SERVER
//
// ===================================================================================

if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    const express = require('express');
    const cors = require('cors');
    const app = express();
    const PORT = 4001;

    app.use(cors());
    app.use(express.json());

    // 1. GET USER STATUS
    app.get('/api/user-status/:id', (req, res) => res.json(mockUserDB));

    // 2. CREATE ORDER
    app.post('/api/paypal/create-order', (req, res) => {
        const { amount, currency } = req.body;
        const orderID = 'ORD-' + Math.random().toString(36).substr(2, 12).toUpperCase();
        
        // Store order in memory
        mockOrders[orderID] = {
            id: orderID,
            amount,
            currency,
            status: 'CREATED',
            createdAt: new Date()
        };

        console.log(`[Backend] Created Order: ${orderID}`);
        // Simulate slight network delay
        setTimeout(() => res.json({ id: orderID }), 500);
    });

    // 3. CAPTURE ORDER
    app.post('/api/paypal/capture-order', (req, res) => {
        const { orderID } = req.body;
        const order = mockOrders[orderID];

        if (!order) {
            return res.status(404).json({ error: "Invalid Order ID" });
        }

        if (order.status === 'COMPLETED') {
            return res.json({ status: 'COMPLETED', message: 'Already captured' });
        }

        // Simulate processing time
        setTimeout(() => {
            order.status = 'COMPLETED';
            mockUserDB.isPremium = true;
            console.log(`[Backend] Captured Order: ${order.id}. User upgraded.`);
            res.json({ status: 'COMPLETED', order });
        }, 1000);
    });
    
    // Helper to reset demo
    app.get('/api/reset', (req, res) => {
        mockUserDB.isPremium = false;
        res.json({ success: true });
    });

    app.listen(PORT, () => {
        console.log(`\n🚀 PayPal Mock Backend running on port ${PORT}`);
    });
}

if (typeof module !== 'undefined') { module.exports = App; }
