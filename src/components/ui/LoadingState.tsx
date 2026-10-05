import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  isAI?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing request...',
  subMessage = 'Gathering food condition metrics and predicting recovery pathway...',
  isAI = true,
  className = '',
}) => {
  return (
    <div
      className={`scraply-card p-10 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[var(--leaf-soft)] text-[var(--leaf)] flex items-center justify-center border border-[var(--leaf)]/20 animate-pulse">
          {isAI ? (
            <BrainCircuit className="w-8 h-8 text-[var(--leaf)] animate-spin-slow" />
          ) : (
            <Sparkles className="w-8 h-8 text-[var(--gold)]" />
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--gold)] animate-ping" />
      </div>

      <h3 className="text-base font-bold text-[var(--text-main)] mb-1 font-heading">
        {message}
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm">
        {subMessage}
      </p>

      {/* Shimmer skeleton bar */}
      <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[var(--leaf)] via-[var(--gold)] to-[var(--leaf)] w-full animate-pulse" />
      </div>
    </div>
  );
};
