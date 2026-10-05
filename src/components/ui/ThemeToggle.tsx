import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../../types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Current: ${theme === 'light' ? 'Light mode' : 'Dark mode'}. Click to toggle.`}
      className={`relative p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-main)] hover:bg-[var(--sage-light)] hover:border-[var(--leaf)] transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center group ${className}`}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`w-4 h-4 text-[var(--gold)] transition-all duration-300 absolute inset-0 transform ${
            theme === 'light'
              ? 'rotate-0 opacity-100 scale-100'
              : '-rotate-90 opacity-0 scale-50 pointer-events-none'
          }`}
        />
        <Moon
          className={`w-4 h-4 text-[var(--light-gold)] transition-all duration-300 absolute inset-0 transform ${
            theme === 'dark'
              ? 'rotate-0 opacity-100 scale-100'
              : 'rotate-90 opacity-0 scale-50 pointer-events-none'
          }`}
        />
      </div>
    </button>
  );
};
