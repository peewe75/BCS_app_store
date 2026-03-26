import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block cursor-pointer"
      onClick={() => setIsVisible(!isVisible)}
      title="Clicca per info"
    >
      {children}

      {isVisible && (
        <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded bg-slate-800 px-3 py-2 text-center text-xs text-white shadow-xl z-50 animate-fade-in-up">
          {text}
          <div className="absolute left-1/2 top-100 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>

          <button
            type="button"
            className="block w-full mt-2 text-[10px] text-slate-400 uppercase tracking-wider hover:text-white border-t border-slate-700 pt-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
          >
            Chiudi
          </button>
        </div>
      )}
    </div>
  );
};