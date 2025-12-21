import { Bell, Calendar, Users, Ticket, X, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/userService';

interface Notification {
  id: number;
  type: 'event' | 'social' | 'ticket' | 'system' | 'booking' | 'approval' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getUserNotifications(filter === 'unread');
      
      // Transform API data to component format
      const formattedNotifications: Notification[] = (response.notifications || []).map((notif: any) => {
        // Map notification types
        let type: Notification['type'] = 'general';
        if (notif.notification_type === 'booking') type = 'ticket';
        else if (notif.notification_type === 'approval') type = 'event';
        else if (notif.notification_type === 'reminder') type = 'event';
        else if (notif.notification_type === 'payment') type = 'ticket';
        
        return {
          id: notif.id,
          type: type,
          title: notif.title || 'Notification',
          message: notif.message || '',
          time: notif.created_at ? formatTimeAgo(new Date(notif.created_at)) : 'Recently',
          read: notif.is_read || false,
          actionLabel: notif.action_text,
          actionUrl: notif.action_url
        };
      });
      
      setNotifications(formattedNotifications);
      setUnreadCount(response.unread_count || 0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#27aae2]" />;
      case 'social':
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />;
      case 'ticket':
      case 'booking':
        return <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'system':
      case 'general':
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      await fetchNotifications(); // Refresh
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      alert(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      await fetchNotifications(); // Refresh
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      alert(err.message || 'Failed to mark all notifications as read');
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' ? true : !notif.read
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">Notifications</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Mark all</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 dark:border-gray-700 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#27aae2] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-[#27aae2] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">No notifications</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {filter === 'unread' ? "You're all caught up!" : 'No notifications to show'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border transition-all hover:shadow-md ${
                notification.read
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-[#27aae2]/30 bg-[#27aae2]/5 dark:bg-[#27aae2]/10'
              }`}
            >
              <div className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon/Image */}
                  <div className="flex-shrink-0">
                    {notification.image ? (
                      <img
                        src={notification.image}
                        alt=""
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#27aae2] rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.time}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {notification.actionLabel && notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-semibold text-[#27aae2] hover:text-[#1e8bb8] transition-colors"
                          >
                            {notification.actionLabel}
                          </a>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
