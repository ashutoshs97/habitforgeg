
import React, { useState, useRef, useEffect } from 'react';
import type { Comment } from '../types';
import { useHabits } from '../context/HabitContext';

interface CommentBoxProps {
  sharedHabitId: string;
  comments: Comment[];
}

const CommentBox: React.FC<CommentBoxProps> = ({ sharedHabitId, comments }) => {
  const [text, setText] = useState('');
  const { dispatch, userEmail } = useHabits();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch({ type: 'ADD_COMMENT', payload: { sharedHabitId, text: text.trim() } });
      setText('');
    }
  };

  return (
    <div className="h-full flex flex-col" style={{minHeight: '300px'}}>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        {comments.length > 0 ? (
            comments.map(comment => (
                <div key={comment.id} className={`flex flex-col ${comment.authorEmail === userEmail ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${comment.authorEmail === userEmail ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-neutral dark:text-gray-200'}`}>
                        <p className="text-xs font-bold mb-1">{comment.authorName}</p>
                        <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            ))
        ) : (
            <div className="text-center text-sm text-gray-400 py-8">
                No comments yet. Start the conversation!
            </div>
        )}
        <div ref={commentsEndRef} />
      </div>
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message..."
            className="w-full px-4 py-2 bg-white dark:bg-neutral border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-focus active:scale-95"
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

export default CommentBox;
