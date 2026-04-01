'use client';

import { Loader2 } from 'lucide-react';

interface ParseProgressProps {
  progress: number;
  message: string;
}

export function ParseProgress({ progress, message }: ParseProgressProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-6">
      <Loader2 className="mx-auto h-12 w-12 text-amber-500 animate-spin" />
      <div>
        <p className="text-lg font-semibold text-gray-900">{message}</p>
        <p className="text-sm text-gray-500 mt-1">
          Elaborazione in corso...
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-amber-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm font-mono text-gray-600">{progress}%</p>
    </div>
  );
}
