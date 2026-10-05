import React, { useState } from 'react';
import {
  Tractor,
  PlusCircle,
  Sparkles,
  HeartHandshake,
  Clock,
  Trash2,
  Edit3,
  Search,
  Sprout,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';

import {
  FoodListing,
  FoodCategory,
  StorageCondition,
} from '../../types';

import {
  RiskBadge,
  FreshnessBadge,
  ListingStatusBadge,
} from '../ui/StatusBadge';

import { Modal } from '../ui/Modal';
import { VoiceInput } from '../ui/VoiceInput';
import { EmptyState } from '../ui/EmptyState';

interface FarmerPortalProps {
  listings: FoodListing[];
  onAddListing: (listing: Partial<FoodListing>) => void;
  onUpdateListing: (id: string, updates: Partial<FoodListing>) => void;
  onDeleteListing: (id: string) => void;
  onAnalyzeFood: (listing: FoodListing) => void;
  onFindReceiver: (listing: FoodListing) => void;
  onViewJourney: (listing: FoodListing) => void;
}

export const FarmerPortal: React.FC<FarmerPortalProps> = ({
  listings,
  onAddListing,
  onUpdateListing,
  onDeleteListing,
  onAnalyzeFood,
  onFindReceiver,
  onViewJourney,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodListing | null>(null);

  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Vegetables' as FoodCategory,
    quantity: 50,
    unit: 'kg',
    expiryDate: 'Within 3 days',
    storageCondition: 'Cold Cellar (10-12°C)' as StorageCondition,
    estimatedFreshness: 85,
    sensoryNotes: '',
    imageUrl:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  });

  /* ---------------------------------------------
     FARMER DATA
  --------------------------------------------- */

  const farmerListings = listings.filter(
    (listing) => listing.sourceType === 'farmer'
  );

  const totalHarvestKg = farmerListings.reduce(
    (sum, item) =>
      sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.8),
    0
  );

  const surplusListings = farmerListings.filter(
    (item) => item.status === 'AVAILABLE'
  );

  const recoveredListings = farmerListings.filter(
    (item) =>
      item.status === 'RECOVERED' ||
      item.status === 'PROCESSED'
  );

  const activeListings = farmerListings.filter(
    (item) =>
      item.status !== 'RECOVERED' &&
      item.status !== 'UNAVAILABLE'
  );

  const highRiskHarvests = farmerListings.filter(
    (item) =>
      item.risk === 'HIGH' ||
      item.risk === 'CRITICAL'
  );

  const filteredListings = farmerListings.filter((item) => {
    if (
      filterCategory !== 'all' &&
      item.category !== filterCategory
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      return (
        item.foodName.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.sourceName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  /* ---------------------------------------------
     FORM
  --------------------------------------------- */

  const resetForm = () => {
    setFormData({
      foodName: '',
      category: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      expiryDate: 'Within 3 days',
      storageCondition: 'Cold Cellar (10-12°C)',
      estimatedFreshness: 85,
      sensoryNotes: '',
      imageUrl:
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FoodListing) => {
    setEditingItem(item);

    setFormData({
      foodName: item.foodName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      storageCondition: item.storageCondition,
      estimatedFreshness: item.estimatedFreshness,
      sensoryNotes: item.sensoryNotes || '',
      imageUrl: item.imageUrl || '',
    });

    setIsModalOpen(true);
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!formData.foodName.trim()) {
      return;
    }

    const risk =
      formData.estimatedFreshness < 40
        ? 'CRITICAL'
        : formData.estimatedFreshness < 50
        ? 'HIGH'
        : formData.estimatedFreshness < 70
        ? 'MEDIUM'
        : 'LOW';

    const urgency =
      formData.estimatedFreshness < 50
        ? 'HIGH'
        : formData.estimatedFreshness < 70
        ? 'MEDIUM'
        : 'LOW';

    if (editingItem) {
      onUpdateListing(editingItem.id, {
        foodName: formData.foodName,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        storageCondition: formData.storageCondition,
        estimatedFreshness: formData.estimatedFreshness,
        risk,
        urgency,
        sensoryNotes: formData.sensoryNotes,
        imageUrl: formData.imageUrl,
      });
    } else {
      onAddListing({
        foodName: formData.foodName,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,

        sourceType: 'farmer',
        sourceName: 'GreenValley Farm Hub',
        location: 'North Valley Farm Hub',

        dateAdded: 'Today',
        expiryDate: formData.expiryDate,

        estimatedFreshness:
          formData.estimatedFreshness,

        risk,
        urgency,

        storageCondition:
          formData.storageCondition,

        status: 'AVAILABLE',

        recommendedAction:
          formData.estimatedFreshness < 50
            ? 'Prioritize immediate recovery, donation, or processing'
            : 'Match with a suitable recovery partner',

        recoveryPath:
          formData.estimatedFreshness < 50
            ? 'PROCESS'
            : 'DONATE',

        sensoryNotes: formData.sensoryNotes,
        imageUrl: formData.imageUrl,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  /* ---------------------------------------------
     RENDER
  --------------------------------------------- */

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">

      {/* HERO */}

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-5">

        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
            <Tractor className="w-4 h-4" />
            Post-Harvest Recovery
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            Farmer Harvest Recovery Portal
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Track harvested produce, detect surplus before value is
            lost, understand condition with Gemma 4, and move each
            harvest toward the best recovery pathway.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl bg-[var(--forest)] hover:bg-[#23523B] text-[#F5F1E8] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[var(--light-gold)]" />
          Record Harvest Surplus
        </button>
      </section>

      {/* METRICS */}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="scraply-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Harvest Volume</span>
            <Sprout className="w-4 h-4 text-[var(--leaf)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--forest)] font-heading">
            {Math.round(totalHarvestKg)}
            <span className="text-sm font-normal text-[var(--text-muted)]">
              {' '}kg
            </span>
          </div>

          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Produce entering recovery workflows
          </span>
        </div>

        <div className="scraply-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Surplus Available</span>
            <SunMedium className="w-4 h-4 text-[var(--gold)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--gold)] font-heading">
            {surplusListings.length}
          </div>

          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Ready for matching or recovery
          </span>
        </div>

        <div className="scraply-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Harvest Recovered</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--leaf)] font-heading">
            {recoveredListings.length}
          </div>

          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Harvest successfully diverted from waste
          </span>
        </div>

        <div className="scraply-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Active Harvest Cases</span>
            <Clock className="w-4 h-4 text-[var(--forest)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--forest)] font-heading">
            {activeListings.length}
          </div>

          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Still moving through recovery
          </span>
        </div>

      </section>

      {/* RECOVERY PIPELINE */}

      <section className="scraply-card p-5">

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Harvest Recovery Pipeline
            </h2>

            <p className="text-xs text-[var(--text-muted)] mt-1">
              The farmer workflow starts at harvest, not retail inventory.
            </p>
          </div>

          <Sprout className="w-5 h-5 text-[var(--leaf)]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">

          {[
            ['01', 'Harvested'],
            ['02', 'Condition'],
            ['03', 'Surplus'],
            ['04', 'Matched'],
            ['05', 'Recovered'],
          ].map(([number, label]) => (
            <div
              key={number}
              className="rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] p-3"
            >
              <div className="text-[10px] font-bold text-[var(--gold)]">
                {number}
              </div>

              <div className="text-xs font-bold text-[var(--text-main)] mt-1">
                {label}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* HIGH RISK HARVESTS */}

      {highRiskHarvests.length > 0 && (
        <section>

          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
                Harvests Needing Attention
              </h2>

              <p className="text-xs text-[var(--text-muted)]">
                Prioritize produce whose condition is declining.
              </p>
            </div>

            <span className="text-xs font-bold text-red-600">
              {highRiskHarvests.length} priority
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {highRiskHarvests.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="scraply-card p-5 border-red-500/20 hover:border-red-500/40 transition-all"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    )}

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[var(--text-main)] truncate">
                        {item.foodName}
                      </h3>

                      <p className="text-xs text-[var(--text-muted)]">
                        {item.quantity} {item.unit}
                      </p>
                    </div>

                  </div>

                  <RiskBadge
                    level={item.risk}
                    size="sm"
                  />

                </div>

                <div className="mt-4 space-y-2">

                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      Freshness
                    </span>

                    <FreshnessBadge
                      score={item.estimatedFreshness}
                      showBar
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      Recovery window
                    </span>

                    <span className="font-semibold text-[var(--text-main)]">
                      {item.expiryDate}
                    </span>
                  </div>

                </div>

                <div className="flex gap-2 mt-4">

                  <button
                    type="button"
                    onClick={() => onAnalyzeFood(item)}
                    className="flex-1 py-2 rounded-xl bg-[var(--forest)] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#23523B] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--light-gold)]" />
                    Analyze
                  </button>

                  <button
                    type="button"
                    onClick={() => onFindReceiver(item)}
                    className="py-2 px-3 rounded-xl bg-[var(--leaf-soft)] text-[var(--leaf)] text-xs font-bold hover:bg-[var(--leaf)] hover:text-white cursor-pointer"
                  >
                    Find Receiver
                  </button>

                </div>

              </div>
            ))}

          </div>
        </section>
      )}

      {/* MY HARVESTS */}

      <section className="scraply-card p-6 space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">

          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
              My Harvests & Surplus Produce
            </h2>

            <p className="text-xs text-[var(--text-muted)] mt-1">
              Manage harvested produce and follow every harvest through recovery.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search harvests..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none w-44"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(event) =>
                setFilterCategory(event.target.value)
              }
              className="px-2.5 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none cursor-pointer"
            >
              <option value="all">
                All Harvest Categories
              </option>

              <option value="Vegetables">
                Vegetables
              </option>

              <option value="Fruits">
                Fruits
              </option>

              <option value="Grains">
                Grains
              </option>

              <option value="Other">
                Other
              </option>
            </select>

          </div>

        </div>

        {filteredListings.length === 0 ? (

          <EmptyState
            icon={Tractor}
            title="No harvest records found"
            description="Record harvested produce or surplus to start a recovery workflow."
            actionLabel="Record Harvest Surplus"
            onAction={handleOpenAdd}
          />

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {filteredListings.map((item) => (

              <div
                key={item.id}
                className="scraply-card p-5 flex flex-col justify-between hover:border-[var(--leaf)] transition-all group"
              >

                <div>

                  <div className="flex items-start justify-between gap-2 mb-3">

                    <div className="flex items-center gap-3 min-w-0">

                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.foodName}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/10 group-hover:scale-105 transition-transform"
                        />
                      )}

                      <div className="min-w-0">

                        <h3 className="font-bold text-sm text-[var(--text-main)] font-heading truncate">
                          {item.foodName}
                        </h3>

                        <span className="text-xs text-[var(--text-muted)]">
                          {item.quantity} {item.unit}
                        </span>

                      </div>

                    </div>

                    <ListingStatusBadge
                      status={item.status}
                    />

                  </div>

                  <div className="space-y-2 py-3 border-y border-[var(--border-subtle)] my-3">

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">
                        Freshness
                      </span>

                      <FreshnessBadge
                        score={item.estimatedFreshness}
                        showBar
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">
                        Risk
                      </span>

                      <RiskBadge
                        level={item.risk}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">
                        Post-Harvest Window
                      </span>

                      <span className="font-medium text-[var(--text-main)] text-right">
                        {item.expiryDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">
                        Storage
                      </span>

                      <span className="font-medium text-[var(--text-main)] text-right max-w-[150px]">
                        {item.storageCondition}
                      </span>
                    </div>

                    {item.sensoryNotes && (
                      <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                        "{item.sensoryNotes}"
                      </p>
                    )}

                  </div>

                </div>

                <div className="pt-2 flex items-center justify-between gap-2">

                  <button
                    type="button"
                    onClick={() => onAnalyzeFood(item)}
                    className="py-1.5 px-2.5 rounded-lg bg-[var(--forest)] text-[var(--light-gold)] hover:bg-[#23523B] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze Harvest
                  </button>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      onClick={() => onFindReceiver(item)}
                      title="Find recovery receiver"
                      className="p-1.5 rounded-lg bg-[var(--leaf-soft)] text-[var(--leaf)] hover:bg-[var(--leaf)] hover:text-white transition-colors cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onViewJourney(item)}
                      title="View harvest recovery journey"
                      className="p-1.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit harvest"
                      className="p-1.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteListing(item.id)}
                      title="Delete harvest"
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* RECOVERY LIFECYCLE */}

      <section className="scraply-card p-6">

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[var(--leaf)]" />

          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Farmer Recovery Lifecycle
            </h2>

            <p className="text-xs text-[var(--text-muted)]">
              Every harvest can move from field surplus to a useful destination.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {[
            'Harvested',
            'Analyzed',
            'Surplus Detected',
            'Listed',
            'Matched',
            'Claimed',
            'Recovered',
          ].map((stage, index) => (
            <React.Fragment key={stage}>

              <div className="px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)]">
                {stage}
              </div>

              {index < 6 && (
                <span className="text-[var(--gold)] font-bold">
                  →
                </span>
              )}

            </React.Fragment>
          ))}

        </div>

      </section>

      {/* MODAL */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? 'Edit Harvest Record'
            : 'Record Harvest Surplus'
        }
        subtitle="Record harvest quantity, condition, storage, and post-harvest information."
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* PRODUCE */}

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
              Harvest Produce *
            </label>

            <input
              type="text"
              required
              value={formData.foodName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  foodName: event.target.value,
                })
              }
              placeholder="e.g. Roma Plum Tomatoes"
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />
          </div>

          {/* CATEGORY + QUANTITY */}

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Harvest Category
              </label>

              <select
                value={formData.category}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    category:
                      event.target.value as FoodCategory,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              >
                <option value="Vegetables">
                  Vegetables
                </option>

                <option value="Fruits">
                  Fruits
                </option>

                <option value="Grains">
                  Grains
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Harvest Quantity
              </label>

              <div className="flex gap-2">

                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      quantity: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                />

                <select
                  value={formData.unit}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      unit: event.target.value,
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="crates">crates</option>
                  <option value="boxes">boxes</option>
                </select>

              </div>
            </div>

          </div>

          {/* STORAGE + EXPIRY */}

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Storage Method
              </label>

              <select
                value={formData.storageCondition}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    storageCondition:
                      event.target.value as StorageCondition,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              >
                <option value="Cold Cellar (10-12°C)">
                  Cold Cellar (10-12°C)
                </option>

                <option value="Refrigerated (2-4°C)">
                  Refrigerated (2-4°C)
                </option>

                <option value="Unchilled Crate">
                  Unchilled Crate
                </option>

                <option value="Ambient Room Temp">
                  Ambient Room Temp
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Post-Harvest Window
              </label>

              <input
                type="text"
                value={formData.expiryDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    expiryDate: event.target.value,
                  })
                }
                placeholder="e.g. 2 days post harvest"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              />
            </div>

          </div>

          {/* FRESHNESS */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <label className="text-xs font-bold text-[var(--text-main)] font-heading">
                Estimated Freshness
              </label>

              <span className="text-xs font-black text-[var(--leaf)]">
                {formData.estimatedFreshness}%
              </span>

            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={formData.estimatedFreshness}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  estimatedFreshness:
                    Number(event.target.value),
                })
              }
              className="w-full accent-[var(--leaf)]"
            />

            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>Critical</span>
              <span>Moderate</span>
              <span>Fresh</span>
            </div>

          </div>

          {/* NOTES */}

          <div>

            <div className="flex items-center justify-between mb-1">

              <label className="text-xs font-bold text-[var(--text-main)] font-heading">
                Harvest / Sensory Notes
              </label>

              <VoiceInput
                buttonSize="sm"
                label="Voice Input"
                onTranscript={(transcript) => {
                  setFormData((previous) => ({
                    ...previous,
                    sensoryNotes: previous.sensoryNotes
                      ? `${previous.sensoryNotes} ${transcript}`
                      : transcript,
                  }));
                }}
              />

            </div>

            <textarea
              rows={3}
              value={formData.sensoryNotes}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  sensoryNotes: event.target.value,
                })
              }
              placeholder="e.g. B-grade cosmetic sorting, firm pulp, minor surface marks..."
              className="w-full p-2.5 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
              Produce Image URL
            </label>

            <input
              type="url"
              value={formData.imageUrl}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  imageUrl: event.target.value,
                })
              }
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />

          </div>

          {/* ACTIONS */}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {editingItem
                ? 'Save Harvest Changes'
                : 'Publish Harvest Surplus'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};