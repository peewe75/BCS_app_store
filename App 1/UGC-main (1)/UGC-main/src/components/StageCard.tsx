import React from 'react';
import { WorkflowStage } from '../types';

interface StageCardProps {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

export const StageCard: React.FC<StageCardProps> = ({ title, isActive, isCompleted, children }) => {
  return (
    <div className={`
      relative rounded-2xl border p-8 transition-all duration-500 ease-out
      ${isActive 
        ? 'border-primary/50 bg-white shadow-xl shadow-primary/10 scale-[1.01] z-10' 
        : 'border-slate-100 bg-white/80 shadow-sm hover:shadow-md'
      }
      ${isCompleted ? 'border-green-500/30 bg-green-50/30' : ''}
      ${!isActive && !isCompleted ? 'opacity-70 grayscale-[0.5]' : ''}
    `}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
           {isActive && <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>}
           {isCompleted && (
             <div className="bg-green-100 text-green-600 rounded-full p-1">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
             </div>
           )}
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};