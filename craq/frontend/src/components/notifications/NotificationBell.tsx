'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '@/types';
import wsClient from '@/lib/websocket';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!token) return;

    wsClient.connect(token);

    const handleNotification = (data: Record<string, unknown>) => {
      const notification: Notification = {
        id: String(Date.now()),
        type: String(data.type || 'info'),
        message: String(data.message || ''),
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
    };

    wsClient.on('notification', handleNotification);

    return () => {
      wsClient.off('notification', handleNotification);
    };
  }, [token]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                    !notif.read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                  }`}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
