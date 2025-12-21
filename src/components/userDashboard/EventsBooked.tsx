import { Calendar, QrCode, MapPin, Clock, Search, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserBookings } from '../../services/userService';
import { API_BASE_URL } from '../../config/api';

interface Event {
  id: number;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  ticketId: string;
  category?: string;
  status?: 'upcoming' | 'today' | 'this-week';
}

interface EventsBookedProps {
  onEventClick: (event: Event) => void;
}

export default function EventsBooked({ onEventClick }: EventsBookedProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'today' | 'this-week'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookedEvents();
  }, [filterStatus]);

  const fetchBookedEvents = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const status = filterStatus === 'all' ? undefined : 
                    filterStatus === 'upcoming' ? 'upcoming' : 'past';
      
      const response = await getUserBookings(status);
      
      // Transform API data to component format
      const formattedEvents: Event[] = (response.bookings || []).map((booking: any) => {
        const event = booking.event || {};
        const firstTicket = booking.tickets?.[0] || {};
        
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'upcoming' | 'today' | 'this-week' = 'upcoming';
        if (daysDiff === 0) {
          status = 'today';
        } else if (daysDiff > 0 && daysDiff <= 7) {
          status = 'this-week';
        }
        
        const dateStr = startDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          ...(startDate.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {})
        });
        
        const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        return {
          id: booking.id,
          title: event.title || 'Event',
          image: event.poster_image ? `${API_BASE_URL}/uploads/${event.poster_image}` : '',
          date: dateStr,
          time: timeStr,
          location: event.venue_name || event.venue_address || 'Online',
          ticketId: firstTicket.ticket_number || booking.booking_number || 'N/A',
          category: event.category?.name || 'General',
          status: status
        };
      });
      
      setEvents(formattedEvents);
    } catch (err: any) {
      console.error('Error fetching booked events:', err);
      setError(err.message || 'Failed to load booked events');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: events.length,
    today: events.filter(e => e.status === 'today').length,
    'this-week': events.filter(e => e.status === 'this-week').length,
    upcoming: events.filter(e => e.status === 'upcoming').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Events Booked</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          />
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-semibold">Filters</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'today', label: 'Today' },
          { key: 'this-week', label: 'This Week' },
          { key: 'upcoming', label: 'Upcoming' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
              filterStatus === filter.key
                ? 'bg-[#27aae2] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#27aae2] hover:text-[#27aae2]'
            }`}
          >
            {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer group"
            >
              <div className="relative h-40">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  BOOKED
                </div>
                {event.category && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    {event.category}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">{event.title}</h3>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="font-mono text-xs">{event.ticketId}</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-[#27aae2] text-white rounded-lg text-sm font-semibold hover:bg-[#1e8bb8] transition-colors">
                  View Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer p-4"
            >
              <div className="flex gap-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">{event.title}</h3>
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                      BOOKED
                    </span>
                  </div>
                  {event.category && (
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-semibold mb-3">
                      {event.category}
                    </span>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span className="font-mono">{event.ticketId}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#27aae2] text-white rounded-lg text-sm font-semibold hover:bg-[#1e8bb8] transition-colors">
                    View Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
