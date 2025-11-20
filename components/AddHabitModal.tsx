import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { HabitType } from '../types';
import { EMOJI_OPTIONS, COLOR_OPTIONS } from '../constants';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>(HabitType.GOOD);
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const { dispatch } = useHabits();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch({ type: 'ADD_HABIT', payload: { name: name.trim(), type, emoji, color } });
      setName('');
      setEmoji(EMOJI_OPTIONS[0]);
      setColor(COLOR_OPTIONS[0]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-focus rounded-2xl shadow-xl p-8 w-full max-w-md animate-pop-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-neutral dark:text-gray-100">Forge a New Habit</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              id="habit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="e.g., Read for 15 minutes"
              required
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEmoji(opt)}
                  className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all duration-200 transform
                    ${emoji === opt ? 'bg-primary text-white scale-110 ring-2 ring-primary-focus' : 'bg-base-200 dark:bg-neutral hover:bg-base-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setColor(opt)}
                  className={`w-10 h-10 rounded-full transition-all duration-200 border-2 transform
                    ${color === opt ? 'ring-2 ring-primary-focus ring-offset-2 scale-110' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: opt }}
                  aria-label={`Select color ${opt}`}
                />
              ))}
            </div>
          </div>

          {/* Habit type could be added here if needed in future */}
          {/* <input type="hidden" value={type} /> */}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-base-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-focus shadow-lg shadow-primary/30 transition"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;