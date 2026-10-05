import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ImagePlus,
  Leaf,
  MapPin,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

type HarvestGuardResult = {
  food?: string;
  quantity?: number;
  unit?: string;
  recommended_action?: string;
  urgency?: string;
  suggested_discount_percent?: number | null;
  suggested_price?: number | null;
  currency?: string;
  remaining_shelf_life_days?: number | null;
  reason?: string;
  confidence?: number;
  missing_information?: string[];
  additional_notes?: string[];
  freshness?: number;
  risk?: string;
  recommendedAction?: string;
  recoveryPath?: string;
  scenarios?: Array<{
    timeLabel: string;
    hours: number;
    freshness: number;
    risk: string;
    recommendation: string;
    viableForHuman: boolean;
  }>;
  safetyNote?: string;
  observations?: string;
  reasoning?: string;
};

interface HarvestGuardDashboardProps {
  onOpenMap: () => void;
  onAddListing?: (listing: any) => void;
}

const API_CANDIDATES = [
  'http://localhost:8000',
  'http://localhost:3000',
];

export const HarvestGuardDashboard: React.FC<HarvestGuardDashboardProps> = ({
  onOpenMap,
  onAddListing,
}) => {
  const [food, setFood] = useState('Tomatoes');
  const [quantity, setQuantity] = useState('50');
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HarvestGuardResult | null>(null);
  const [error, setError] = useState('');

  const urgency = result?.urgency || result?.risk || '—';
  const action = result?.recommended_action || result?.recommendedAction || '—';
  const confidence = result?.confidence != null
    ? Math.round(result.confidence <= 1 ? result.confidence * 100 : result.confidence)
    : null;

  const scenarioRows = useMemo(() => {
    if (result?.scenarios?.length) return result.scenarios;
    return [];
  }, [result]);

  const handleImage = (file?: File) => {
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    let lastError = 'HarvestGuard service is unavailable.';

    for (const base of API_CANDIDATES) {
      try {
        const form = new FormData();
        form.append('food', food);
        form.append('quantity', quantity);
        form.append('unit', unit);
        form.append('location', location);
        form.append('current_price', price || '');
        form.append('description', description);
        form.append('language', 'en');
        if (image) form.append('image', image);

        const response = await fetch(`${base}/api/harvestguard/analyze`, {
          method: 'POST',
          body: form,
        });

        if (!response.ok) {
          lastError = `HarvestGuard returned HTTP ${response.status}.`;
          continue;
        }

        const payload = await response.json();

        if (payload?.success && payload?.data) {
          setResult(payload.data);
          setLoading(false);
          return;
        }

        lastError = payload?.error?.message || 'HarvestGuard could not analyze this item.';
      } catch {
        // Try the next local API candidate.
      }
    }

    // The main SCRAPLY Node server already has a Gemma/fallback food analyzer.
    // Use it as a resilient fallback so the UI remains usable during demo setup.
    try {
      const response = await fetch('http://localhost:3000/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: food,
          quantity,
          unit,
          storageCondition: 'Ambient / farmer storage',
          voiceText: description,
          category: 'Produce',
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.success && payload?.data) {
          setResult(payload.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to the visible error.
    }

    setError(`${lastError} Start the HarvestGuard API on port 8000 or the SCRAPLY server on port 3000.`);
    setLoading(false);
  };

  const addToRecovery = () => {
    if (!result || !onAddListing) return;

    const normalizedAction = String(
      result.recommended_action || result.recommendedAction || result.recoveryPath || 'DONATE'
    ).toUpperCase();

    const mappedRecovery =
      normalizedAction === 'SELL' ? 'DISCOUNT_RETAIL' :
      normalizedAction === 'DISCOUNT' ? 'DISCOUNT_RETAIL' :
      normalizedAction === 'STORE' ? 'DONATE' :
      normalizedAction === 'PROCESS' ? 'PROCESS' :
      normalizedAction === 'RECOVER' ? 'DONATE' :
      'DONATE';

    onAddListing({
      foodName: result.food || food,
      category: 'Fruits',
      quantity: result.quantity || Number(quantity) || 10,
      unit: result.unit || unit,
      estimatedFreshness: result.freshness ?? 75,
      risk: result.risk || result.urgency || 'MEDIUM',
      urgency: result.urgency || 'MEDIUM',
      recommendedAction: result.recommendedAction || result.reason || `HarvestGuard recommends ${normalizedAction}`,
      recoveryPath: mappedRecovery,
      location: location || 'Farmer origin',
      aiAnalysis: result.reason || result.observations || 'HarvestGuard AI analysis completed.',
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-[28px] bg-[var(--forest)] text-white p-7 md:p-9 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E4C978]/20 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-[#E4C978]" />
              HARVESTGUARD • Gemma-powered decision support
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Decide what to do with surplus before its value drops.
            </h1>
            <p className="mt-3 text-sm md:text-base leading-7 text-white/70">
              Give HarvestGuard the crop, quantity, market context and condition.
              It recommends a practical pathway such as SELL, STORE, DONATE, PROCESS or RECOVER.
            </p>
          </div>

          <button
            onClick={onOpenMap}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[var(--forest)] px-5 py-3 font-semibold hover:bg-[#F5F1E8] transition"
          >
            Open Smart Map
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <section className="rounded-[26px] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-[var(--leaf-soft)] flex items-center justify-center">
              <Leaf className="h-5 w-5 text-[var(--leaf)]" />
            </div>
            <div>
              <h2 className="font-bold">Surplus details</h2>
              <p className="text-xs text-[var(--text-muted)]">More context = better recommendations</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Food / crop">
              <input value={food} onChange={e => setFood(e.target.value)} className="input" placeholder="Tomatoes" />
            </Field>
            <Field label="Quantity">
              <input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="input" />
            </Field>
            <Field label="Unit">
              <select value={unit} onChange={e => setUnit(e.target.value)} className="input">
                <option>kg</option>
                <option>tonnes</option>
                <option>boxes</option>
                <option>pieces</option>
              </select>
            </Field>
            <Field label="Current price (INR / unit)">
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="input" placeholder="Optional" />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <input value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="Farm / storage location" />
            </Field>
            <Field label="Condition / market notes" className="sm:col-span-2">
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="input min-h-28 resize-none" placeholder="Example: slightly soft, market price falling, 2 days since harvest..." />
            </Field>
          </div>

          <label className="mt-4 flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[var(--glass-border)] bg-[var(--surface-hover)]/50 overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="Selected food" className="h-28 w-full object-cover" />
            ) : (
              <div className="text-center">
                <ImagePlus className="mx-auto h-6 w-6 text-[var(--leaf)]" />
                <p className="mt-2 text-sm font-semibold">Add crop image</p>
                <p className="text-xs text-[var(--text-muted)]">Optional multimodal signal</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files?.[0])} />
          </label>

          <button
            onClick={analyze}
            disabled={loading || !food.trim()}
            className="mt-5 w-full rounded-2xl bg-[var(--forest)] text-white py-3.5 font-bold disabled:opacity-50"
          >
            {loading ? 'Analyzing with Gemma…' : 'Analyze with HarvestGuard'}
          </button>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-[26px] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-sm min-h-[520px]">
          {!result ? (
            <div className="h-full min-h-[470px] flex items-center justify-center text-center">
              <div className="max-w-sm">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-[var(--leaf-soft)] flex items-center justify-center">
                  <Brain className="h-8 w-8 text-[var(--leaf)]" />
                </div>
                <h2 className="mt-5 text-xl font-bold">Your recovery decision will appear here</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  HarvestGuard combines food context, time, market information and available visual signals.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">HarvestGuard recommendation</p>
                  <h2 className="mt-1 text-3xl font-bold text-[var(--forest)]">{action}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{result.food || food}</p>
                </div>
                <div className="flex gap-2">
                  <Badge label={`Urgency: ${urgency}`} />
                  {confidence != null && <Badge label={`${confidence}% confidence`} />}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-6">
                <Metric label="Remaining shelf life" value={result.remaining_shelf_life_days != null ? `${result.remaining_shelf_life_days} days` : 'Context dependent'} />
                <Metric label="Suggested price" value={result.suggested_price != null ? `${result.currency || 'INR'} ${result.suggested_price}` : 'Not applicable'} />
                <Metric label="Discount" value={result.suggested_discount_percent != null ? `${result.suggested_discount_percent}%` : 'Not applicable'} />
              </div>

              <div className="mt-5 rounded-2xl bg-[var(--surface-hover)] p-5">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Why this decision?</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                      {result.reason || result.observations || result.reasoning || 'AI recommendation generated from the supplied context.'}
                    </p>
                  </div>
                </div>
              </div>

              {scenarioRows.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-[var(--leaf)]" />
                    <h3 className="font-bold">What if I wait?</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    {scenarioRows.map((row) => (
                      <div key={row.timeLabel} className="rounded-2xl border border-[var(--glass-border)] p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{row.timeLabel}</span>
                          <span className="text-sm text-[var(--leaf)]">{row.freshness}% freshness</span>
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">{row.risk} risk</p>
                        <p className="mt-2 text-sm leading-5">{row.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.safetyNote && (
                <p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">
                  {result.safetyNote}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {onAddListing && (
                  <button onClick={addToRecovery} className="inline-flex items-center gap-2 rounded-xl bg-[var(--forest)] px-4 py-3 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    Add to recovery pipeline
                  </button>
                )}
                <button onClick={onOpenMap} className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] px-4 py-3 text-sm font-semibold">
                  Find destination on Smart Map
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid var(--glass-border);
          background: var(--surface-hover);
          color: var(--text-main);
          padding: 11px 13px;
          outline: none;
        }
        .input:focus {
          border-color: var(--leaf);
          box-shadow: 0 0 0 3px rgba(79,125,85,.10);
        }
      `}</style>
    </div>
  );
};

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-hover)] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-[var(--leaf-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--forest)]">
      {label}
    </span>
  );
}
