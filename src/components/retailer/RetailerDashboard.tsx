import React, { useState } from 'react';
import {
  Store,
  PlusCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  Trash2,
  Edit3,
  Search,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Boxes,
  PackageSearch,
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
import { EmptyState } from '../ui/EmptyState';

interface RetailerDashboardProps {
  listings: FoodListing[];
  onAddListing: (listing: Partial<FoodListing>) => void;
  onUpdateListing: (
    id: string,
    updates: Partial<FoodListing>
  ) => void;
  onDeleteListing: (id: string) => void;
  onAnalyzeFood: (listing: FoodListing) => void;
  onFindReceiver: (listing: FoodListing) => void;
  onViewJourney: (listing: FoodListing) => void;
}

export const RetailerDashboard: React.FC<
  RetailerDashboardProps
> = ({
  listings,
  onAddListing,
  onUpdateListing,
  onDeleteListing,
  onAnalyzeFood,
  onFindReceiver,
  onViewJourney,
}) => {
  const [filterCategory, setFilterCategory] =
    useState<string>('all');

  const [filterRisk, setFilterRisk] =
    useState<string>('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<FoodListing | null>(null);

  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Fruits' as FoodCategory,
    quantity: 20,
    unit: 'kg',
    expiryDate: 'Within 24 hours',
    storageCondition:
      'Ambient Room Temp' as StorageCondition,
    estimatedFreshness: 75,
    sensoryNotes: '',
    imageUrl:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  });

  /* ---------------------------------------------
     RETAILER INVENTORY
  --------------------------------------------- */

  const retailerListings = listings.filter(
    (item) => item.sourceType === 'retailer'
  );

  const totalInventoryKg =
    retailerListings.reduce(
      (sum, item) =>
        sum +
        (item.unit === 'kg'
          ? item.quantity
          : item.quantity * 0.7),
      0
    );

  const atRiskListings =
    retailerListings.filter(
      (item) =>
        item.risk === 'HIGH' ||
        item.risk === 'CRITICAL'
    );

  const atRiskKg =
    atRiskListings.reduce(
      (sum, item) =>
        sum +
        (item.unit === 'kg'
          ? item.quantity
          : item.quantity * 0.7),
      0
    );

  const recoveredListings =
    retailerListings.filter(
      (item) =>
        item.status === 'RECOVERED' ||
        item.status === 'PROCESSED'
    );

  const recoveredKg =
    recoveredListings.reduce(
      (sum, item) =>
        sum +
        (item.unit === 'kg'
          ? item.quantity
          : item.quantity * 0.7),
      0
    );

  const recoveryRate =
    totalInventoryKg > 0
      ? Math.round(
          (recoveredKg / totalInventoryKg) * 100
        )
      : 0;

  const expiringSoonListings =
    retailerListings.filter(
      (item) =>
        item.urgency === 'HIGH' ||
        item.urgency === 'CRITICAL' ||
        item.expiryDate
          .toLowerCase()
          .includes('hour')
    );

  const filteredListings =
    retailerListings.filter((item) => {
      if (
        filterCategory !== 'all' &&
        item.category !== filterCategory
      ) {
        return false;
      }

      if (
        filterRisk !== 'all' &&
        item.risk !== filterRisk
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q =
          searchQuery.toLowerCase();

        return (
          item.foodName
            .toLowerCase()
            .includes(q) ||
          item.location
            .toLowerCase()
            .includes(q) ||
          item.category
            .toLowerCase()
            .includes(q) ||
          item.sourceName
            .toLowerCase()
            .includes(q) ||
          (
            item.sensoryNotes || ''
          )
            .toLowerCase()
            .includes(q)
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
      category: 'Fruits',
      quantity: 20,
      unit: 'kg',
      expiryDate: 'Within 24 hours',
      storageCondition:
        'Ambient Room Temp',
      estimatedFreshness: 75,
      sensoryNotes: '',
      imageUrl:
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (
    item: FoodListing
  ) => {
    setEditingItem(item);

    setFormData({
      foodName: item.foodName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      storageCondition:
        item.storageCondition,
      estimatedFreshness:
        item.estimatedFreshness,
      sensoryNotes:
        item.sensoryNotes || '',
      imageUrl:
        item.imageUrl || '',
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
      formData.estimatedFreshness < 40
        ? 'CRITICAL'
        : formData.estimatedFreshness < 60
        ? 'HIGH'
        : formData.estimatedFreshness < 75
        ? 'MEDIUM'
        : 'LOW';

    if (editingItem) {
      onUpdateListing(
        editingItem.id,
        {
          foodName:
            formData.foodName,
          category:
            formData.category,
          quantity:
            formData.quantity,
          unit:
            formData.unit,
          expiryDate:
            formData.expiryDate,
          storageCondition:
            formData.storageCondition,
          estimatedFreshness:
            formData.estimatedFreshness,
          risk,
          urgency,
          sensoryNotes:
            formData.sensoryNotes,
          imageUrl:
            formData.imageUrl,
        }
      );
    } else {
      onAddListing({
        foodName:
          formData.foodName,
        category:
          formData.category,
        quantity:
          formData.quantity,
        unit:
          formData.unit,

        sourceType: 'retailer',
        sourceName:
          'Metro Green Superstore #14',
        location:
          'Metro West Distribution Hub',

        dateAdded: 'Today',
        expiryDate:
          formData.expiryDate,

        estimatedFreshness:
          formData.estimatedFreshness,

        risk,
        urgency,

        storageCondition:
          formData.storageCondition,

        status: 'AVAILABLE',

        recommendedAction:
          formData.estimatedFreshness < 50
            ? 'Prioritize immediate recovery or processing'
            : 'Analyze inventory and match with a recovery partner',

        recoveryPath:
          formData.estimatedFreshness < 60
            ? 'PROCESS'
            : 'DONATE',

        sensoryNotes:
          formData.sensoryNotes,

        imageUrl:
          formData.imageUrl,
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

      {/* HEADER */}

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-5">

        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            Inventory Recovery Operations
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            Retailer Inventory Recovery Hub
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Monitor selling inventory, detect items approaching
            expiry or low sell-through, use Gemma 4 to assess
            condition, and recover value before stock becomes waste.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl bg-[var(--forest)] hover:bg-[#23523B] text-[#F5F1E8] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[var(--light-gold)]" />
          Add Inventory for Recovery
        </button>

      </section>

      {/* METRICS */}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="scraply-card p-5">

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Inventory Under Recovery</span>
            <Boxes className="w-4 h-4 text-[var(--forest)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--forest)] font-heading">
            {Math.round(totalInventoryKg)}
            <span className="text-sm font-normal text-[var(--text-muted)]">
              {' '}kg
            </span>
          </div>

          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Across {retailerListings.length} tracked inventory records
          </span>

        </div>

        <div className="scraply-card p-5 border-orange-500/30">

          <div className="flex items-center justify-between text-xs text-orange-700 font-semibold mb-1">
            <span>At-Risk Inventory</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-orange-700 font-heading">
            {Math.round(atRiskKg)}
            <span className="text-sm font-normal">
              {' '}kg
            </span>
          </div>

          <span className="text-[11px] text-orange-700 mt-1 block font-medium">
            {atRiskListings.length} inventory items requiring immediate action
          </span>

        </div>

        <div className="scraply-card p-5">

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Inventory Recovered</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--leaf)] font-heading">
            {Math.round(recoveredKg)}
            <span className="text-sm font-normal text-[var(--text-muted)]">
              {' '}kg
            </span>
          </div>

          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Unsold stock redirected before waste
          </span>

        </div>

        <div className="scraply-card p-5">

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Inventory Recovery Rate</span>
            <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-[var(--forest)] font-heading">
            {recoveryRate}%
          </div>

          <div className="w-full h-1.5 bg-neutral-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[var(--leaf)] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  recoveryRate,
                  100
                )}%`,
              }}
            />
          </div>

        </div>

      </section>

      {/* RETAILER WORKFLOW */}

      <section className="scraply-card p-5">

        <div className="flex items-center gap-3 mb-4">

          <PackageSearch className="w-5 h-5 text-[var(--leaf)]" />

          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Inventory Recovery Workflow
            </h2>

            <p className="text-xs text-[var(--text-muted)] mt-1">
              Retailer recovery starts with inventory that is not
              selling fast enough or is approaching expiry.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">

          {[
            ['01', 'Inventory Added'],
            ['02', 'Selling Period'],
            ['03', 'At-Risk'],
            ['04', 'AI Analysis'],
            ['05', 'Matched'],
            ['06', 'Recovered'],
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

      {/* AT RISK */}

      <section className="space-y-4">

        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />

              <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
                At-Risk Inventory
              </h2>
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-1">
              Inventory with high decay risk or a short recovery window.
            </p>
          </div>

          <span className="text-xs text-[var(--text-muted)]">
            {atRiskListings.length} priority items
          </span>

        </div>

        {atRiskListings.length === 0 ? (

          <div className="scraply-card p-6 text-center">
            <CheckCircle2 className="w-7 h-7 text-[var(--leaf)] mx-auto mb-2" />

            <p className="text-xs text-[var(--text-muted)]">
              No inventory currently requires urgent recovery.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {atRiskListings.map((item) => (

              <div
                key={item.id}
                className="scraply-card p-5 border-orange-500/30 hover:border-orange-500/60 transition-all"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/10"
                      />
                    )}

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[var(--text-main)] truncate">
                        {item.foodName}
                      </h3>

                      <span className="text-xs text-[var(--text-muted)]">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                  </div>

                  <RiskBadge
                    level={item.risk}
                    size="sm"
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
                      Recovery Window
                    </span>

                    <span className="font-bold text-orange-700">
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

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      onAnalyzeFood(item)
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--light-gold)]" />
                    Analyze AI
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onFindReceiver(item)
                    }
                    className="py-2 px-3 rounded-xl bg-[var(--leaf-soft)] hover:bg-[var(--leaf)] hover:text-white text-[var(--leaf)] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Find Receiver
                    <ArrowRight className="w-3 h-3" />
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* EXPIRING SOON */}

      <section className="scraply-card p-6">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />

            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
                Expiring Inventory Alert
              </h2>

              <p className="text-xs text-[var(--text-muted)] mt-1">
                Prioritize inventory with the shortest selling or recovery window.
              </p>
            </div>
          </div>

          <span className="text-xs text-[var(--text-muted)]">
            {expiringSoonListings.length} alerts
          </span>

        </div>

        {expiringSoonListings.length === 0 ? (

          <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            No inventory is currently approaching its recovery deadline.
          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {expiringSoonListings.map((item) => (

              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
              >

                <div className="min-w-0">

                  <div className="font-bold text-xs text-[var(--text-main)] truncate">
                    {item.foodName}
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    {item.quantity} {item.unit}
                  </div>

                  <div className="text-[11px] text-orange-700 font-semibold mt-1">
                    {item.expiryDate}
                  </div>

                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {item.estimatedFreshness}% estimated freshness
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    onFindReceiver(item)
                  }
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--leaf)] hover:bg-[var(--forest)] text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  Recover
                  <ArrowRight className="w-3 h-3" />
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* INVENTORY */}

      <section className="scraply-card p-6 space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">

          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
              Current Inventory & Recovery Management
            </h2>

            <p className="text-xs text-[var(--text-muted)] mt-1">
              Track inventory condition, quantities, expiry windows,
              AI insights, and recovery status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

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
                placeholder="Search inventory..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:border-[var(--leaf)] focus:outline-none w-44"
              />

            </div>

            <select
              value={filterCategory}
              onChange={(event) =>
                setFilterCategory(
                  event.target.value
                )
              }
              className="px-2.5 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none cursor-pointer"
            >
              <option value="all">
                All Categories
              </option>

              <option value="Fruits">
                Fruits
              </option>

              <option value="Vegetables">
                Vegetables
              </option>

              <option value="Grains">
                Grains
              </option>

              <option value="Dairy">
                Dairy
              </option>

              <option value="Bakery">
                Bakery
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <select
              value={filterRisk}
              onChange={(event) =>
                setFilterRisk(
                  event.target.value
                )
              }
              className="px-2.5 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none cursor-pointer"
            >
              <option value="all">
                All Risk
              </option>

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>
            </select>

          </div>

        </div>

        {filteredListings.length === 0 ? (

          <EmptyState
            icon={Store}
            title="No inventory records found"
            description="No retailer inventory matches the current filters."
            actionLabel="Add Inventory"
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
                        score={
                          item.estimatedFreshness
                        }
                        showBar
                      />

                    </div>

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-[var(--text-muted)]">
                        Inventory Risk
                      </span>

                      <RiskBadge
                        level={item.risk}
                        size="sm"
                      />

                    </div>

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-[var(--text-muted)]">
                        Selling Window
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
                    onClick={() =>
                      onAnalyzeFood(item)
                    }
                    className="py-1.5 px-2.5 rounded-lg bg-[var(--forest)] text-[var(--light-gold)] hover:bg-[#23523B] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze Inventory
                  </button>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      onClick={() =>
                        onFindReceiver(item)
                      }
                      title="Find recovery receiver"
                      className="p-1.5 rounded-lg bg-[var(--leaf-soft)] text-[var(--leaf)] hover:bg-[var(--leaf)] hover:text-white transition-colors cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onViewJourney(item)
                      }
                      title="View inventory recovery journey"
                      className="p-1.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEdit(item)
                      }
                      title="Edit inventory"
                      className="p-1.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDeleteListing(item.id)
                      }
                      title="Delete inventory"
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

      {/* RECOVERY HISTORY */}

      <section className="scraply-card p-6">

        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)]" />

          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Inventory Recovery Summary
            </h2>

            <p className="text-xs text-[var(--text-muted)]">
              Unsold inventory that has successfully moved into recovery.
            </p>
          </div>
        </div>

        {recoveredListings.length === 0 ? (

          <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            No inventory has been marked as recovered yet.
          </div>

        ) : (

          <div className="space-y-2">

            {recoveredListings
              .slice(0, 5)
              .map((item) => (

                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-2 h-2 rounded-full bg-[var(--leaf)] shrink-0" />

                    <div className="min-w-0">

                      <div className="text-xs font-bold text-[var(--text-main)] truncate">
                        {item.foodName}
                      </div>

                      <div className="text-[11px] text-[var(--text-muted)]">
                        {item.quantity} {item.unit} • Inventory recovered
                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onViewJourney(item)
                    }
                    className="shrink-0 text-[11px] font-bold text-[var(--leaf)] hover:text-[var(--forest)] cursor-pointer"
                  >
                    View Journey
                  </button>

                </div>

              ))}

          </div>

        )}

      </section>

      {/* ADD / EDIT MODAL */}

      <Modal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        title={
          editingItem
            ? 'Edit Retail Inventory'
            : 'Add Inventory for Recovery'
        }
        subtitle="Record unsold inventory, condition, expiry window, and storage information."
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
              Inventory Item *
            </label>

            <input
              type="text"
              required
              value={formData.foodName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  foodName:
                    event.target.value,
                })
              }
              placeholder="e.g. Ripe Bananas"
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Category
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
                <option value="Fruits">
                  Fruits
                </option>

                <option value="Vegetables">
                  Vegetables
                </option>

                <option value="Grains">
                  Grains
                </option>

                <option value="Dairy">
                  Dairy
                </option>

                <option value="Bakery">
                  Bakery
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

            <div>

              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Quantity
              </label>

              <div className="flex gap-2">

                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      quantity:
                        Number(
                          event.target.value
                        ),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                />

                <select
                  value={formData.unit}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      unit:
                        event.target.value,
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                >
                  <option value="kg">
                    kg
                  </option>

                  <option value="boxes">
                    boxes
                  </option>

                  <option value="crates">
                    crates
                  </option>

                  <option value="units">
                    units
                  </option>
                </select>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Expiry / Selling Window
              </label>

              <input
                type="text"
                value={formData.expiryDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    expiryDate:
                      event.target.value,
                  })
                }
                placeholder="e.g. Within 24 hours"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Storage
              </label>

              <select
                value={
                  formData.storageCondition
                }
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    storageCondition:
                      event.target.value as StorageCondition,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              >
                <option value="Ambient Room Temp">
                  Ambient Room Temp
                </option>

                <option value="Refrigerated (2-4°C)">
                  Refrigerated (2-4°C)
                </option>

                <option value="Cold Cellar (10-12°C)">
                  Cold Cellar (10-12°C)
                </option>

                <option value="Unchilled Crate">
                  Unchilled Crate
                </option>
              </select>

            </div>

          </div>

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
              value={
                formData.estimatedFreshness
              }
              onChange={(event) =>
                setFormData({
                  ...formData,
                  estimatedFreshness:
                    Number(
                      event.target.value
                    ),
                })
              }
              className="w-full accent-[var(--leaf)]"
            />

            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>Critical</span>
              <span>At-Risk</span>
              <span>Fresh</span>
            </div>

          </div>

          <div>

            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
              Inventory / Condition Notes
            </label>

            <textarea
              rows={3}
              value={
                formData.sensoryNotes
              }
              onChange={(event) =>
                setFormData({
                  ...formData,
                  sensoryNotes:
                    event.target.value,
                })
              }
              placeholder="e.g. Slow-moving stock, cosmetic damage, ripe batch, packaging issue..."
              className="w-full p-2.5 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />

          </div>

          <div>

            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
              Product Image URL
            </label>

            <input
              type="url"
              value={
                formData.imageUrl
              }
              onChange={(event) =>
                setFormData({
                  ...formData,
                  imageUrl:
                    event.target.value,
                })
              }
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />

          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(false)
              }
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {editingItem
                ? 'Save Inventory Changes'
                : 'Add Inventory'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};