import React, { useState } from 'react';
import { Task } from '../types';
import { X, Smile, Meh, Frown, Sparkles, MessageSquareHeart } from 'lucide-react';
import { motion } from 'motion/react';

interface ReflectionModalProps {
  task: Task;
  username: string;
  onClose: () => void;
  onSubmit: (mood: string, reflection: string, points: number) => void;
}

const MOODS = [
  { emoji: '😊', label: 'Great', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { emoji: '😐', label: 'Okay', color: 'text-amber-500', bg: 'bg-amber-50' },
  { emoji: '😫', label: 'Tired', color: 'text-rose-500', bg: 'bg-rose-50' },
  { emoji: '🤯', label: 'Hard', color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function ReflectionModal({ task, username, onClose, onSubmit }: ReflectionModalProps) {
  const [selectedMood, setSelectedMood] = useState('😊');
  const [reflection, setReflection] = useState('');

  const calculatePoints = () => {
    let base = 10;
    if (task.difficulty === 'medium') base = 20;
    if (task.difficulty === 'hard') base = 30;
    return base;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedMood, reflection, calculatePoints());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10 text-emerald-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Great job, {username}!</h2>
            <p className="text-slate-500 mt-2 font-medium">
              You just finished <span className="text-blue-600 font-bold">"{task.title}"</span>.
              How does it feel to be done?
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {MOODS.map((mood) => (
              <button
                key={mood.emoji}
                onClick={() => setSelectedMood(mood.emoji)}
                className={`flex-1 p-3 rounded-2xl transition-all border-2 ${
                  selectedMood === mood.emoji 
                    ? `border-blue-500 ${mood.bg} scale-110 shadow-lg` 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl block mb-1">{mood.emoji}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  selectedMood === mood.emoji ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2 text-left">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              <MessageSquareHeart className="w-3 h-3" />
              Quick Reflection
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-medium text-slate-700 resize-none h-24"
              placeholder="What did you learn? (Optional)"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
            >
              Claim +{calculatePoints()} XP
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
