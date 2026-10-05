import React, { useState } from 'react';
import { User, Building, Mail, Phone, Bell, Mic, Sparkles, RefreshCw, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Theme, UserProfile } from '../../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onResetDemoData: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  theme,
  onToggleTheme,
  onResetDemoData,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleRoleSelect = (role: UserProfile['role']) => {
    let org = profile.organization;
    let name = profile.name;
    if (role === 'retailer') {
      org = 'Metro Green Superstore #14';
      name = 'Elena Rostova (Produce Lead)';
    } else if (role === 'farmer') {
      org = 'SunCrest Organic Farms';
      name = 'Thomas Greenfield (Harvest Manager)';
    } else if (role === 'ngo') {
      org = 'Community Kitchen & Pantry';
      name = 'Marcus Vance (Culinary Director)';
    } else {
      org = 'SCRAPLY Platform Operations';
      name = 'System Administrator';
    }
    setProfile({ ...profile, role, organization: org, name });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Platform Settings"
      subtitle="Customize your organization persona, voice input preferences, and theme."
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Quick Demo Persona Switcher */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-main)] mb-2 font-heading uppercase tracking-wider">
            Active Role Persona (Switch for Demo)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['retailer', 'farmer', 'ngo', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                  profile.role === r
                    ? 'bg-[var(--forest)] text-[var(--light-gold)] border-[var(--forest)] shadow-sm'
                    : 'bg-[var(--surface-hover)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {r === 'ngo' ? 'NGO Director' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-3.5 pt-2 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-bold text-[var(--text-main)] font-heading uppercase tracking-wider">
            Identity Details
          </h3>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Contact Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Organization / Facility
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--surface-hover)] text-xs text-[var(--text-main)] border border-[var(--border-subtle)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-bold text-[var(--text-main)] font-heading uppercase tracking-wider">
            System Preferences
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--gold)]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-[var(--text-main)]">
                  Appearance Theme
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Currently {theme === 'light' ? 'Ivory Warm Light' : 'Moss Forest Dark'}
                </div>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--leaf)]">
                <Mic className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-[var(--text-main)]">
                  Voice Speech-to-Text Input
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Enable Web Speech microphone throughout forms
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.voiceEnabled}
              onChange={(e) => setProfile({ ...profile, voiceEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-[var(--leaf)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[var(--surface)] text-orange-500">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-[var(--text-main)]">
                  At-Risk & Expiry Alerts
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Receive real-time notifications for rapid food decay
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.notificationsEnabled}
              onChange={(e) => setProfile({ ...profile, notificationsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-[var(--leaf)] cursor-pointer"
            />
          </div>
        </div>

        {/* Demo Data Reset */}
        <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[var(--text-main)]">
              Demo Data Reset
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Restore default surplus listings, journeys, and notifications
            </div>
          </div>
          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[var(--text-main)] text-xs font-semibold border border-[var(--border-subtle)] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-[var(--leaf)]" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--sage-light)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--forest)] hover:bg-[#23523B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
