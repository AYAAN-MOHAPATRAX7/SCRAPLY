import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Sparkles,
  HeartHandshake,
  Clock,
  CheckCircle2,
  Bookmark,
  Search,
  Filter,
  PackageCheck,
  Send,
  Building,
  Calendar,
} from 'lucide-react';
import { FoodListing, FoodCategory, NGONeed } from '../../types';
import { RiskBadge, UrgencyBadge, FreshnessBadge, ListingStatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { VoiceInput } from '../ui/VoiceInput';
import { EmptyState } from '../ui/EmptyState';

interface NGOPortalProps {
  listings: FoodListing[];
  ngoNeeds: NGONeed[];
  onClaimFood: (listingId: string, ngoName: string) => void;
  onMarkReceived: (listingId: string) => void;
  onCreateNeed: (need: Partial<NGONeed>) => void;
  onViewJourney: (listing: FoodListing) => void;
  onAnalyzeFood: (listing: FoodListing) => void;
}

export const NGOPortal: React.FC<NGOPortalProps> = ({
  listings,
  ngoNeeds,
  onClaimFood,
  onMarkReceived,
  onCreateNeed,
  onViewJourney,
  onAnalyzeFood,
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Form State for Create Need
  const [needForm, setNeedForm] = useState({
    foodNeeded: '',
    category: 'Vegetables' as FoodCategory,
    quantity: 50,
    unit: 'kg',
    requiredBy: 'Tomorrow, 12:00 PM',
    priority: 'HIGH' as 'HIGH' | 'MEDIUM' | 'LOW',
    description: '',
  });

  // Calculate NGO metrics
  const availableFood = listings.filter((l) => l.status === 'AVAILABLE');
  const claimedFood = listings.filter((l) => l.status === 'CLAIMED' || l.status === 'IN_TRANSIT');
  const receivedFood = listings.filter((l) => l.status === 'RECEIVED' || l.status === 'RECOVERED');
  const activeRequests = ngoNeeds.filter((n) => n.status === 'ACTIVE');
  const totalRecoveredKg = receivedFood.reduce(
    (sum, l) => sum + (l.unit === 'kg' ? l.quantity : l.quantity * 0.75),
    0
  );

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateNeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!needForm.foodNeeded.trim()) return;

    onCreateNeed({
      ngoName: 'Community Food Network',
      contactPerson: 'Director Elena Vance',
      foodNeeded: needForm.foodNeeded,
      category: needForm.category,
      quantity: needForm.quantity,
      unit: needForm.unit,
      requiredBy: needForm.requiredBy,
      priority: needForm.priority,
      description: needForm.description,
      status: 'ACTIVE',
      createdAt: 'Just now',
    });

    setIsNeedModalOpen(false);
    setNeedForm({
      foodNeeded: '',
      category: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      requiredBy: 'Tomorrow, 12:00 PM',
      priority: 'HIGH',
      description: '',
    });
  };

  // Filter available listings
  const filteredListings = listings.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.foodName.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            NGO & Food Bank Discovery Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            NGO Surplus Food Network
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Discover verified surplus supply from local retailers and farms, evaluate condition and urgency, post community dietary needs, and coordinate immediate food recovery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNeedModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[var(--forest)] hover:bg-[#23523B] text-[#F5F1E8] font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[var(--light-gold)]" />
          <span>Post Food Need / Request</span>
        </button>
      </div>

      {/* NGO OVERVIEW METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="scraply-card p-4">
          <span className="text-[11px] text-[var(--text-muted)] font-medium block mb-1">
            Available Surplus
          </span>
          <div className="text-2xl font-black text-[var(--forest)] dark:text-[var(--text-main)] font-heading">
            {availableFood.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Ready for pickup/claim</span>
        </div>

        <div className="scraply-card p-4">
          <span className="text-[11px] text-[var(--text-muted)] font-medium block mb-1">
            Claimed Surplus
          </span>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-heading">
            {claimedFood.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">En route or allocated</span>
        </div>

        <div className="scraply-card p-4">
          <span className="text-[11px] text-[var(--text-muted)] font-medium block mb-1">
            Received by NGOs
          </span>
          <div className="text-2xl font-black text-[var(--leaf)] font-heading">
            {receivedFood.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Delivered to shelters</span>
        </div>

        <div className="scraply-card p-4">
          <span className="text-[11px] text-[var(--text-muted)] font-medium block mb-1">
            Active Needs
          </span>
          <div className="text-2xl font-black text-[var(--gold)] font-heading">
            {activeRequests.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Community demand</span>
        </div>

        <div className="scraply-card p-4 col-span-2 lg:col-span-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium block mb-1">
            Total Recovered
          </span>
          <div className="text-2xl font-black text-[var(--forest)] dark:text-[var(--text-main)] font-heading">
            {Math.round(totalRecoveredKg)} <span className="text-xs font-normal">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Diverted from waste</span>
        </div>
      </div>

      {/* ACTIVE NGO DEMAND / NEEDS SECTION */}
      <section className="scraply-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[var(--leaf)]" />
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Active Community Food Requests & Dietary Needs
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsNeedModalOpen(true)}
            className="text-xs text-[var(--leaf)] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Need
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {ngoNeeds.map((need) => (
            <div
              key={need.id}
              className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                      need.priority === 'HIGH'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {need.priority} Priority
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{need.createdAt}</span>
                </div>

                <h3 className="font-bold text-sm text-[var(--text-main)] mt-2 font-heading">
                  {need.foodNeeded}
                </h3>
                <div className="text-xs font-semibold text-[var(--leaf)]">
                  {need.quantity} {need.unit} needed
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1">
                  {need.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-medium truncate max-w-[120px]">{need.ngoName}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                  By {need.requiredBy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOD DISCOVERY STREAM */}
      <section className="scraply-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
              Surplus Food Discovery Feed
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Browse available produce and surplus stock from local retailers and farmers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, donor..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none w-44"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-[var(--surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Bakery">Bakery</option>
              <option value="Dairy">Dairy</option>
              <option value="Prepared Food">Prepared Food</option>
            </select>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching surplus food listings"
            description="All active food items have either been claimed or no items match your search."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => {
              const isClaimedByMe = item.claimedBy === 'Community Kitchen' || item.claimedBy === 'Hope Food Foundation';
              const isAvailable = item.status === 'AVAILABLE';

              return (
                <div
                  key={item.id}
                  className="scraply-card p-5 flex flex-col justify-between hover:border-[var(--leaf)] transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.foodName}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/10 group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                            {item.foodName}
                          </h3>
                          <div className="text-xs font-semibold text-[var(--forest)] dark:text-[var(--light-gold)]">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            {item.sourceName} • {item.location}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSave(item.id)}
                        title={savedIds.includes(item.id) ? 'Saved' : 'Save for later'}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                          savedIds.includes(item.id)
                            ? 'bg-[var(--gold)] text-[var(--forest)] border-[var(--gold)]'
                            : 'bg-[var(--surface-hover)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 py-2.5 border-y border-[var(--border-subtle)] my-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Freshness:</span>
                        <FreshnessBadge score={item.estimatedFreshness} showBar />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Urgency Window:</span>
                        <UrgencyBadge level={item.urgency} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Status:</span>
                        <ListingStatusBadge status={item.status} />
                      </div>
                      {item.sensoryNotes && (
                        <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                          "{item.sensoryNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    {/* Primary Action Button */}
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => onClaimFood(item.id, 'Community Food Network')}
                        className="w-full py-2.5 px-4 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <HeartHandshake className="w-4 h-4 text-[var(--light-gold)]" />
                        <span>Claim Surplus for Community</span>
                      </button>
                    ) : item.status === 'CLAIMED' || item.status === 'IN_TRANSIT' ? (
                      <button
                        type="button"
                        onClick={() => onMarkReceived(item.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[var(--leaf)] hover:bg-[var(--forest)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Confirm Food Receipt</span>
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-bold text-[var(--leaf)] bg-[var(--leaf-soft)] rounded-xl">
                        ✓ Recovered & Delivered
                      </div>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => onAnalyzeFood(item)}
                        className="text-[var(--leaf)] hover:underline flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                      >
                        <Sparkles className="w-3 h-3 text-[var(--gold)]" />
                        <span>View AI Diagnostics</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewJourney(item)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <Clock className="w-3 h-3" />
                        <span>View Journey</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CREATE NEED MODAL */}
      <Modal
        isOpen={isNeedModalOpen}
        onClose={() => setIsNeedModalOpen(false)}
        title="Post NGO Food Need / Demand"
        subtitle="Broadcast your shelter or kitchen requirement to local retailers and growers."
      >
        <form onSubmit={handleCreateNeedSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
              Food Item Needed *
            </label>
            <input
              type="text"
              required
              value={needForm.foodNeeded}
              onChange={(e) => setNeedForm({ ...needForm, foodNeeded: e.target.value })}
              placeholder="e.g. Rice, Fresh Vegetables, Bread"
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Category
              </label>
              <select
                value={needForm.category}
                onChange={(e) => setNeedForm({ ...needForm, category: e.target.value as FoodCategory })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Bakery">Bakery</option>
                <option value="Dairy">Dairy</option>
                <option value="Prepared Food">Prepared Food</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Quantity Needed
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={needForm.quantity}
                  onChange={(e) => setNeedForm({ ...needForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                />
                <select
                  value={needForm.unit}
                  onChange={(e) => setNeedForm({ ...needForm, unit: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="portions">portions</option>
                  <option value="loaves">loaves</option>
                  <option value="boxes">boxes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Required By
              </label>
              <input
                type="text"
                value={needForm.requiredBy}
                onChange={(e) => setNeedForm({ ...needForm, requiredBy: e.target.value })}
                placeholder="e.g. Tomorrow, 10:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1 font-heading">
                Priority
              </label>
              <select
                value={needForm.priority}
                onChange={(e) =>
                  setNeedForm({ ...needForm, priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' })
                }
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[var(--text-main)] font-heading">
                Dietary & Program Notes
              </label>
              <VoiceInput
                buttonSize="sm"
                label="Voice Note"
                onTranscript={(transcript) => {
                  setNeedForm((prev) => ({
                    ...prev,
                    description: prev.description ? `${prev.description} ${transcript}` : transcript,
                  }));
                }}
              />
            </div>
            <textarea
              rows={3}
              value={needForm.description}
              onChange={(e) => setNeedForm({ ...needForm, description: e.target.value })}
              placeholder="e.g. Needed for evening hot dinner program serving 80 shelter residents..."
              className="w-full p-2.5 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setIsNeedModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--sage-light)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Broadcast Need to Suppliers
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
