import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string; delay: string }> = ({ icon, title, description, delay }) => (
  <div 
    className="group bg-white dark:bg-neutral-focus p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 text-primary">
      {icon}
    </div>
    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">{title}</h3>
    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-1">
      {value}
    </div>
    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</div>
  </div>
);

const PricingCard: React.FC<{ 
    title: string; 
    price: string; 
    features: string[]; 
    isPopular?: boolean; 
    buttonText: string;
    onClick: () => void;
    variant: 'outline' | 'solid' 
}> = ({ title, price, features, isPopular, buttonText, onClick, variant }) => (
    <div className={`relative p-6 md:p-8 rounded-3xl flex flex-col h-full transition-all duration-300 ${
        variant === 'solid' 
            ? 'bg-white dark:bg-neutral-focus border-2 border-primary shadow-2xl scale-100 md:scale-105 z-10' 
            : 'bg-white dark:bg-neutral-focus border border-gray-100 dark:border-gray-700 shadow-lg hover:border-gray-200 dark:hover:border-gray-600'
    }`}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-[10px] md:text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg whitespace-nowrap z-20">
                Most Popular
            </div>
        )}
        <h3 className={`text-lg md:text-xl font-bold mb-2 ${variant === 'solid' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
        <div className="mb-4 md:mb-6">
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{price}</span>
            {price !== 'Free' && <span className="text-xs md:text-sm font-medium text-gray-500">/month</span>}
        </div>
        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-xs md:text-sm">
                    <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${variant === 'solid' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-600'}`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
        <button 
            onClick={onClick}
            className={`w-full py-3 rounded-xl font-bold transition-all text-sm md:text-base shadow-md hover:shadow-lg active:scale-95 ${
                variant === 'solid' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
        >
            {buttonText}
        </button>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral text-gray-900 dark:text-gray-100 font-sans selection:bg-primary selection:text-white overflow-x-hidden !scroll-smooth">
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/80 dark:bg-neutral-focus/80 backdrop-blur-lg py-3 md:py-4 shadow-sm border-gray-200/50 dark:border-gray-700/50' 
            : 'bg-transparent py-4 md:py-6 border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg"></div>
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">HabitForge</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 font-medium text-sm">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Methodology</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Premium</a>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <button 
              onClick={onSignIn}
              className="text-gray-600 dark:text-gray-300 hover:text-primary font-semibold text-sm transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onSignUp}
              className="bg-primary hover:bg-primary-focus text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/10 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[100px] opacity-70 animate-pulse dark:bg-primary/20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-secondary/10 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[100px] opacity-70 animate-pulse dark:bg-secondary/20" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            
            {/* Hero Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/5 dark:bg-primary/20 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6 border border-primary/10 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now with AI Coaching
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-4 md:mb-6 animate-slide-in-up">
                Forge Habits That <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Actually Stick.</span>
              </h1>
              
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                Combine the power of gamification, social accountability, and AI analysis to break bad habits and build a better you.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <button 
                  onClick={onSignUp}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-primary hover:bg-primary-focus text-white rounded-full font-bold text-base md:text-lg shadow-xl shadow-primary/30 transition-all hover:-translate-y-1"
                >
                  Start Forging Free
                </button>
                <button 
                  onClick={onSignIn}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-white dark:bg-neutral-focus border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-full font-bold text-base md:text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Log In
                </button>
              </div>

              <div className="mt-8 md:mt-10 flex items-center justify-center lg:justify-start gap-4 md:gap-8 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  No Credit Card
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Free Tier Forever
                </div>
              </div>
            </div>

            {/* Hero Visual / Mockup */}
            <div className="lg:w-1/2 relative animate-pop-in w-full" style={{ animationDelay: '0.3s' }}>
              <div className="relative z-10 bg-white dark:bg-neutral-focus rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 transform rotate-2 hover:rotate-0 transition-all duration-500">
                {/* Fake Dashboard UI */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {[
                    { name: "Morning Run", streak: 12, color: "bg-orange-500" },
                    { name: "Read 30 Mins", streak: 45, color: "bg-blue-500" },
                    { name: "Meditation", streak: 8, color: "bg-purple-500" }
                  ].map((habit, i) => (
                    <div key={i} className="flex items-center p-3 md:p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-700/50">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${habit.color} opacity-20 mr-3 md:mr-4`}></div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-1.5 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      </div>
                      <div className="px-2 py-1 md:px-3 md:py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300">
                        🔥 {habit.streak}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Elements */}
                <div className="absolute -right-4 md:-right-8 -bottom-4 md:-bottom-8 bg-white dark:bg-neutral-focus p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl">🏆</span>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Achievement</p>
                      <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white">Week Warrior</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements behind card */}
              <div className="absolute -top-10 -right-10 w-full h-full bg-gradient-to-br from-primary to-secondary rounded-3xl opacity-20 transform rotate-6 -z-10 hidden md:block"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Social Proof Strip */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-neutral-focus/50 py-8 md:py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatItem value="10k+" label="Active Users" />
            <StatItem value="50k+" label="Habits Forged" />
            <StatItem value="99%" label="Success Rate" />
            <StatItem value="4.9/5" label="App Store Rating" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-white dark:bg-neutral relative scroll-mt-20 md:scroll-mt-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
            <h2 className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase mb-2 md:mb-3">Features</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-6">Everything you need to build a better you.</h3>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
              Stop relying on motivation alone. Use a system designed for consistency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon="🎮" 
              title="Gamified Progress" 
              description="Earn points, level up, and unlock achievements. Turn self-improvement into a fun and rewarding RPG-like game."
              delay="0s"
            />
            <FeatureCard 
              icon="🧬" 
              title="AI-Powered Coaching" 
              description="Our Gemini-powered AI analyzes your logs to find failure patterns and suggests smarter, easier goals to keep you on track."
              delay="0.1s"
            />
            <FeatureCard 
              icon="🔥" 
              title="Streak Protection" 
              description="Life happens. Use 'Freeze Streaks' or build resilience with our smart tracking that forgives an occasional miss."
              delay="0.2s"
            />
            <FeatureCard 
              icon="📸" 
              title="Food Scanner" 
              description="Snap a photo of your meal and let our multimodal AI estimate calories instantly. No manual entry required."
              delay="0.3s"
            />
            <FeatureCard 
              icon="👥" 
              title="Social Accountability" 
              description="Share habits with friends. See their progress in real-time and compete on leaderboards for extra motivation."
              delay="0.4s"
            />
            <FeatureCard 
              icon="📊" 
              title="Deep Analytics" 
              description="Visualize your consistency with heatmaps, weekly charts, and trend analysis to understand your behavior."
              delay="0.5s"
            />
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50 dark:bg-neutral-focus/20 border-y border-gray-100 dark:border-gray-800 scroll-mt-20 md:scroll-mt-32">
        <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                <div className="lg:w-1/2">
                    <h2 className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase mb-2 md:mb-3">Methodology</h2>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-6">Based on the Science of Habit Formation</h3>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed">
                        We utilize the "Habit Loop" framework (Cue, Action, Reward) combined with micro-commitments. By breaking goals down and providing immediate feedback, we trick your brain into enjoying the process.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm mt-0.5">1</div>
                            <div>
                                <strong className="text-gray-900 dark:text-white block text-sm md:text-base">Trigger (Cue)</strong>
                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Customizable notifications and context-aware reminders.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mt-0.5">2</div>
                            <div>
                                <strong className="text-gray-900 dark:text-white block text-sm md:text-base">Action</strong>
                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Frictionless tracking. One tap to log, scan, or complete.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mt-0.5">3</div>
                            <div>
                                <strong className="text-gray-900 dark:text-white block text-sm md:text-base">Reward</strong>
                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Instant XP, level-ups, and satisfying animations.</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="lg:w-1/2 relative w-full">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full filter blur-[80px] animate-pulse"></div>
                    <div className="relative z-10 bg-white dark:bg-neutral-focus border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl mb-2">🔔</div>
                                <div className="text-[10px] md:text-xs font-bold uppercase text-gray-400">Trigger</div>
                            </div>
                            <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mx-2 md:mx-4 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl mb-2">⚡</div>
                                <div className="text-[10px] md:text-xs font-bold uppercase text-gray-400">Action</div>
                            </div>
                            <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mx-2 md:mx-4 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl mb-2">🎁</div>
                                <div className="text-[10px] md:text-xs font-bold uppercase text-gray-400">Reward</div>
                            </div>
                        </div>
                        <div className="bg-base-200 dark:bg-neutral p-3 md:p-4 rounded-xl text-center">
                            <p className="text-xs md:text-sm italic text-gray-600 dark:text-gray-300">"HabitForge turns discipline into a dopamine hit."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-white dark:bg-neutral scroll-mt-20 md:scroll-mt-32">
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h2 className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase mb-2 md:mb-3">Pricing</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-6">Invest in Your Future Self</h3>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
                    Start for free, upgrade for superpower insights.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto items-center">
                <PricingCard 
                    variant="outline"
                    title="Starter"
                    price="Free"
                    buttonText="Start For Free"
                    onClick={onSignUp}
                    features={[
                        "Track up to 3 habits",
                        "Basic analytics & streaks",
                        "Social sharing",
                        "Access to Community"
                    ]}
                />
                <PricingCard 
                    variant="solid"
                    title="Premium"
                    price="$9.99"
                    isPopular={true}
                    buttonText="Get Premium"
                    onClick={onSignUp}
                    features={[
                        "Unlimited habits",
                        "AI-Powered Goal Coaching",
                        "Food Scanner (Multimodal AI)",
                        "Advanced Data Export",
                        "Priority Support"
                    ]}
                />
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 dark:bg-black">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-30"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 md:mb-8 tracking-tight">
            Ready to Forge Your New Life?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Join thousands of others who have taken control of their habits. It takes 21 days to form a habit, but only 1 minute to sign up.
          </p>
          <button 
            onClick={onSignUp}
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 md:py-5 md:px-12 rounded-full text-lg md:text-xl shadow-2xl transition-transform transform hover:scale-105"
          >
            Start Your Journey Now
          </button>
          <p className="mt-6 text-xs md:text-sm text-gray-400">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral border-t border-gray-100 dark:border-gray-800 py-8 md:py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-tr from-primary to-secondary rounded-md"></div>
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">HabitForge</span>
            </div>
            <div className="flex space-x-6 md:space-x-8 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-primary transition">Privacy</a>
              <a href="#" className="hover:text-primary transition">Terms</a>
              <a href="#" className="hover:text-primary transition">Twitter</a>
              <a href="#" className="hover:text-primary transition">GitHub</a>
            </div>
          </div>
          <div className="mt-6 md:mt-8 text-center text-[10px] md:text-xs text-gray-400">
            &copy; {new Date().getFullYear()} HabitForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;