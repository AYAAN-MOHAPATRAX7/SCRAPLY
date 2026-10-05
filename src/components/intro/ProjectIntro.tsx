import React from 'react';
import {
  ArrowRight,
  Brain,
  Leaf,
  ScanSearch,
  TrendingDown,
  Recycle,
  Sparkles,
  Camera,
  Clock3,
  Route,
} from 'lucide-react';

interface ProjectIntroProps {
  onEnter: () => void;
}

export const ProjectIntro: React.FC<ProjectIntroProps> = ({
  onEnter,
}) => {
  const scrollToFeatures = () => {
    document
      .getElementById('scraply-features')
      ?.scrollIntoView({
        behavior: 'smooth',
      });
  };

  const scrollToHowItWorks = () => {
    document
      .getElementById('scraply-how-it-works')
      ?.scrollIntoView({
        behavior: 'smooth',
      });
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--bg-app)] text-[var(--text-main)]">

      {/* ================================================================
          HERO
      ================================================================ */}

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14">

        <div className="relative overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-white/55 dark:bg-white/5 backdrop-blur-xl shadow-sm">

          {/* Decorative glow */}

          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--gold)]/10 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[var(--leaf)]/10 blur-3xl pointer-events-none" />

          <div className="relative px-6 sm:px-10 lg:px-16 py-12 sm:py-14 text-center">

            {/* Gemma badge */}

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--leaf-soft)] text-[var(--leaf)] border border-[var(--leaf)]/20 text-[10px] font-bold uppercase tracking-wider">

              <Sparkles className="w-3.5 h-3.5" />

              Powered by Gemma 4

            </div>

            {/* Main heading */}

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--forest)] dark:text-[var(--text-main)] font-heading">

              Turn Surplus Into Recovery.

            </h1>

            {/* Subtitle */}

            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-[var(--text-muted)]">

              SCRAPLY uses multimodal AI to understand surplus food,
              estimate freshness and urgency, and identify the best
              recovery pathway before valuable food becomes waste.

            </p>

            {/* Buttons */}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

              <button
                type="button"
                onClick={onEnter}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--forest)] text-[#F5F1E8] text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
              >

                Explore SCRAPLY

                <ArrowRight className="w-4 h-4" />

              </button>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/70 dark:bg-white/10 border border-[var(--border-subtle)] text-[var(--text-main)] text-sm font-semibold hover:bg-white dark:hover:bg-white/15 transition-all cursor-pointer"
              >

                How It Works

              </button>

              <button
                type="button"
                onClick={() => {
                  onEnter();
                  setTimeout(() => {
                    const analyzer =
                      document.getElementById(
                        'ai-analyzer'
                      );

                    analyzer?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }, 100);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--leaf-soft)] text-[var(--leaf)] border border-[var(--leaf)]/20 text-sm font-semibold hover:bg-[var(--leaf-soft)]/80 transition-all cursor-pointer"
              >

                <ScanSearch className="w-4 h-4" />

                Analyze Food

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================
          WHY SCRAPLY
      ================================================================ */}

      <section
        id="scraply-features"
        className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-14"
      >

        <div className="text-center mb-7">

          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold)]">
            Why SCRAPLY?
          </p>

          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--forest)] dark:text-[var(--text-main)] font-heading">
            Intelligence before waste.
          </h2>

          <div className="mx-auto mt-3 w-10 h-0.5 rounded-full bg-[var(--gold)]" />

        </div>


        <div className="grid md:grid-cols-3 gap-4">

          {/* FEATURE 1 */}

          <div className="group rounded-2xl border border-[var(--glass-border)] bg-white/50 dark:bg-white/5 backdrop-blur-xl p-5 hover:-translate-y-1 hover:shadow-md transition-all">

            <div className="w-10 h-10 rounded-xl bg-[var(--leaf-soft)] flex items-center justify-center">

              <Brain className="w-5 h-5 text-[var(--leaf)]" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-[var(--text-main)]">
              Food Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Understand food condition from images and context
              using multimodal AI instead of relying only on
              manual inspection.
            </p>

          </div>


          {/* FEATURE 2 */}

          <div className="group rounded-2xl border border-[var(--glass-border)] bg-white/50 dark:bg-white/5 backdrop-blur-xl p-5 hover:-translate-y-1 hover:shadow-md transition-all">

            <div className="w-10 h-10 rounded-xl bg-[#F5EAC8]/60 flex items-center justify-center">

              <TrendingDown className="w-5 h-5 text-[var(--gold)]" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-[var(--text-main)]">
              Risk & Freshness
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Estimate freshness, urgency and potential value
              decay to understand why acting now can matter.
            </p>

          </div>


          {/* FEATURE 3 */}

          <div className="group rounded-2xl border border-[var(--glass-border)] bg-white/50 dark:bg-white/5 backdrop-blur-xl p-5 hover:-translate-y-1 hover:shadow-md transition-all">

            <div className="w-10 h-10 rounded-xl bg-[var(--leaf-soft)] flex items-center justify-center">

              <Route className="w-5 h-5 text-[var(--leaf)]" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-[var(--text-main)]">
              Recovery Decisions
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Identify the most suitable next pathway — from
              selling and storing to processing, donating or
              recovering.
            </p>

          </div>

        </div>

      </section>


      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}

      <section
        id="scraply-how-it-works"
        className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-14"
      >

        <div className="text-center mb-7">

          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold)]">
            How It Works
          </p>

          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--forest)] dark:text-[var(--text-main)] font-heading">
            From food to action.
          </h2>

          <div className="mx-auto mt-3 w-10 h-0.5 rounded-full bg-[var(--gold)]" />

        </div>


        <div className="grid md:grid-cols-3 gap-4">

          {/* STEP 1 */}

          <div className="relative rounded-2xl border border-[var(--glass-border)] bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5">

            <div className="flex items-center justify-between">

              <div className="w-10 h-10 rounded-xl bg-[var(--forest)] flex items-center justify-center">

                <Camera className="w-5 h-5 text-[var(--light-gold)]" />

              </div>

              <span className="text-3xl font-extrabold text-[var(--sage-light)]">
                01
              </span>

            </div>

            <h3 className="mt-4 text-sm font-bold">
              Analyze
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Upload food information or an image. Gemma 4
              interprets the available visual and contextual
              signals.
            </p>

          </div>


          {/* STEP 2 */}

          <div className="relative rounded-2xl border border-[var(--glass-border)] bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5">

            <div className="flex items-center justify-between">

              <div className="w-10 h-10 rounded-xl bg-[var(--forest)] flex items-center justify-center">

                <Clock3 className="w-5 h-5 text-[var(--light-gold)]" />

              </div>

              <span className="text-3xl font-extrabold text-[var(--sage-light)]">
                02
              </span>

            </div>

            <h3 className="mt-4 text-sm font-bold">
              Understand
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              SCRAPLY estimates freshness, urgency, risk and
              how waiting could affect the recovery value.
            </p>

          </div>


          {/* STEP 3 */}

          <div className="relative rounded-2xl border border-[var(--glass-border)] bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5">

            <div className="flex items-center justify-between">

              <div className="w-10 h-10 rounded-xl bg-[var(--forest)] flex items-center justify-center">

                <Recycle className="w-5 h-5 text-[var(--light-gold)]" />

              </div>

              <span className="text-3xl font-extrabold text-[var(--sage-light)]">
                03
              </span>

            </div>

            <h3 className="mt-4 text-sm font-bold">
              Recover
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Choose a suitable recovery pathway and connect
              the surplus food to the next step.
            </p>

          </div>

        </div>

      </section>


      {/* ================================================================
          CORE IDEA / DIFFERENTIATOR
      ================================================================ */}

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12">

        <div className="rounded-2xl bg-[var(--forest)] overflow-hidden relative">

          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[var(--gold)]/10 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[var(--leaf)]/10 blur-3xl" />

          <div className="relative px-6 sm:px-10 py-8 sm:py-9">

            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">

              <div>

                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--light-gold)]">

                  <Leaf className="w-3.5 h-3.5" />

                  The SCRAPLY Principle

                </div>

                <h2 className="mt-3 text-xl sm:text-2xl font-bold text-[#F5F1E8]">
                  Recover value before it becomes waste.
                </h2>

                <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-[#F5F1E8]/65">
                  SCRAPLY does more than identify surplus food.
                  It helps answer the important question:
                  <span className="text-[#E4C978] font-semibold">
                    {' '}
                    “What should happen next?”
                  </span>
                </p>

              </div>


              <button
                type="button"
                onClick={onEnter}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F5F1E8] text-[var(--forest)] text-sm font-bold hover:bg-white hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              >

                Enter SCRAPLY

                <ArrowRight className="w-4 h-4" />

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================
          FOOTER
      ================================================================ */}

      <footer className="max-w-6xl mx-auto px-5 sm:px-8 py-8">

        <div className="border-t border-[var(--glass-border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">

          <div className="flex items-center gap-2">

            <div className="w-7 h-7 rounded-lg bg-[var(--forest)] flex items-center justify-center">

              <Leaf className="w-3.5 h-3.5 text-[var(--light-gold)]" />

            </div>

            <span className="text-xs font-bold text-[var(--forest)] dark:text-[var(--text-main)]">
              SCRAPLY
            </span>

          </div>

          <p className="text-[10px] text-[var(--text-muted)]">
            Food Intelligence & Recovery • Powered by Gemma 4
          </p>

        </div>

      </footer>

    </div>
  );
};