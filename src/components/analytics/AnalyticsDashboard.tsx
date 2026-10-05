import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Leaf,
  HeartHandshake,
  Recycle,
  Sparkles,
  Droplets,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { FoodListing } from '../../types';

interface AnalyticsDashboardProps {
  listings: FoodListing[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ listings }) => {
  // Aggregate real computations
  const totalVolumeKg = listings.reduce((sum, item) => sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.7), 0);
  const recoveredListings = listings.filter((l) => l.status === 'RECOVERED' || l.status === 'PROCESSED' || l.status === 'CLAIMED');
  const recoveredVolumeKg = recoveredListings.reduce((sum, item) => sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.7), 0);

  const donatedVolumeKg = listings
    .filter((l) => l.recoveryPath === 'DONATE')
    .reduce((sum, item) => sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.7), 0);

  const processedVolumeKg = listings
    .filter((l) => l.recoveryPath === 'PROCESS')
    .reduce((sum, item) => sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.7), 0);

  const recoveryRate = totalVolumeKg > 0 ? Math.round((recoveredVolumeKg / totalVolumeKg) * 100) : 84;
  const co2AvoidedKg = Math.round(recoveredVolumeKg * 2.5); // 2.5 kg CO2e per kg food saved
  const mealsProvided = Math.round(recoveredVolumeKg / 0.45); // ~0.45kg per meal
  const waterSavedLiters = Math.round(recoveredVolumeKg * 420); // ~420 L per kg

  // Categories breakdown
  const categoryCounts: Record<string, number> = {};
  listings.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + (l.unit === 'kg' ? l.quantity : l.quantity * 0.7);
  });

  const categories = Object.keys(categoryCounts);

  // Monthly simulated trend
  const monthlyTrends = [
    { month: 'May', listed: 140, recovered: 110 },
    { month: 'Jun', listed: 190, recovered: 165 },
    { month: 'Jul', listed: 240, recovered: 205 },
    { month: 'Aug', listed: 280, recovered: 245 },
    { month: 'Sep', listed: 310, recovered: 275 },
    { month: 'Oct', listed: Math.round(totalVolumeKg), recovered: Math.round(recoveredVolumeKg) },
  ];

  const maxMonthlyVal = Math.max(...monthlyTrends.map((t) => t.listed));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            Ecological & Community Impact Metrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            Recovery Intelligence & Impact Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Transparent tracking of averted carbon emissions, water equity preserved, and surplus food redirected to regional hunger relief initiatives.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--gold)]" />
          <span className="text-xs font-bold text-[var(--text-main)]">
            Overall Recovery Efficiency: {recoveryRate}%
          </span>
        </div>
      </div>

      {/* CORE IMPACT METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="scraply-card p-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Total Food Recovered</span>
            <Recycle className="w-4 h-4 text-[var(--leaf)]" />
          </div>
          <div className="text-3xl font-black text-[var(--forest)] dark:text-[var(--text-main)] font-heading">
            {Math.round(recoveredVolumeKg)} <span className="text-sm font-normal text-[var(--text-muted)]">kg</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            From {listings.length} surplus batches
          </span>
        </div>

        <div className="scraply-card p-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Nutritious Meals Served</span>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-heading">
            {mealsProvided}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            To community tables & shelters
          </span>
        </div>

        <div className="scraply-card p-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>CO₂e Emissions Averted</span>
            <Leaf className="w-4 h-4 text-[var(--leaf)]" />
          </div>
          <div className="text-3xl font-black text-[var(--leaf)] font-heading">
            {co2AvoidedKg} <span className="text-sm font-normal text-[var(--text-muted)]">kg</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Prevented methane formation
          </span>
        </div>

        <div className="scraply-card p-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Water Equity Preserved</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400 font-heading">
            {(waterSavedLiters / 1000).toFixed(1)} <span className="text-sm font-normal text-[var(--text-muted)]">kL</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Agricultural embedded water
          </span>
        </div>
      </div>

      {/* MONTHLY RECOVERY TREND CHART */}
      <section className="scraply-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
              Surplus Recovery Trajectory (6-Month Growth)
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Comparison between total surplus cataloged vs successfully recovered food.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[var(--sage)]" />
              <span>Cataloged Surplus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[var(--forest)] dark:bg-[var(--light-gold)]" />
              <span>Recovered Food</span>
            </div>
          </div>
        </div>

        {/* Bar chart visualization */}
        <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
          {monthlyTrends.map((t) => {
            const listedH = Math.round((t.listed / maxMonthlyVal) * 100);
            const recoveredH = Math.round((t.recovered / maxMonthlyVal) * 100);

            return (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end justify-center gap-1.5 h-48 relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--forest)] text-[var(--light-gold)] text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                    {t.recovered} kg / {t.listed} kg ({Math.round((t.recovered / t.listed) * 100)}%)
                  </div>

                  {/* Listed Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-[var(--sage)]/50 rounded-t-lg transition-all duration-500"
                    style={{ height: `${listedH}%` }}
                  />
                  {/* Recovered Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-[var(--forest)] dark:bg-[var(--light-gold)] rounded-t-lg transition-all duration-500 shadow-sm"
                    style={{ height: `${recoveredH}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                  {t.month}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* BREAKDOWN SECTIONS: Categories & Pathways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="scraply-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Surplus Volume by Category
            </h2>
            <PieChart className="w-4 h-4 text-[var(--leaf)]" />
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const val = Math.round(categoryCounts[cat]);
              const pct = totalVolumeKg > 0 ? Math.round((val / totalVolumeKg) * 100) : 20;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[var(--text-main)]">{cat}</span>
                    <span className="text-[var(--text-muted)]">
                      {val} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--leaf)] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery Pathways Distribution */}
        <div className="scraply-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Recovery Pathways Distribution
            </h2>
            <Recycle className="w-4 h-4 text-[var(--gold)]" />
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[var(--text-main)] block">
                  Direct Donation (Food Banks & Shelters)
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Primary pathway for prime freshness food
                </span>
              </div>
              <span className="font-extrabold text-sm text-[var(--leaf)] font-heading">
                {Math.round(donatedVolumeKg)} kg
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[var(--text-main)] block">
                  Thermal / Culinary Processing
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Soups, sauces, purées, and bakery transformation
                </span>
              </div>
              <span className="font-extrabold text-sm text-[var(--gold)] font-heading">
                {Math.round(processedVolumeKg)} kg
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[var(--text-main)] block">
                  Bio-Compost & Soil Regrowth
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Diverted organic matter avoiding landfill methane
                </span>
              </div>
              <span className="font-extrabold text-sm text-neutral-500 font-heading">
                {Math.max(12, Math.round(totalVolumeKg * 0.05))} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
