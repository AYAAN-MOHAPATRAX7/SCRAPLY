import React, { useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  AlertTriangle,
  HeartHandshake,
  TrendingDown,
  BarChart3,
  MapPin,
  Tractor,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'action-at-risk',
      title: 'View At-Risk Food Inventory',
      subtitle:
        'Identify surplus items that need immediate recovery before value is lost',
      icon: (
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      ),
      category: 'TRIAGE',
    },

    {
      id: 'action-add-listing',
      title: 'Add Surplus Food',
      subtitle:
        'Quickly add a new surplus food item to the SCRAPLY recovery network',
      icon: (
        <PlusCircle className="h-4 w-4 text-[var(--leaf)]" />
      ),
      category: 'ACTION',
    },

    {
      id: 'action-create-need',
      title: 'Create NGO Food Request',
      subtitle:
        'Broadcast a food requirement to the recovery network',
      icon: (
        <HeartHandshake className="h-4 w-4 text-sky-600" />
      ),
      category: 'NGO',
    },

    {
      id: 'action-recovery-opportunities',
      title: 'Review Recovery Opportunities',
      subtitle:
        'See surplus items that have strong potential for recovery or redistribution',
      icon: (
        <Sparkles className="h-4 w-4 text-[var(--gold)]" />
      ),
      category: 'RECOVERY',
    },

    {
      id: 'action-decay-insights',
      title: 'View AI Decay Insights',
      subtitle:
        'Review freshness decline and understand what happens if food is left untreated',
      icon: (
        <TrendingDown className="h-4 w-4 text-[var(--leaf)]" />
      ),
      category: 'AI INSIGHT',
    },

    {
      id: 'action-harvestguard',
      title: 'Open HarvestGuard AI',
      subtitle:
        'Ask Gemma to recommend the best recovery pathway for a farmer surplus',
      icon: (
        <Tractor className="h-4 w-4 text-[var(--leaf)]" />
      ),
      category: 'FARMER AI',
    },

    {
      id: 'action-smart-map',
      title: 'Open Smart Map & Matching',
      subtitle:
        'Find suitable NGOs and buyers using the teammate location-matching module',
      icon: (
        <MapPin className="h-4 w-4 text-sky-600" />
      ),
      category: 'MATCHING',
    },

    {
      id: 'action-analytics',
      title: 'View Impact Analytics',
      subtitle:
        'Track recovery, waste reduction, food rescued, and overall SCRAPLY impact',
      icon: (
        <BarChart3 className="h-4 w-4 text-[var(--gold)]" />
      ),
      category: 'IMPACT',
    },
  ];

  const handleAction = (actionId: string) => {
    onSelectAction(actionId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SCRAPLY Actions"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20"
    >
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close actions"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/50 backdrop-blur-sm"
      />

      {/* Actions Panel */}

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-main)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">

          <div>

            <div className="flex items-center gap-2">

              <Sparkles className="h-5 w-5 text-[var(--gold)]" />

              <h2 className="text-base font-bold">
                Actions
              </h2>

            </div>

            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Quick recovery actions and AI insights
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close actions"
            className="cursor-pointer rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--sage-light)] hover:text-[var(--text-main)]"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* Actions */}

        <div className="max-h-[460px] overflow-y-auto p-2.5">

          {actions.map((item) => (

            <button
              key={item.id}
              type="button"
              onClick={() => handleAction(item.id)}
              className="group flex w-full cursor-pointer items-center justify-between rounded-xl p-3 text-left transition-all duration-150 hover:bg-[var(--sage-light)]/40"
            >

              <div className="flex items-center gap-3.5">

                {/* Icon */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] transition-all duration-150 group-hover:border-[var(--leaf)] group-hover:shadow-sm">

                  {item.icon}

                </div>

                {/* Text */}

                <div className="min-w-0">

                  <div className="text-sm font-semibold text-[var(--text-main)]">
                    {item.title}
                  </div>

                  <div className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">
                    {item.subtitle}
                  </div>

                </div>

              </div>

              {/* Category */}

              <span className="ml-4 shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-hover)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {item.category}
              </span>

            </button>

          ))}

        </div>

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--sage-light)]/20 px-4 py-3 text-[11px] text-[var(--text-muted)]">

          <span>
            Select an action to continue
          </span>

          <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] shadow-xs">
            ESC
          </kbd>

        </div>

      </div>

    </div>
  );
};