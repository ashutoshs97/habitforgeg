
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { HabitProvider } from './context/HabitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import { ThemeProvider } from './context/ThemeContext';
import ConfettiEffect from './components/ConfettiEffect';

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [page, setPage] = useState<'landing' | 'signin' | 'signup'>('landing');

    if (currentUser) {
        return (
            <HabitProvider user={currentUser}>
                <ConfettiEffect />
                <Dashboard />
            </HabitProvider>
        );
    }

    switch(page) {
        case 'signin':
            return <SignInPage onSwitchToSignUp={() => setPage('signup')} onGoBack={() => setPage('landing')} />;
        case 'signup':
            return <SignUpPage onSwitchToSignIn={() => setPage('signin')} onGoBack={() => setPage('landing')} />;
        case 'landing':
        default:
            return <LandingPage onSignIn={() => setPage('signin')} onSignUp={() => setPage('signup')} />;
    }
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;