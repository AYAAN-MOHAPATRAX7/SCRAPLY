import React, { useState, useEffect } from 'react';

import { Navbar } from './components/ui/Navbar';

import { CommandPalette } from './components/ui/CommandPalette';

import { ProfileSettingsModal } from './components/settings/ProfileSettingsModal';

import { ProjectIntro } from './components/intro/ProjectIntro';

import { MainDashboard } from './components/dashboard/MainDashboard';

import { AIFoodAnalyzer } from './components/analyzer/AIFoodAnalyzer';

import { RetailerDashboard } from './components/retailer/RetailerDashboard';

import { FarmerPortal } from './components/farmer/FarmerPortal';

import { NGOPortal } from './components/ngo/NGOPortal';

import { FoodJourneyView } from './components/journeys/FoodJourneyView';

import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import SmartMapDashboard from './components/matching/SmartMapDashboard.jsx';
import { HarvestGuardDashboard } from './components/harvestguard/HarvestGuardDashboard';

import {
  INITIAL_LISTINGS,
  INITIAL_NGO_NEEDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
} from './data/seedData';

import {
  FoodListing,
  JourneyStep,
  ListingStatus,
  NGONeed,
  NotificationItem,
  Theme,
  UserProfile,
} from './types';

type ScraplyRole = 'admin' | 'farmer' | 'retailer' | 'ngo';

export default function App() {
  // ============================================================
  // THEME
  // ============================================================

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('scraply_theme') as Theme | null;

    if (saved === 'dark' || saved === 'light') {
      return saved;
    }

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    localStorage.setItem('scraply_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // ============================================================
  // LISTINGS
  // ============================================================

  const [listings, setListings] = useState<FoodListing[]>(() => {
    const saved = localStorage.getItem('scraply_listings');

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved listings', e);
      }
    }

    return INITIAL_LISTINGS;
  });

  useEffect(() => {
    localStorage.setItem('scraply_listings', JSON.stringify(listings));
  }, [listings]);

  // ============================================================
  // NGO NEEDS
  // ============================================================

  const [ngoNeeds, setNgoNeeds] = useState<NGONeed[]>(() => {
    const saved = localStorage.getItem('scraply_ngo_needs');

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved needs', e);
      }
    }

    return INITIAL_NGO_NEEDS;
  });

  useEffect(() => {
    localStorage.setItem('scraply_ngo_needs', JSON.stringify(ngoNeeds));
  }, [ngoNeeds]);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    () => {
      const saved = localStorage.getItem('scraply_notifications');

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved notifications', e);
        }
      }

      return INITIAL_NOTIFICATIONS;
    }
  );

  useEffect(() => {
    localStorage.setItem(
      'scraply_notifications',
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // ============================================================
  // USER PROFILE
  // ============================================================

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('scraply_user_profile');

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }

    return INITIAL_USER_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem(
      'scraply_user_profile',
      JSON.stringify(userProfile)
    );
  }, [userProfile]);

  // ============================================================
  // NAVIGATION / UI STATE
  // ============================================================

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] =
    useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [analyzerPrefill, setAnalyzerPrefill] =
    useState<Partial<FoodListing> | null>(null);

  const [selectedJourneyId, setSelectedJourneyId] =
    useState<string | undefined>(undefined);

  // ============================================================
  // ROLE / PERMISSIONS
  // ============================================================

  const normalizedRole = String(
    (userProfile as UserProfile & { role?: string }).role || 'retailer'
  )
    .trim()
    .toLowerCase() as ScraplyRole;

  const isAdmin = normalizedRole === 'admin';
  const isFarmer = normalizedRole === 'farmer';
  const isRetailer = normalizedRole === 'retailer';
  const isNGO = normalizedRole === 'ngo';

  const organizationName = String(
    userProfile.organization || ''
  )
    .trim()
    .toLowerCase();

  // ============================================================
  // LISTING OWNERSHIP
  // ============================================================

  const ownsListing = (listing: FoodListing) => {
    if (isAdmin) {
      return true;
    }

    const sourceType = String(
      listing.sourceType || ''
    )
      .trim()
      .toLowerCase();

    const sourceName = String(
      listing.sourceName || ''
    )
      .trim()
      .toLowerCase();

    if (!organizationName || !sourceName) {
      return false;
    }

    if (isFarmer) {
      return (
        sourceType === 'farmer' &&
        sourceName === organizationName
      );
    }

    if (isRetailer) {
      return (
        sourceType === 'retailer' &&
        sourceName === organizationName
      );
    }

    return false;
  };

  const canManageListing = (listing: FoodListing) => {
    return ownsListing(listing);
  };

  // ============================================================
  // ROLE-BASED VIEWS
  // ============================================================

  const visibleRetailerListings = isAdmin
    ? listings
    : isRetailer
      ? listings.filter(ownsListing)
      : [];

  const visibleFarmerListings = isAdmin
    ? listings
    : isFarmer
      ? listings.filter(ownsListing)
      : [];

  const visibleNgoNeeds = isAdmin
    ? ngoNeeds
    : isNGO
      ? ngoNeeds.filter(
          (need) =>
            String(need.ngoName || '')
              .trim()
              .toLowerCase() === organizationName
        )
      : [];

  // ============================================================
  // PORTAL ACCESS
  // ============================================================

  const canOpenPortal = (tabId: string) => {
    if (isAdmin) {
      return true;
    }

    if (tabId === 'farmer') {
      return isFarmer;
    }

    if (tabId === 'retailer') {
      return isRetailer;
    }

    if (tabId === 'ngo') {
      return isNGO;
    }

    // Dashboard, Analyzer, Journeys, Analytics and Actions
    // remain shared areas.
    return true;
  };

  useEffect(() => {
    if (!canOpenPortal(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, normalizedRole]);

  // ============================================================
  // ADD LISTING
  // ============================================================

  const handleAddListing = (
    listingData: Partial<FoodListing>
  ) => {
    if (!isAdmin && !isFarmer && !isRetailer) {
      console.warn(
        'SCRAPLY: this role is not allowed to create food listings.'
      );
      return;
    }

    const newId = `food-${Date.now().toString().slice(-4)}`;

    const sourceType = isFarmer
      ? 'farmer'
      : isRetailer
        ? 'retailer'
        : listingData.sourceType || 'retailer';

    const sourceName = isAdmin
      ? listingData.sourceName || userProfile.organization
      : userProfile.organization;

    const newListing: FoodListing = {
      id: newId,

      foodName:
        listingData.foodName || 'Surplus Item',

      category:
        listingData.category || 'Fruits',

      quantity:
        listingData.quantity || 10,

      unit:
        listingData.unit || 'kg',

      sourceType,

      sourceName,

      location:
        listingData.location ||
        'Metro Central Logistics Hub',

      dateAdded:
        'Today, Just now',

      expiryDate:
        listingData.expiryDate ||
        'Within 24 hours',

      estimatedFreshness:
        listingData.estimatedFreshness || 75,

      risk:
        listingData.risk || 'MEDIUM',

      urgency:
        listingData.urgency || 'MEDIUM',

      storageCondition:
        listingData.storageCondition ||
        'Ambient Room Temp',

      status:
        'AVAILABLE',

      recommendedAction:
        listingData.recommendedAction ||
        'Direct donation to local pantry',

      recoveryPath:
        listingData.recoveryPath ||
        'DONATE',

      imageUrl:
        listingData.imageUrl ||
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',

      sensoryNotes:
        listingData.sensoryNotes,

      aiAnalysis:
        listingData.aiAnalysis,

      journey: [
        {
          id: `j-${Date.now()}-1`,

          status: 'LISTED',

          timestamp:
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),

          actor:
            `${
              sourceType === 'farmer'
                ? 'Farmer'
                : 'Retailer'
            } (${sourceName})`,

          quantity:
            `${listingData.quantity || 10} ${
              listingData.unit || 'kg'
            }`,

          notes:
            'Surplus food item cataloged for regional recovery',
        },
      ],
    };

    // Add AI analysis milestone if available
    if (listingData.aiAnalysis) {
      newListing.journey.push({
        id: `j-${Date.now()}-2`,

        status: 'ANALYZED',

        timestamp:
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),

        actor:
          'Gemma 4 Multimodal AI',

        quantity:
          `${newListing.quantity} ${newListing.unit}`,

        notes:
          `AI assessed ${newListing.estimatedFreshness}% freshness (${newListing.risk} risk). Recommended path: ${newListing.recoveryPath}.`,
      });
    }

    setListings((prev) => [
      newListing,
      ...prev,
    ]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,

      title:
        'New Surplus Food Listed',

      message:
        `${newListing.foodName} (${newListing.quantity} ${newListing.unit}) added to recovery pool.`,

      type:
        'system',

      timestamp:
        'Just now',

      read:
        false,

      linkTab:
        sourceType === 'farmer'
          ? 'farmer'
          : 'retailer',
    };

    setNotifications((prev) => [
      newNotif,
      ...prev,
    ]);
  };

  // ============================================================
  // UPDATE LISTING
  // ============================================================

  const handleUpdateListing = (
    id: string,
    updates: Partial<FoodListing>
  ) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (!canManageListing(item)) {
          console.warn(
            'SCRAPLY: unauthorized listing update blocked.'
          );

          return item;
        }

        if (!isAdmin) {
          const safeUpdates = {
            ...updates,
          };

          delete safeUpdates.sourceType;
          delete safeUpdates.sourceName;

          return {
            ...item,
            ...safeUpdates,
          };
        }

        return {
          ...item,
          ...updates,
        };
      })
    );
  };

  // ============================================================
  // DELETE LISTING
  // ============================================================

  const handleDeleteListing = (id: string) => {
    setListings((prev) =>
      prev.filter((item) => {
        if (item.id !== id) {
          return true;
        }

        return !canManageListing(item);
      })
    );
  };

  // ============================================================
  // ANALYZE FOOD
  // ============================================================

  const handleAnalyzeItem = (
    item: FoodListing
  ) => {
    setAnalyzerPrefill(item);

    setCurrentTab('analyzer');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ============================================================
  // RECEIVER ACTION
  //
  // NOTE:
  // Actual receiver matching is handled by the friend's
  // Smart Map module.
  //
  // This function only keeps the existing integration hook.
  // ============================================================

  const handleFindReceiver = (
    item: FoodListing
  ) => {
    console.log(
      'SCRAPLY: receiver lookup delegated to Smart Map.',
      item
    );

    setCurrentTab('matching');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ============================================================
  // VIEW JOURNEY
  // ============================================================

  const handleViewJourney = (
    item: FoodListing
  ) => {
    setSelectedJourneyId(item.id);

    setCurrentTab('journeys');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ============================================================
  // CLAIM FOOD
  // ============================================================

  const handleClaimFood = (
    listingId: string,
    ngoName: string
  ) => {
    if (!isAdmin && !isNGO) {
      console.warn(
        'SCRAPLY: only NGO/admin can claim food.'
      );

      return;
    }

    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          const timestamp =
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

          const newStep: JourneyStep = {
            id:
              `j-claim-${Date.now()}`,

            status:
              'CLAIMED',

            timestamp,

            actor:
              `NGO (${ngoName})`,

            quantity:
              `${l.quantity} ${l.unit}`,

            notes:
              `Surplus claimed by ${ngoName} for immediate community distribution`,
          };

          return {
            ...l,

            status:
              'CLAIMED',

            claimedBy:
              ngoName,

            claimedAt:
              timestamp,

            journey:
              [
                ...l.journey,
                newStep,
              ],
          };
        }

        return l;
      })
    );

    const target =
      listings.find(
        (l) => l.id === listingId
      );

    const newNotif: NotificationItem = {
      id:
        `notif-${Date.now()}`,

      title:
        'Food Listing Claimed!',

      message:
        `${ngoName} has officially claimed ${target?.quantity} ${target?.unit} of ${target?.foodName}.`,

      type:
        'claim',

      timestamp:
        'Just now',

      read:
        false,

      linkTab:
        'journeys',
    };

    setNotifications((prev) => [
      newNotif,
      ...prev,
    ]);
  };

  // ============================================================
  // MARK RECEIVED
  // ============================================================

  const handleMarkReceived = (
    listingId: string
  ) => {
    if (!isAdmin && !isNGO) {
      console.warn(
        'SCRAPLY: only NGO/admin can mark food received.'
      );

      return;
    }

    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          const timestamp =
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

          const newStep: JourneyStep = {
            id:
              `j-recv-${Date.now()}`,

            status:
              'RECEIVED',

            timestamp,

            actor:
              l.claimedBy ||
              'Receiving Shelter',

            quantity:
              `${l.quantity} ${l.unit}`,

            notes:
              'Physical handover completed, food condition organoleptically verified',
          };

          return {
            ...l,

            status:
              'RECEIVED',

            journey:
              [
                ...l.journey,
                newStep,
              ],
          };
        }

        return l;
      })
    );
  };

  // ============================================================
  // ADVANCE JOURNEY
  // ============================================================

  const handleAdvanceJourney = (
    listingId: string,
    nextStatus: JourneyStep['status'],
    notes?: string
  ) => {
    if (!isAdmin && !isNGO) {
      console.warn(
        'SCRAPLY: only NGO/admin can advance journey milestones.'
      );

      return;
    }

    const mapToListingStatus = (
      s: JourneyStep['status']
    ): ListingStatus => {
      switch (s) {
        case 'LISTED':
        case 'ANALYZED':
        case 'MATCHED':
          return 'AVAILABLE';

        case 'CLAIMED':
          return 'CLAIMED';

        case 'IN_TRANSIT':
          return 'IN_TRANSIT';

        case 'RECEIVED':
          return 'RECEIVED';

        case 'RECOVERED':
          return 'RECOVERED';

        default:
          return 'AVAILABLE';
      }
    };

    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          const timestamp =
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

          const newStep: JourneyStep = {
            id:
              `j-adv-${Date.now()}`,

            status:
              nextStatus,

            timestamp,

            actor:
              nextStatus === 'IN_TRANSIT'
                ? 'Regional EcoCourier Logistics'
                : nextStatus === 'RECOVERED'
                  ? 'Community Kitchen Head Chef'
                  : userProfile.name,

            quantity:
              `${l.quantity} ${l.unit}`,

            notes:
              notes ||
              `Milestone ${nextStatus} logged in traceability records`,
          };

          return {
            ...l,

            status:
              mapToListingStatus(
                nextStatus
              ),

            journey:
              [
                ...l.journey,
                newStep,
              ],
          };
        }

        return l;
      })
    );
  };

  // ============================================================
  // CREATE NGO NEED
  // ============================================================

  const handleCreateNeed = (
    needData: Partial<NGONeed>
  ) => {
    if (!isAdmin && !isNGO) {
      console.warn(
        'SCRAPLY: only NGO/admin can create food needs.'
      );

      return;
    }

    const ngoName =
      isAdmin
        ? needData.ngoName ||
          userProfile.organization
        : userProfile.organization;

    const newNeed: NGONeed = {
      id:
        `need-${Date.now().toString().slice(-4)}`,

      ngoName:
        ngoName ||
        'Community Food Network',

      contactPerson:
        needData.contactPerson ||
        userProfile.name,

      foodNeeded:
        needData.foodNeeded ||
        'Surplus Staples',

      category:
        needData.category ||
        'Vegetables',

      quantity:
        needData.quantity ||
        40,

      unit:
        needData.unit ||
        'kg',

      requiredBy:
        needData.requiredBy ||
        'Tomorrow, 12:00 PM',

      priority:
        needData.priority ||
        'HIGH',

      description:
        needData.description ||
        'Needed for community kitchen dinner meal preparation.',

      status:
        'ACTIVE',

      createdAt:
        'Just now',
    };

    setNgoNeeds((prev) => [
      newNeed,
      ...prev,
    ]);

    const newNotif: NotificationItem = {
      id:
        `notif-${Date.now()}`,

      title:
        'New NGO Food Need Broadcast',

      message:
        `${newNeed.ngoName} posted request for ${newNeed.quantity} ${newNeed.unit} of ${newNeed.foodNeeded}.`,

      type:
        'match',

      timestamp:
        'Just now',

      read:
        false,

      linkTab:
        'dashboard',
    };

    setNotifications((prev) => [
      newNotif,
      ...prev,
    ]);
  };

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const handleMarkNotifRead = (
    id: string
  ) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    );
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );
  };

  // ============================================================
  // RESET DEMO DATA
  // ============================================================

  const handleResetDemoData = () => {
    setListings(
      INITIAL_LISTINGS
    );

    setNgoNeeds(
      INITIAL_NGO_NEEDS
    );

    setNotifications(
      INITIAL_NOTIFICATIONS
    );

    setUserProfile(
      INITIAL_USER_PROFILE
    );

    localStorage.removeItem(
      'scraply_listings'
    );

    localStorage.removeItem(
      'scraply_ngo_needs'
    );

    localStorage.removeItem(
      'scraply_notifications'
    );

    localStorage.removeItem(
      'scraply_user_profile'
    );

    setIsSettingsOpen(false);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-[var(--bg-app)] text-[var(--text-main)]">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar
        currentTab={currentTab}

        onSelectTab={(tabId) => {
          if (!canOpenPortal(tabId)) {
            console.warn(
              `SCRAPLY: ${normalizedRole} is not authorized to open ${tabId}.`
            );

            return;
          }

          setCurrentTab(tabId);

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }}

        theme={theme}

        onToggleTheme={
          toggleTheme
        }

        notifications={
          notifications
        }

        onMarkAsRead={
          handleMarkNotifRead
        }

        onMarkAllAsRead={
          handleMarkAllNotifsRead
        }

        onOpenCommandPalette={() =>
          setIsCommandPaletteOpen(true)
        }

        onOpenSettings={() =>
          setIsSettingsOpen(true)
        }

        userProfile={
          userProfile
        }

        searchQuery={
          searchQuery
        }

        onSearchChange={(q) =>
          setSearchQuery(q)
        }
      />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'about' && (
  <ProjectIntro
    onEnter={() => {
      setCurrentTab('dashboard');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }}
  />
)}

        {/* DASHBOARD */}

        {currentTab === 'dashboard' && (
          <MainDashboard
            listings={
              listings
            }

            notifications={
              notifications
            }

            onNavigateTab={(tab) => {
              if (!canOpenPortal(tab)) {
                return;
              }

              setCurrentTab(tab);

              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}

            onAnalyzeFood={
              handleAnalyzeItem
            }

            onFindReceiver={
              handleFindReceiver
            }

            onViewJourney={
              handleViewJourney
            }
          />
        )}

        {/* AI ANALYZER */}

        {currentTab === 'analyzer' && (
          <AIFoodAnalyzer
            prefillFood={
              analyzerPrefill
            }

            onAddListingFromAnalysis={(
              data
            ) => {
              handleAddListing(
                data
              );

              setCurrentTab(
                isFarmer
                  ? 'farmer'
                  : 'retailer'
              );

              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}

            onNavigateToTab={(
              tab
            ) => {
              if (!canOpenPortal(tab)) {
                return;
              }

              setCurrentTab(
                tab
              );

              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}
          />
        )}

        {/* RETAILER */}

        {currentTab === 'retailer' && (
          <RetailerDashboard
            listings={
              visibleRetailerListings
            }

            onAddListing={
              handleAddListing
            }

            onUpdateListing={
              handleUpdateListing
            }

            onDeleteListing={
              handleDeleteListing
            }

            onAnalyzeFood={
              handleAnalyzeItem
            }

            onFindReceiver={
              handleFindReceiver
            }

            onViewJourney={
              handleViewJourney
            }
          />
        )}

        {/* FARMER */}

        {currentTab === 'farmer' && (
          <FarmerPortal
            listings={
              visibleFarmerListings
            }

            onAddListing={
              handleAddListing
            }

            onUpdateListing={
              handleUpdateListing
            }

            onDeleteListing={
              handleDeleteListing
            }

            onAnalyzeFood={
              handleAnalyzeItem
            }

            onFindReceiver={
              handleFindReceiver
            }

            onViewJourney={
              handleViewJourney
            }
          />
        )}

        {/* NGO */}

        {currentTab === 'ngo' && (
          <NGOPortal
            listings={
              listings
            }

            ngoNeeds={
              visibleNgoNeeds
            }

            onClaimFood={
              handleClaimFood
            }

            onMarkReceived={
              handleMarkReceived
            }

            onCreateNeed={
              handleCreateNeed
            }

            onViewJourney={
              handleViewJourney
            }

            onAnalyzeFood={
              handleAnalyzeItem
            }
          />
        )}

        {/* JOURNEYS */}

        {currentTab === 'journeys' && (
          <FoodJourneyView
            listings={
              listings
            }

            selectedListingId={
              selectedJourneyId
            }

            onAdvanceJourney={
              handleAdvanceJourney
            }
          />
        )}

        {/* HARVESTGUARD */}

        {currentTab === 'harvestguard' && (
          <HarvestGuardDashboard
            onOpenMap={() => {
              setCurrentTab('matching');
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}
            onAddListing={isFarmer || isAdmin ? handleAddListing : undefined}
          />
        )}

        {/* SMART MAP / MATCHING */}

        {currentTab === 'matching' && (
          <SmartMapDashboard />
        )}

        {/* ANALYTICS */}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            listings={
              listings
            }
          />
        )}

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-[var(--glass-border)] py-6 glass-panel transition-colors">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">

          <div className="flex items-center gap-2">

            <span className="font-extrabold text-[var(--forest)] dark:text-[var(--text-main)] font-heading">
              SCRAPLY
            </span>

            <span>
              • Multimodal Food Recovery & Surplus Intelligence
            </span>

          </div>

          <div className="flex items-center gap-4 text-[11px]">

            <span>
              Powered by Gemma 4 Intelligence
            </span>

            <span>•</span>

            <span>
              Zero Waste Pipeline
            </span>

            <span>•</span>

            <button
              onClick={() =>
                setIsSettingsOpen(true)
              }
              className="text-[var(--leaf)] hover:underline cursor-pointer"
            >
              Demo Settings
            </button>

          </div>

        </div>

      </footer>

     <CommandPalette
  isOpen={isCommandPaletteOpen}
  onClose={() =>
    setIsCommandPaletteOpen(false)
  }
  onSelectAction={(actionId) => {
    if (
      actionId.startsWith(
        'tab-'
      )
    ) {
      const targetTab =
        actionId.replace(
          'tab-',
          ''
        );

      if (
        !canOpenPortal(
          targetTab
        )
      ) {
        console.warn(
          `SCRAPLY: ${normalizedRole} is not authorized to open ${targetTab}.`
        );
        return;
      }

      setCurrentTab(
        targetTab
      );
    } else if (
      actionId ===
      'action-at-risk'
    ) {
      if (
        !canOpenPortal(
          'retailer'
        )
      ) {
        console.warn(
          `SCRAPLY: ${normalizedRole} is not authorized to open retailer inventory.`
        );
        return;
      }

      setCurrentTab(
        'retailer'
      );
    } else if (
      actionId ===
      'action-harvestguard'
    ) {
      if (!isAdmin && !isFarmer) {
        console.warn(
          `SCRAPLY: ${normalizedRole} is not authorized to open HarvestGuard.`
        );
        return;
      }

      setCurrentTab('harvestguard');
    } else if (
      actionId ===
      'action-smart-map'
    ) {
      setCurrentTab('matching');
    } else if (
      actionId ===
      'action-analytics'
    ) {
      setCurrentTab(
        'analytics'
      );
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }}
/>

      {/* ======================================================
          PROFILE SETTINGS
      ====================================================== */}

      <ProfileSettingsModal
        isOpen={
          isSettingsOpen
        }

        onClose={() =>
          setIsSettingsOpen(false)
        }

        userProfile={
          userProfile
        }

        onUpdateProfile={(
          updated
        ) =>
          setUserProfile(
            updated
          )
        }

        theme={
          theme
        }

        onToggleTheme={
          toggleTheme
        }

        onResetDemoData={
          handleResetDemoData
        }
      />

    </div>
  );
}