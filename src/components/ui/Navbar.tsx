import React, { useState } from 'react';
import {
  Sparkles,
  Store,
  Tractor,
  Users,
  Clock,
  LayoutDashboard,
  Menu,
  X,
  User,
  Leaf,
} from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';
import { NotificationPanel } from './NotificationPanel';

import {
  NotificationItem,
  Theme,
  UserProfile,
} from '../../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;

  theme: Theme;
  onToggleTheme: () => void;

  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;

  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;

  userProfile: UserProfile;

  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onToggleTheme,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenCommandPalette,
  onOpenSettings,
  userProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /*
   * IMPORTANT:
   * Analytics is intentionally NOT included here.
   *
   * Main navigation:
   * Dashboard
   * AI Analyzer
   * Retailer
   * Farmer
   * NGO Network
   * Journeys
   *
   * Analytics is opened through Actions.
   */

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'analyzer',
      label: 'AI Analyzer',
      icon: Sparkles,
      badge: 'Gemma 4',
    },
    {
      id: 'retailer',
      label: 'Retailer',
      icon: Store,
    },
    {
      id: 'farmer',
      label: 'Farmer',
      icon: Tractor,
    },
    {
      id: 'ngo',
      label: 'NGO Network',
      icon: Users,
    },
    {
      id: 'journeys',
      label: 'Journeys',
      icon: Clock,
    },
  ];

  const role = String(
    (userProfile as UserProfile & { role?: string }).role || ''
  )
    .trim()
    .toLowerCase();

  const canOpenTab = (tabId: string) => {
    if (role === 'admin') return true;

    if (tabId === 'farmer') {
      return role === 'farmer';
    }

    if (tabId === 'retailer') {
      return role === 'retailer';
    }

    if (tabId === 'ngo') {
      return role === 'ngo';
    }

    return true;
  };

  const handleSelectTab = (tabId: string) => {
    if (!canOpenTab(tabId)) return;

    setMobileMenuOpen(false);

    onSelectTab(tabId);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleOpenAbout = () => {
    setMobileMenuOpen(false);

    onSelectTab('about');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleOpenActions = () => {
    setMobileMenuOpen(false);
    onOpenCommandPalette();
  };

  const displayName =
    userProfile.name?.trim() || 'SCRAPLY User';

  const organization =
    userProfile.organization?.trim() || 'SCRAPLY';

  const profileInitial =
    organization.charAt(0).toUpperCase() || 'S';

  return (
    <header className="sticky top-0 z-[100] w-full">
      <div className="w-full px-3 sm:px-4 lg:px-5 pt-2 box-border">
        {/*
          IMPORTANT:
          overflow-visible is required because the notification
          dropdown extends outside the navbar.
        */}
        <div
          className="
            relative
            w-full
            max-w-full
            min-h-[68px]
            rounded-2xl
            border
            border-[var(--glass-border)]
            bg-[var(--surface)]
            backdrop-blur-xl
            shadow-[0_4px_24px_rgba(24,60,43,0.06)]
            overflow-visible
            box-border
          "
        >
          <div
            className="
              w-full
              min-h-[68px]
              px-3
              sm:px-4
              lg:px-5
              flex
              items-center
              gap-2
              box-border
              min-w-0
            "
          >
            {/* =====================================================
                BRAND
            ====================================================== */}

            <button
              type="button"
              onClick={handleOpenAbout}
              aria-label="About SCRAPLY"
              className="
                flex
                items-center
                gap-2.5
                shrink-0
                cursor-pointer
                text-left
                mr-1
                lg:mr-3
                group
              "
            >
              <div
                className="
                  w-11
                  h-11
                  rounded-[15px]
                  bg-[var(--forest)]
                  flex
                  items-center
                  justify-center
                  shadow-[0_4px_12px_rgba(24,60,43,0.18)]
                  group-hover:scale-[1.04]
                  transition-all
                  shrink-0
                "
              >
                <Leaf
                  className="
                    w-[21px]
                    h-[21px]
                    text-[#E4C978]
                  "
                />
              </div>

              <div className="hidden sm:block shrink-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span
                    className="
                      text-[19px]
                      font-extrabold
                      tracking-[-0.03em]
                      text-[var(--forest)]
                      font-heading
                    "
                  >
                    SCRAPLY
                  </span>

                  <span
                    className="
                      px-1.5
                      py-1
                      rounded-md
                      bg-[var(--leaf-soft)]
                      text-[var(--leaf)]
                      border
                      border-[var(--leaf)]/15
                      text-[9px]
                      font-extrabold
                    "
                  >
                    AI
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-none
                    text-[var(--text-muted)]
                    font-medium
                    whitespace-nowrap
                  "
                >
                  Food Intelligence & Recovery
                </p>
              </div>
            </button>

            {/* =====================================================
                DESKTOP NAVIGATION
            ====================================================== */}

            <nav
              className="
                hidden
                xl:flex
                items-center
                justify-center
                gap-1
                flex-1
                min-w-0
              "
              aria-label="Main Navigation"
            >
              {navItems.map((item) => {
                if (!canOpenTab(item.id)) return null;

                const Icon = item.icon;
                const active = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`
                      relative
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      px-2.5
                      2xl:px-3
                      py-2.5
                      rounded-xl
                      text-[11px]
                      2xl:text-[12px]
                      font-semibold
                      whitespace-nowrap
                      transition-all
                      duration-200
                      cursor-pointer
                      shrink-0

                      ${
                        active
                          ? `
                            bg-[var(--forest)]
                            text-[#F5F1E8]
                            shadow-[0_3px_10px_rgba(24,60,43,0.16)]
                          `
                          : `
                            text-[var(--text-muted)]
                            hover:text-[var(--text-main)]
                            hover:bg-[var(--sage-light)]
                          `
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-[13px]
                        h-[13px]
                        shrink-0

                        ${
                          active
                            ? 'text-[#E4C978]'
                            : 'text-[var(--text-muted)]'
                        }
                      `}
                    />

                    <span>{item.label}</span>

                    {item.badge && (
                      <span
                        className={`
                          ml-0.5
                          px-1.5
                          py-0.5
                          rounded-full
                          text-[7px]
                          2xl:text-[8px]
                          leading-none
                          font-extrabold
                          uppercase

                          ${
                            active
                              ? `
                                bg-[#E4C978]
                                text-[var(--forest)]
                              `
                              : `
                                bg-[var(--leaf-soft)]
                                text-[var(--leaf)]
                              `
                          }
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* =====================================================
                RIGHT CONTROLS
            ====================================================== */}

            <div
              className="
                ml-auto
                flex
                items-center
                gap-1
                sm:gap-1.5
                shrink-0
              "
            >
              {/* ACTIONS */}

              <button
                type="button"
                onClick={handleOpenActions}
                className="
                  hidden
                  md:flex
                  items-center
                  justify-center
                  gap-2
                  h-11
                  px-3
                  lg:px-4
                  rounded-xl
                  bg-[var(--surface)]
                  border
                  border-[var(--border-subtle)]
                  text-[var(--text-main)]
                  shadow-sm
                  hover:bg-[var(--sage-light)]
                  hover:border-[var(--leaf)]/20
                  hover:-translate-y-[1px]
                  transition-all
                  cursor-pointer
                  shrink-0
                "
              >
                <Sparkles
                  className="
                    w-4
                    h-4
                    text-[var(--gold)]
                  "
                />

                <span className="text-xs font-bold">
                  Actions
                </span>
              </button>

              {/* =================================================
                  NOTIFICATIONS
              ================================================== */}

              <div
                className="
                  relative
                  h-11
                  w-11
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--border-subtle)]
                  bg-[var(--surface)]
                  shadow-sm
                  hover:bg-[var(--sage-light)]
                  transition-all
                  shrink-0
                  z-[200]
                "
              >
                <NotificationPanel
                  notifications={notifications}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAllAsRead={onMarkAllAsRead}
                  onNavigateToTab={handleSelectTab}
                />
              </div>

              {/* =================================================
                  THEME
              ================================================== */}

              <div
                className="
                  h-11
                  w-11
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--border-subtle)]
                  bg-[var(--surface)]
                  shadow-sm
                  hover:bg-[var(--sage-light)]
                  transition-all
                  shrink-0
                "
              >
                <ThemeToggle
                  theme={theme}
                  onToggle={onToggleTheme}
                />
              </div>

              {/* =================================================
                  PROFILE
              ================================================== */}

              <button
                type="button"
                onClick={onOpenSettings}
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  h-11
                  ml-0.5
                  pl-1.5
                  pr-2
                  lg:pr-3
                  rounded-xl
                  border
                  border-[var(--border-subtle)]
                  bg-[var(--surface)]
                  shadow-sm
                  hover:bg-[var(--sage-light)]
                  hover:border-[var(--leaf)]/15
                  transition-all
                  cursor-pointer
                  text-left
                  shrink-0
                  max-w-[180px]
                "
              >
                <div
                  className="
                    w-8
                    h-8
                    rounded-[10px]
                    bg-[var(--forest)]
                    text-[#E4C978]
                    flex
                    items-center
                    justify-center
                    font-extrabold
                    text-xs
                    shrink-0
                  "
                >
                  {profileInitial}
                </div>

                <div
                  className="
                    min-w-0
                    hidden
                    lg:block
                  "
                >
                  <p
                    className="
                      text-[10px]
                      2xl:text-[11px]
                      font-bold
                      leading-tight
                      text-[var(--text-main)]
                      truncate
                    "
                  >
                    {displayName}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[8px]
                      2xl:text-[9px]
                      leading-tight
                      text-[var(--text-muted)]
                      capitalize
                    "
                  >
                    {role || 'User'}
                  </p>
                </div>
              </button>

              {/* =================================================
                  MOBILE MENU BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((prev) => !prev)
                }
                aria-label="Toggle navigation"
                className="
                  xl:hidden
                  h-11
                  w-11
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--border-subtle)]
                  bg-[var(--surface)]
                  text-[var(--text-main)]
                  shadow-sm
                  hover:bg-[var(--sage-light)]
                  transition-all
                  cursor-pointer
                  shrink-0
                "
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            MOBILE MENU
        ========================================================== */}

        {mobileMenuOpen && (
          <div
            className="
              xl:hidden
              mt-2
              rounded-2xl
              border
              border-[var(--glass-border)]
              bg-[var(--surface)]
              backdrop-blur-xl
              shadow-lg
              p-3
              relative
              z-[150]
            "
          >
            {/* ABOUT */}

            <button
              type="button"
              onClick={handleOpenAbout}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-xs
                font-semibold
                text-[var(--text-main)]
                hover:bg-[var(--sage-light)]
                transition-all
                cursor-pointer
              "
            >
              <Leaf
                className="
                  w-4
                  h-4
                  text-[var(--leaf)]
                "
              />

              About SCRAPLY
            </button>

            {/* ACTIONS */}

            <button
              type="button"
              onClick={handleOpenActions}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-xs
                font-semibold
                text-[var(--text-main)]
                hover:bg-[var(--sage-light)]
                transition-all
                cursor-pointer
              "
            >
              <Sparkles
                className="
                  w-4
                  h-4
                  text-[var(--gold)]
                "
              />

              Actions
            </button>

            <div
              className="
                h-px
                bg-[var(--glass-border)]
                my-2
              "
            />

            {/* NAVIGATION */}

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                if (!canOpenTab(item.id)) return null;

                const Icon = item.icon;
                const active = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleSelectTab(item.id)
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      px-3
                      py-3
                      rounded-xl
                      text-xs
                      font-semibold
                      transition-all
                      cursor-pointer

                      ${
                        active
                          ? `
                            bg-[var(--forest)]
                            text-[#F5F1E8]
                          `
                          : `
                            text-[var(--text-main)]
                            hover:bg-[var(--sage-light)]
                          `
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-4
                        h-4

                        ${
                          active
                            ? 'text-[#E4C978]'
                            : 'text-[var(--leaf)]'
                        }
                      `}
                    />

                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* MOBILE PROFILE */}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="
                mt-2
                w-full
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                border
                border-[var(--border-subtle)]
                bg-[var(--surface)]
                text-left
                cursor-pointer
              "
            >
              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-[var(--forest)]
                  text-[#E4C978]
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-xs
                "
              >
                {profileInitial}
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    font-bold
                    truncate
                    text-[var(--text-main)]
                  "
                >
                  {displayName}
                </p>

                <p
                  className="
                    text-[10px]
                    text-[var(--text-muted)]
                    capitalize
                  "
                >
                  {role || 'User'}
                </p>
              </div>

              <User
                className="
                  w-4
                  h-4
                  ml-auto
                  text-[var(--text-muted)]
                "
              />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};