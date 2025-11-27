
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useHabits } from '../context/HabitContext';
import type { ChatMessage } from '../types';

interface ChatbotProps {
  onClose: () => void;
  panicContext?: string; // Optional context for "Panic Mode"
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, panicContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useHabits();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat based on context (Panic vs Normal)
  useEffect(() => {
      if (panicContext) {
          setMessages([
              { sender: 'bot', text: `🚨 Emergency Support Activated.\n\nI see you're feeling an urge to ${panicContext}. Take a deep breath. 🌬️\n\nI'm here. Tell me what's triggering this feeling right now?` }
          ]);
      } else {
          setMessages([
              { sender: 'bot', text: "Hi! I'm Forgey, your personal habit coach. How can I help you today?" }
          ]);
      }
  }, [panicContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const habitContext = state.habits.map(h => `- ${h.name} (Current Streak: ${h.streak} days)`).join('\n');
      const userContext = `Level: ${state.user.level}, Willpower Points: ${state.user.willpowerPoints}`;

      let systemInstruction = `You are Forgey, a friendly and motivational AI coach for the HabitForge app. Your goal is to encourage users, provide tips for building habits, and celebrate their progress.`;
      
      if (panicContext) {
          systemInstruction += `\n\nCRITICAL: The user is currently in "Panic Mode" fighting an urge to ${panicContext}. Use "Urge Surfing" techniques. Be empathetic but firm. Help them delay the action, distract themselves, or understand the trigger. Keep responses short and calming.`;
      } else {
          systemInstruction += `\n\nKeep your responses concise, positive, and supportive. Use emojis to make the conversation engaging. Analyze the user's progress and habits to give personalized advice.\n\nHere is the user's current progress and habits:\n${userContext}\n${habitContext}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
        config: { systemInstruction }
      });

      const botMessage: ChatMessage = { sender: 'bot', text: response.text };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, I'm having a little trouble connecting right now. Just breathe. You got this." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-24 right-6 w-[90vw] max-w-sm h-[60vh] max-h-[500px] z-50 flex flex-col animate-slide-in-up ${panicContext ? 'border-2 border-red-400 shadow-red-200 shadow-2xl' : ''}`}>
      <div className={`rounded-t-2xl p-4 flex justify-between items-center shadow-lg border-b ${panicContext ? 'bg-red-50 border-red-200' : 'bg-white dark:bg-neutral-focus border-gray-200 dark:border-gray-700'}`}>
        <h3 className={`text-lg font-bold ${panicContext ? 'text-red-700' : 'text-neutral dark:text-white'}`}>
            {panicContext ? '🛡️ Urge Support' : 'Chat with Forgey 🤖'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 bg-gray-50 dark:bg-neutral p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-neutral dark:text-gray-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white dark:bg-neutral-focus p-4 rounded-b-2xl shadow-lg">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={panicContext ? "I feel like..." : "Ask for advice..."}
            className="w-full px-4 py-2 bg-white dark:bg-neutral border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            autoFocus={!!panicContext}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center transition-opacity disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
