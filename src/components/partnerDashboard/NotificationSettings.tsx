import { Bell, Calendar, Heart, Share2, Star, MessageSquare, Trash2, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'rsvp' | 'booking' | 'bucketlist' | 'share' | 'review' | 'message';
  title: string;
  message: string;
  time: string;
  read: boolean;
  eventName?: string;
  userName?: string;
}

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'New Booking',
      message: 'Sarah Johnson booked 2 VIP tickets for your event',
      eventName: 'PICNICS AT NGONG HILLS',
      userName: 'Sarah Johnson',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'rsvp',
      title: 'New RSVP',
      message: 'Michael Chen RSVPed to your event',
      eventName: 'Tech Meetup Nairobi',
      userName: 'Michael Chen',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'bucketlist',
      title: 'Added to Bucket List',
      message: 'Emma Wilson added your event to their bucket list',
      eventName: 'Sunset Yoga Session',
      userName: 'Emma Wilson',
      time: '2 hours ago',
      read: true
    },
    {
      id: '4',
      type: 'share',
      title: 'Event Shared',
      message: 'David Mwangi shared your event with friends',
      eventName: 'PICNICS AT NGONG HILLS',
      userName: 'David Mwangi',
      time: '3 hours ago',
      read: true
    },
    {
      id: '5',
      type: 'review',
      title: 'New Review',
      message: 'Anna Lane left a 5-star review for your event',
      eventName: 'Tech Meetup Nairobi',
      userName: 'Anna Lane',
      time: '5 hours ago',
      read: true
    },
    {
      id: '6',
      type: 'message',
      title: 'New Message',
      message: 'John Doe sent you a message about event details',
      eventName: 'Sunset Yoga Session',
      userName: 'John Doe',
      time: '1 day ago',
      read: true
    },
    {
      id: '7',
      type: 'booking',
      title: 'New Booking',
      message: 'Grace Kamau booked 4 Regular tickets for your event',
      eventName: 'Tech Meetup Nairobi',
      userName: 'Grace Kamau',
      time: '2 days ago',
      read: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'rsvp':
        return Calendar;
      case 'booking':
        return Calendar;
      case 'bucketlist':
        return Heart;
      case 'share':
        return Share2;
      case 'review':
        return Star;
      case 'message':
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'rsvp':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'booking':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'bucketlist':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
      case 'share':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'review':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'message':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with your event activities
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#27aae2] hover:bg-[#27aae2]/10 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 inline-flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'all'
              ? 'bg-[#27aae2] text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'unread'
              ? 'bg-[#27aae2] text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No {filter === 'unread' ? 'unread' : ''} notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all hover:shadow-lg ${
                  !notification.read ? 'border-l-4 border-[#27aae2]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${colorClass} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        {notification.eventName && (
                          <p className="text-xs text-[#27aae2] font-medium">
                            Event: {notification.eventName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-[#27aae2] hover:bg-[#27aae2]/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
