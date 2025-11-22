
import React from 'react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-neutral-focus p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-up">
    <div className="text-5xl mb-5 text-primary">{icon}</div>
    <h3 className="text-2xl font-bold text-neutral dark:text-white mb-3">{title}</h3>
    <p className="text-base-content dark:text-gray-400 leading-relaxed">{children}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp }) => {
  return (
    <div className="min-h-screen bg-base-200 dark:bg-neutral text-base-content dark:text-gray-300">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-purple-500 to-secondary dark:from-primary-focus dark:to-secondary">
        {/* Dark overlay for better text contrast in light/dark modes */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
        
        <div className="relative container mx-auto px-6 py-24 md:py-32 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in drop-shadow-lg">Welcome to HabitForge</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 animate-fade-in text-white/90" style={{ animationDelay: '0.2s' }}>
            Build good habits. Break bad ones. Gamify your self-improvement journey.
          </p>
          <div 
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <button
              onClick={onSignUp}
              className="bg-white text-primary font-bold py-4 px-10 rounded-full text-lg shadow-2xl transform hover:scale-110 transition-transform duration-300 w-full sm:w-auto"
            >
              Get Started for Free
            </button>
             <button
              onClick={onSignIn}
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-full text-lg shadow-2xl transform hover:scale-110 hover:bg-white hover:bg-opacity-20 transition-all duration-300 w-full sm:w-auto"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Wave shape at the bottom for a smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1 text-base-200 dark:text-neutral">
            <svg viewBox="0 0 1440 120" className="w-full h-auto fill-current block" preserveAspectRatio="none">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
        </div>
      </div>

      <div className="bg-base-200 dark:bg-neutral text-neutral dark:text-gray-100 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Why HabitForge?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard icon="🎮" title="Gamified Progress">
              Earn points, level up, and unlock achievements. Turn self-improvement into a fun and rewarding game.
            </FeatureCard>
            <FeatureCard icon="📈" title="Track Your Streaks">
              Visualize your consistency with our streak counter. Stay motivated by seeing how many days in a row you've succeeded.
            </FeatureCard>
            <FeatureCard icon="🏆" title="Earn Achievements">
              Celebrate your milestones with unique badges. Get positive reinforcement for your hard work and dedication.
            </FeatureCard>
          </div>
        </div>
      </div>

      <footer className="bg-base-300 dark:bg-neutral-focus py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} HabitForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
