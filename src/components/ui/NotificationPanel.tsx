import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, ShieldAlert, Sparkles, HeartHandshake, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'risk':
        return <ShieldAlert className="w-4 h-4 text-orange-500" />;
      case 'claim':
        return <HeartHandshake className="w-4 h-4 text-sky-500" />;
      case 'match':
        return <Sparkles className="w-4 h-4 text-[var(--gold)]" />;
      case 'recovery':
        return <Check className="w-4 h-4 text-[var(--leaf)]" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-main)] hover:bg-[var(--sage-light)] hover:border-[var(--leaf)] transition-all duration-200 shadow-sm cursor-pointer"
      >
        <Bell className="w-4 h-4 text-[var(--forest)] dark:text-[var(--text-main)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[var(--surface)] shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[var(--surface)] text-[var(--text-main)] border border-[var(--border-subtle)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm font-heading">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-xs text-[var(--leaf)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-2 bg-[var(--sage-light)]/40 flex items-center gap-2 border-b border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                filter === 'all'
                  ? 'bg-[var(--surface)] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                filter === 'unread'
                  ? 'bg-[var(--surface)] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No notifications right now
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) onMarkAsRead(notif.id);
                    if (notif.linkTab) {
                      onNavigateToTab(notif.linkTab);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 text-left ${
                    !notif.read
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : 'hover:bg-[var(--sage-light)]/30'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] shrink-0 shadow-sm mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs truncate ${
                          !notif.read ? 'font-bold text-[var(--text-main)]' : 'font-medium text-[var(--text-muted)]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.linkTab && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--leaf)] font-medium">
                        <span>View details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
