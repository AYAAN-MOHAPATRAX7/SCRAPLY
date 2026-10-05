import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  Clock,
  ShieldAlert,
  Building,
  Store,
  ChevronRight,
} from 'lucide-react';
import { FoodListing, NGONeed } from '../../types';
import { FreshnessBadge, RiskBadge, UrgencyBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';

interface SmartMatchingViewProps {
  listings: FoodListing[];
  ngoNeeds: NGONeed[];
  onClaimFood: (listingId: string, ngoName: string) => void;
  onViewJourney: (listing: FoodListing) => void;
}

export const SmartMatchingView: React.FC<SmartMatchingViewProps> = ({
  listings,
  ngoNeeds,
  onClaimFood,
  onViewJourney,
}) => {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0);

  // Available listings
  const availableListings = listings.filter((l) => l.status === 'AVAILABLE');

  // Compute smart matches
  const matches: Array<{
    listing: FoodListing;
    need: NGONeed;
    score: number;
    reasons: string[];
    urgencyLevel: string;
  }> = [];

  availableListings.forEach((listing) => {
    ngoNeeds.forEach((need) => {
      let score = 50;
      const reasons: string[] = [];

      // Category match
      if (listing.category === need.category) {
        score += 25;
        reasons.push(`Food category aligns directly with requested ${need.category}`);
      } else {
        return; // Only match relevant categories
      }

      // Food name semantic overlap
      const listingWords = listing.foodName.toLowerCase().split(' ');
      const needWords = need.foodNeeded.toLowerCase().split(' ');
      const hasWordOverlap = listingWords.some((w) => needWords.some((nw) => nw.includes(w) || w.includes(nw)));
      if (hasWordOverlap) {
        score += 15;
        reasons.push(`Item variety directly matches '${need.foodNeeded}'`);
      }

      // Quantity fulfillment
      const ratio = listing.quantity / need.quantity;
      if (ratio >= 0.5 && ratio <= 1.5) {
        score += 10;
        reasons.push(`Available volume (${listing.quantity} ${listing.unit}) matches ${Math.round(ratio * 100)}% of demand`);
      }

      // Urgency boost
      if (listing.urgency === 'HIGH' || listing.risk === 'HIGH') {
        score += 8;
        reasons.push(`High urgency decay window requires immediate culinary diversion`);
      }

      // Freshness factor
      if (listing.estimatedFreshness >= 60) {
        score += 5;
        reasons.push(`Estimated freshness (${listing.estimatedFreshness}%) meets quality criteria`);
      }

      const finalScore = Math.min(99, Math.max(68, score));

      matches.push({
        listing,
        need,
        score: finalScore,
        reasons,
        urgencyLevel: listing.urgency,
      });
    });
  });

  // Sort by highest score
  matches.sort((a, b) => b.score - a.score);

  const activeMatch = matches[selectedMatchIndex] || matches[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            Multimodal Supply & Demand Optimization
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            AI Smart Matching Engine
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Real-time algorithmic pairing between at-risk supplier inventory and verified NGO community demand. No maps needed — purely transparent, rationale-driven scoring.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border-subtle)] px-4 py-2 rounded-2xl shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--gold)]" />
          <span className="text-xs font-bold text-[var(--text-main)]">
            {matches.length} Algorithmic Matches Active
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No smart matches found currently"
          description="Either all surplus items are claimed or supplier listings do not overlap with active NGO needs. Add listings or post needs to generate matches."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Match List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 font-heading">
              Ranked Match Queue ({matches.length})
            </h2>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {matches.map((m, idx) => {
                const isSelected = selectedMatchIndex === idx;
                return (
                  <div
                    key={`${m.listing.id}-${m.need.id}`}
                    onClick={() => setSelectedMatchIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-[var(--surface)] border-[var(--leaf)] shadow-md ring-1 ring-[var(--leaf)]/20'
                        : 'bg-[var(--surface-hover)] border-[var(--border-subtle)] hover:border-[var(--leaf)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-xl bg-[var(--forest)] text-[var(--light-gold)] font-black text-xs flex items-center justify-center font-heading">
                          {m.score}%
                        </span>
                        <div>
                          <h3 className="font-bold text-xs text-[var(--text-main)] font-heading">
                            {m.listing.foodName}
                          </h3>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {m.listing.quantity} {m.listing.unit} • {m.listing.sourceName}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                          isSelected ? 'translate-x-1 text-[var(--leaf)]' : ''
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                      <span className="font-medium text-[var(--leaf)]">
                        Matches: {m.need.ngoName}
                      </span>
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        {m.urgencyLevel} Urgency
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Match Analysis Card */}
          <div className="lg:col-span-7">
            {activeMatch && (
              <div className="scraply-card p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                {/* Score & Pairing Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-xs font-bold text-[var(--leaf)] uppercase tracking-wider block mb-1">
                      Compatibility Assessment
                    </span>
                    <h2 className="text-2xl font-black text-[var(--text-main)] font-heading">
                      {activeMatch.score}% Algorithmic Match
                    </h2>
                    <span className="text-xs text-[var(--text-muted)]">
                      Optimized for maximum nutritional equity and minimum spoilage risk
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-[var(--forest)] text-[var(--light-gold)] text-center self-start sm:self-auto shadow-md">
                    <span className="text-[10px] uppercase font-bold block">Match Confidence</span>
                    <span className="text-xl font-black font-heading">{activeMatch.score} / 100</span>
                  </div>
                </div>

                {/* Supply vs Demand Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Supplier Box */}
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--forest)] dark:text-[var(--text-main)]">
                      <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
                      <span>Surplus Provider</span>
                    </div>
                    <div className="font-extrabold text-sm text-[var(--text-main)]">
                      {activeMatch.listing.foodName}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {activeMatch.listing.quantity} {activeMatch.listing.unit} • {activeMatch.listing.sourceName}
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <FreshnessBadge score={activeMatch.listing.estimatedFreshness} />
                      <RiskBadge level={activeMatch.listing.risk} size="sm" />
                    </div>
                  </div>

                  {/* Recipient NGO Box */}
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                      <Building className="w-3.5 h-3.5" />
                      <span>Recipient Demand</span>
                    </div>
                    <div className="font-extrabold text-sm text-[var(--text-main)]">
                      {activeMatch.need.foodNeeded}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Requires {activeMatch.need.quantity} {activeMatch.need.unit} • {activeMatch.need.ngoName}
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Priority:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {activeMatch.need.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Algorithmic Reasons Breakdown */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 font-heading">
                    Algorithmic Rationale & Scoring Breakdown
                  </h3>
                  <div className="space-y-2">
                    {activeMatch.reasons.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3 rounded-xl bg-[var(--leaf-soft)]/50 border border-[var(--leaf)]/20 flex items-start gap-2.5 text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
                        <span className="text-[var(--text-main)] font-medium leading-relaxed">
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button: Connect & Claim */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onClaimFood(activeMatch.listing.id, activeMatch.need.ngoName)}
                    className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4 text-[var(--light-gold)]" />
                    <span>Connect & Claim for {activeMatch.need.ngoName}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewJourney(activeMatch.listing)}
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>View Traceability</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
