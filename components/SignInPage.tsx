
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SignInPageProps {
  onSwitchToSignUp: () => void;
  onGoBack: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onSwitchToSignUp, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-500 to-teal-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Decorative Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
       </div>

       <div className="w-full max-w-[440px] relative z-10 flex flex-col">
        <div className="text-center mb-8">
            <button 
                onClick={onGoBack} 
                className="text-white/80 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 mx-auto group py-2 px-4 rounded-full hover:bg-white/10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
            </button>
        </div>

        <div className="bg-white dark:bg-neutral-focus rounded-3xl shadow-2xl p-8 md:p-10 animate-pop-in backdrop-blur-sm border border-white/20 dark:border-gray-700">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Welcome Back!</h1>
                <p className="text-gray-500 dark:text-gray-400 text-base">Sign in to continue your journey.</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 animate-slide-in-up">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <button type="button" className="text-xs font-bold text-primary hover:text-primary-focus transition-colors">
                            Forgot Password?
                        </button>
                    </div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center text-lg"
                >
                    {isLoading ? (
                        <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignUp} className="text-primary font-bold hover:underline transition-all">
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
        
        <div className="mt-8 text-center text-white/60 text-xs">
            &copy; {new Date().getFullYear()} HabitForge. All rights reserved.
        </div>
       </div>
    </div>
  );
};

export default SignInPage;
