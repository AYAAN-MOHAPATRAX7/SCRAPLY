import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Store,
  Users,
  Truck,
  ArrowRight,
  PackageCheck,
  Search,
} from 'lucide-react';

import {
  FoodListing,
  JourneyStep,
} from '../../types';

import {
  RiskBadge,
  ListingStatusBadge,
} from '../ui/StatusBadge';

import { EmptyState } from '../ui/EmptyState';

interface FoodJourneyViewProps {
  listings: FoodListing[];
  selectedListingId?: string;
  onAdvanceJourney: (
    listingId: string,
    nextStatus: JourneyStep['status'],
    notes?: string
  ) => void;
}

const STAGES = [
  'LISTED',
  'ANALYZED',
  'MATCHED',
  'CLAIMED',
  'IN_TRANSIT',
  'RECEIVED',
  'RECOVERED',
] as const;

type JourneyStage = (typeof STAGES)[number];

interface JourneyContext {
  eyebrow: string;
  title: string;
  description: string;
  stages: Record<string, string>;
  sourceLabel: string;
  sourceDescription: string;
}

const getJourneyContext = (
  sourceType?: string
): JourneyContext => {
  if (sourceType === 'farmer') {
    return {
      eyebrow: 'POST-HARVEST TRACEABILITY',

      title: 'Harvest Recovery Journey',

      description:
        'Track harvested produce from surplus detection and AI condition assessment through matching, collection, and recovery.',

      sourceLabel: 'Harvest source',

      sourceDescription:
        'This journey begins with harvested produce that has entered a recovery workflow.',

      stages: {
        LISTED: 'SURPLUS LISTED',
        ANALYZED: 'CONDITION CHECKED',
        MATCHED: 'RECOVERY MATCHED',
        CLAIMED: 'CLAIMED',
        IN_TRANSIT: 'COLLECTED',
        RECEIVED: 'RECEIVED',
        RECOVERED: 'HARVEST RECOVERED',
      },
    };
  }

  return {
    eyebrow: 'INVENTORY TRACEABILITY',

    title: 'Inventory Recovery Journey',

    description:
      'Track unsold or at-risk retail inventory from recovery listing and AI freshness assessment through partner matching, pickup, and recovery.',

    sourceLabel: 'Retail inventory source',

    sourceDescription:
      'This journey begins when retail inventory becomes at-risk or is intentionally moved into a recovery workflow.',

    stages: {
      LISTED: 'RECOVERY LISTED',
      ANALYZED: 'FRESHNESS CHECKED',
      MATCHED: 'PARTNER MATCHED',
      CLAIMED: 'CLAIMED',
      IN_TRANSIT: 'PICKUP IN TRANSIT',
      RECEIVED: 'RECEIVED',
      RECOVERED: 'INVENTORY RECOVERED',
    },
  };
};

export const FoodJourneyView: React.FC<
  FoodJourneyViewProps
> = ({
  listings,
  selectedListingId,
  onAdvanceJourney,
}) => {
  const [activeId, setActiveId] =
    useState<string>(
      selectedListingId ||
        listings[0]?.id ||
        ''
    );

  const [searchQuery, setSearchQuery] =
    useState('');

  const activeListing =
    listings.find(
      (listing) =>
        listing.id === activeId
    ) || listings[0];

  const journeyContext =
    getJourneyContext(
      activeListing?.sourceType
    );

  const filteredListings =
    listings.filter((listing) => {
      const query =
        searchQuery.toLowerCase();

      return (
        listing.foodName
          .toLowerCase()
          .includes(query) ||
        listing.sourceName
          .toLowerCase()
          .includes(query)
      );
    });

  /* ---------------------------------------------
     STAGE ICONS
  --------------------------------------------- */

  const getStageIcon = (
    status: string
  ) => {
    switch (status) {
      case 'LISTED':
        return (
          <Store className="w-4 h-4 text-[var(--forest)]" />
        );

      case 'ANALYZED':
        return (
          <Sparkles className="w-4 h-4 text-[var(--gold)]" />
        );

      case 'MATCHED':
        return (
          <CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />
        );

      case 'CLAIMED':
        return (
          <Users className="w-4 h-4 text-sky-500" />
        );

      case 'IN_TRANSIT':
        return (
          <Truck className="w-4 h-4 text-purple-500" />
        );

      case 'RECEIVED':
        return (
          <PackageCheck className="w-4 h-4 text-teal-500" />
        );

      case 'RECOVERED':
        return (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        );

      default:
        return (
          <Clock className="w-4 h-4 text-neutral-400" />
        );
    }
  };

  /* ---------------------------------------------
     NEXT STAGE
  --------------------------------------------- */

  const getNextStage = (
    currentStatus: string
  ): JourneyStage | null => {
    const currentIndex =
      STAGES.indexOf(
        currentStatus as JourneyStage
      );

    if (
      currentIndex >= 0 &&
      currentIndex <
        STAGES.length - 1
    ) {
      return STAGES[
        currentIndex + 1
      ];
    }

    return null;
  };

  const nextStage =
    activeListing
      ? getNextStage(
          activeListing.status
        )
      : null;

  /* ---------------------------------------------
     EMPTY STATE
  --------------------------------------------- */

  if (listings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">

        <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />
          Recovery Traceability
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
          Food Recovery Journeys
        </h1>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 mb-8">
          Follow the complete lifecycle of every surplus
          listing from its origin to recovery.
        </p>

        <EmptyState
          icon={Clock}
          title="No recovery journeys recorded yet"
          description="Create a surplus listing or analyze a food item to initiate a full traceability journey."
        />

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">

      {/* -----------------------------------------
          HEADER
      ----------------------------------------- */}

      <section>

        <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />

          {journeyContext.eyebrow}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
          {journeyContext.title}
        </h1>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-3xl">
          {journeyContext.description}
        </p>

      </section>

      {/* -----------------------------------------
          MAIN GRID
      ----------------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ---------------------------------------
            LEFT — JOURNEY SELECTOR
        --------------------------------------- */}

        <div className="lg:col-span-4 space-y-3">

          <div className="flex items-center justify-between px-1">

            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-heading">
              All Recovery Journeys (
              {listings.length}
              )
            </h2>

          </div>

          {/* SEARCH */}

          <div className="relative">

            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Filter by food or source..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-[var(--surface)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--leaf)]"
            />

          </div>

          {/* JOURNEY LIST */}

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">

            {filteredListings.length === 0 ? (

              <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-center">

                <Search className="w-5 h-5 text-[var(--text-muted)] mx-auto mb-2" />

                <p className="text-xs text-[var(--text-muted)]">
                  No journeys match your search.
                </p>

              </div>

            ) : (

              filteredListings.map(
                (item) => {

                  const isSelected =
                    activeListing?.id ===
                    item.id;

                  const context =
                    getJourneyContext(
                      item.sourceType
                    );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveId(
                          item.id
                        )
                      }
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[var(--surface)] border-[var(--leaf)] shadow-md ring-1 ring-[var(--leaf)]/20'
                          : 'bg-[var(--surface-hover)] border-[var(--border-subtle)] hover:border-[var(--leaf)]/50'
                      }`}
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        {item.imageUrl ? (

                          <img
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.foodName
                            }
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black/10"
                          />

                        ) : (

                          <div className="w-10 h-10 rounded-xl bg-[var(--sage-light)] flex items-center justify-center font-bold text-xs text-[var(--leaf)] shrink-0">
                            {item.foodName.charAt(
                              0
                            )}
                          </div>

                        )}

                        <div className="min-w-0">

                          <div className="font-bold text-xs text-[var(--text-main)] truncate font-heading">
                            {item.foodName}
                          </div>

                          <div className="text-[10px] text-[var(--text-muted)] truncate">
                            {item.quantity}{' '}
                            {item.unit} •{' '}
                            {item.sourceName}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">

                            <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--leaf)]">
                              {item.sourceType ===
                              'farmer'
                                ? 'Harvest'
                                : 'Inventory'}
                            </span>

                            <span className="text-[10px] text-[var(--text-muted)]">
                              •
                            </span>

                            <span className="text-[10px] text-[var(--text-muted)]">
                              {
                                item
                                  .journey
                                  .length
                              }{' '}
                              milestones
                            </span>

                          </div>

                        </div>

                      </div>

                      <ListingStatusBadge
                        status={
                          item.status
                        }
                      />

                    </button>
                  );
                }
              )

            )}

          </div>

        </div>

        {/* ---------------------------------------
            RIGHT — ACTIVE JOURNEY
        --------------------------------------- */}

        <div className="lg:col-span-8">

          {activeListing && (

            <div className="scraply-card p-6 sm:p-8 space-y-7 animate-in fade-in duration-200">

              {/* ITEM OVERVIEW */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">

                <div className="flex items-center gap-4 min-w-0">

                  {activeListing.imageUrl && (
                    <img
                      src={
                        activeListing.imageUrl
                      }
                      alt={
                        activeListing.foodName
                      }
                      className="w-16 h-16 rounded-2xl object-cover border border-black/10 shadow-sm shrink-0"
                    />
                  )}

                  <div className="min-w-0">

                    <div className="flex items-center gap-2 mb-1 flex-wrap">

                      <ListingStatusBadge
                        status={
                          activeListing.status
                        }
                      />

                      <RiskBadge
                        level={
                          activeListing.risk
                        }
                        size="sm"
                      />

                      <span className="px-2 py-1 rounded-lg bg-[var(--leaf-soft)] text-[var(--leaf)] text-[9px] font-bold uppercase tracking-wider">
                        {activeListing.sourceType ===
                        'farmer'
                          ? 'Farmer Harvest'
                          : 'Retail Inventory'}
                      </span>

                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-heading truncate">
                      {activeListing.foodName}
                    </h2>

                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {activeListing.quantity}{' '}
                      {activeListing.unit} •{' '}
                      {journeyContext.sourceLabel}:{' '}
                      {activeListing.sourceName}
                    </p>

                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {activeListing.location}
                    </p>

                  </div>

                </div>

                {/* ADVANCE */}

                {nextStage && (

                  <button
                    type="button"
                    onClick={() =>
                      onAdvanceJourney(
                        activeListing.id,
                        nextStage,
                        `Advanced to ${nextStage} via recovery coordinator`
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >

                    <span>
                      Advance Lifecycle
                    </span>

                    <ArrowRight className="w-3.5 h-3.5" />

                  </button>

                )}

              </div>

              {/* SOURCE CONTEXT */}

              <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">

                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)] mb-1">
                  {journeyContext.sourceLabel}
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {
                    journeyContext.sourceDescription
                  }
                </p>

              </div>

              {/* PROGRESS */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-heading">
                    Lifecycle Progress
                  </h3>

                  <span className="text-[10px] font-semibold text-[var(--leaf)]">
                    {activeListing.status.replace(
                      '_',
                      ' '
                    )}
                  </span>

                </div>

                <div className="overflow-x-auto pb-2">

                  <div className="flex items-center justify-between min-w-[650px] relative">

                    {/* CONNECTING LINE */}

                    <div className="absolute left-6 right-6 top-4 h-0.5 bg-[var(--border-subtle)] -z-0" />

                    {STAGES.map(
                      (stage, index) => {

                        const completed =
                          activeListing.journey.some(
                            (journey) =>
                              journey.status ===
                              stage
                          );

                        const isCurrent =
                          activeListing.status ===
                          stage;

                        const label =
                          journeyContext
                            .stages[
                            stage
                          ] ||
                          stage.replace(
                            '_',
                            ' '
                          );

                        return (
                          <div
                            key={stage}
                            className="flex flex-col items-center relative z-10"
                          >

                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                                completed
                                  ? 'bg-[var(--leaf)] text-white ring-4 ring-[var(--surface)]'
                                  : isCurrent
                                  ? 'bg-[var(--gold)] text-[var(--forest)] ring-4 ring-[var(--surface)]'
                                  : 'bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                              }`}
                            >
                              {completed
                                ? '✓'
                                : index +
                                  1}
                            </div>

                            <span
                              className={`text-[9px] sm:text-[10px] font-bold mt-2 uppercase tracking-wider text-center max-w-[85px] ${
                                completed ||
                                isCurrent
                                  ? 'text-[var(--text-main)]'
                                  : 'text-[var(--text-muted)]'
                              }`}
                            >
                              {label}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

              {/* MILESTONES */}

              <div>

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-heading">
                      Lifecycle Milestones
                    </h3>

                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Traceable events recorded for this listing.
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-[var(--leaf)]">
                    {
                      activeListing
                        .journey
                        .length
                    }{' '}
                    events
                  </span>

                </div>

                {activeListing.journey.length ===
                0 ? (

                  <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-center">

                    <Clock className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />

                    <p className="text-xs text-[var(--text-muted)]">
                      No milestone events have been recorded yet.
                    </p>

                  </div>

                ) : (

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--leaf)]/30">

                    {activeListing.journey.map(
                      (
                        step,
                        stepIndex
                      ) => {

                        const label =
                          journeyContext
                            .stages[
                            step.status
                          ] ||
                          step.status.replace(
                            '_',
                            ' '
                          );

                        return (
                          <div
                            key={
                              step.id ||
                              stepIndex
                            }
                            className="relative group"
                          >

                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[var(--leaf)] ring-4 ring-[var(--surface)]" />

                            <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] space-y-2 transition-colors group-hover:border-[var(--leaf)]/40">

                              <div className="flex flex-wrap items-center justify-between gap-2">

                                <div className="flex items-center gap-2">

                                  <span className="p-1.5 rounded-lg bg-[var(--surface)] shadow-sm">
                                    {getStageIcon(
                                      step.status
                                    )}
                                  </span>

                                  <span className="font-extrabold text-xs text-[var(--text-main)] font-heading">
                                    {label}
                                  </span>

                                </div>

                                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                                  {
                                    step.timestamp
                                  }
                                </span>

                              </div>

                              <div className="text-xs font-medium text-[var(--leaf)]">
                                Actor:{' '}
                                {
                                  step.actor
                                }{' '}
                                • Volume:{' '}
                                {
                                  step.quantity
                                }
                              </div>

                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                {
                                  step.notes
                                }
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* CURRENT STATE */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

                <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">

                  <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                    Current Stage
                  </div>

                  <div className="text-sm font-black text-[var(--text-main)] mt-1">
                    {
                      journeyContext
                        .stages[
                        activeListing
                          .status
                      ] ||
                      activeListing.status
                    }
                  </div>

                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">

                  <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                    Freshness
                  </div>

                  <div className="text-sm font-black text-[var(--leaf)] mt-1">
                    {
                      activeListing
                        .estimatedFreshness
                    }%
                  </div>

                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">

                  <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                    Recovery Path
                  </div>

                  <div className="text-sm font-black text-[var(--gold)] mt-1">
                    {
                      activeListing
                        .recoveryPath
                    }
                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};