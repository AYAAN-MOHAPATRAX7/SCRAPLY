import React from 'react';
import { RiskLevel, UrgencyLevel, RecoveryPath, ListingStatus } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Sparkles, ChefHat, HeartHandshake, Tag, Recycle, Trees } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-900 dark:text-orange-300 border-orange-500/40 font-semibold',
    CRITICAL: 'bg-rose-500/20 text-rose-900 dark:text-rose-200 border-rose-500/40 font-bold animate-pulse',
  };

  const icons = {
    LOW: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
    MEDIUM: <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
    HIGH: <ShieldAlert className="w-3 h-3 text-orange-600 dark:text-orange-400" />,
    CRITICAL: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles[level]} ${sizeClass} tracking-wide uppercase font-medium`}
    >
      {icons[level]}
      <span>{level} RISK</span>
    </span>
  );
};

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  size?: 'sm' | 'md';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ level, size = 'md' }) => {
  const styles = {
    LOW: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    MEDIUM: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    HIGH: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800',
    CRITICAL: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 font-bold',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles[level]} ${sizeClass} font-medium`}
    >
      <Clock className="w-3 h-3" />
      <span>{level} URGENCY</span>
    </span>
  );
};

interface FreshnessBadgeProps {
  score: number;
  showBar?: boolean;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ score, showBar = false }) => {
  let color = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
  let barColor = 'bg-emerald-500';

  if (score < 45) {
    color = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    barColor = 'bg-rose-500';
  } else if (score < 70) {
    color = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}
      >
        <Sparkles className="w-3 h-3" />
        <span>{score}% Freshness</span>
      </span>
      {showBar && (
        <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface RecoveryPathBadgeProps {
  path: RecoveryPath;
}

export const RecoveryPathBadge: React.FC<RecoveryPathBadgeProps> = ({ path }) => {
  const config = {
    DONATE: {
      label: 'Direct Donation',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    },
    PROCESS: {
      label: 'Thermal / Culinary Processing',
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
    },
    DISCOUNT_RETAIL: {
      label: 'Surplus Discount Sale',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
    },
    ANIMAL_FEED: {
      label: 'Animal Feed Diversion',
      color: 'bg-lime-50 dark:bg-lime-950/40 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800',
      icon: <Trees className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />,
    },
    COMPOST: {
      label: 'Bio-Composting / Soil Regrowth',
      color: 'bg-stone-100 dark:bg-stone-900/60 text-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
      icon: <Recycle className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />,
    },
  };

  const item = config[path] || config.DONATE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${item.color}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};

interface ListingStatusBadgeProps {
  status: ListingStatus;
}

export const ListingStatusBadge: React.FC<ListingStatusBadgeProps> = ({ status }) => {
  const styles: Record<ListingStatus, string> = {
    AVAILABLE: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    CLAIMED: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    IN_TRANSIT: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    RECEIVED: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    RECOVERED: 'bg-[var(--leaf-soft)] text-[var(--leaf)] border-[var(--leaf)]/30 font-bold',
    PROCESSED: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    UNAVAILABLE: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
  };

  const labels: Record<ListingStatus, string> = {
    AVAILABLE: 'Available',
    CLAIMED: 'Claimed by NGO',
    IN_TRANSIT: 'In Transit',
    RECEIVED: 'Received',
    RECOVERED: 'Recovered',
    PROCESSED: 'Culinary Processed',
    UNAVAILABLE: 'Unavailable',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      <span>{labels[status]}</span>
    </span>
  );
};
