import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`scraply-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--border-subtle)] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--sage-light)] text-[var(--leaf)] flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-main)] mb-1 font-heading">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[var(--leaf)] hover:bg-[var(--forest)] text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
