import { Calendar, MapPin, Heart, Search, SlidersHorizontal, Grid3x3, List, DollarSign, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBucketlist, addToBucketlist, removeFromBucketlist } from '../../services/userService';
import { API_BASE_URL } from '../../config/api';

interface Event {
  id: number;
  title: string;
  image: string;
  date: string;
  location: string;
  price: string;
  isOutdated: boolean;
  category?: string;
}

interface BucketListProps {
  onEventClick: (event: Event) => void;
}

export default function BucketList({ onEventClick }: BucketListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'expired'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBucketlist();
  }, []);

  const fetchBucketlist = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getBucketlist();
      
      // Transform API data to component format
      const formattedEvents: Event[] = (response.events || []).map((event: any) => {
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        const now = new Date();
        const isOutdated = startDate < now;
        
        return {
          id: event.id,
          title: event.title || 'Event',
          image: event.poster_image ? `${API_BASE_URL}/uploads/${event.poster_image}` : '',
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: event.venue_name || event.venue_address || 'Online',
          price: event.is_free ? 'Free' : (event.ticket_types?.[0]?.price ? `KES ${event.ticket_types[0].price.toLocaleString()}` : 'TBA'),
          isOutdated: isOutdated,
          category: event.category?.name || 'General'
        };
      });
      
      setEvents(formattedEvents);
    } catch (err: any) {
      console.error('Error fetching bucketlist:', err);
      setError(err.message || 'Failed to load bucketlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'available' && !event.isOutdated) ||
      (filterStatus === 'expired' && event.isOutdated);
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: events.length,
    available: events.filter(e => !e.isOutdated).length,
    expired: events.filter(e => e.isOutdated).length
  };

  const handleRemoveFromBucket = async (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeFromBucketlist(eventId);
      // Refresh list
      await fetchBucketlist();
    } catch (err: any) {
      console.error('Error removing from bucketlist:', err);
      alert(err.message || 'Failed to remove from bucketlist');
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bucket List</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} saved
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
            placeholder="Search saved events..."
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
          { key: 'all', label: 'All Saved', icon: Heart },
          { key: 'available', label: 'Available', icon: Calendar },
          { key: 'expired', label: 'Expired', icon: AlertCircle }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
              filterStatus === filter.key
                ? 'bg-[#27aae2] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#27aae2] hover:text-[#27aae2]'
            }`}
          >
            <filter.icon className="w-4 h-4" />
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
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved events found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer group ${
                event.isOutdated ? 'opacity-75' : ''
              }`}
            >
              <div className="relative h-40">
                <img
                  src={event.image}
                  alt={event.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    event.isOutdated ? 'grayscale' : ''
                  }`}
                />
                {event.isOutdated && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    EXPIRED
                  </div>
                )}
                <button 
                  onClick={(e) => handleRemoveFromBucket(event.id, e)}
                  className="absolute top-2 left-2 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </button>
                {event.category && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
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
                    <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="font-semibold text-[#27aae2]">{event.price}</span>
                  </div>
                </div>
                <button 
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    event.isOutdated
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                  }`}
                  disabled={event.isOutdated}
                >
                  {event.isOutdated ? 'Expired' : 'Book Now'}
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
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer p-4 ${
                event.isOutdated ? 'opacity-75' : ''
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover flex-shrink-0 ${
                    event.isOutdated ? 'grayscale' : ''
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">{event.title}</h3>
                    <button 
                      onClick={(e) => handleRemoveFromBucket(event.id, e)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.category && (
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-semibold">
                        {event.category}
                      </span>
                    )}
                    {event.isOutdated && (
                      <span className="inline-block bg-gray-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        EXPIRED
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#27aae2]">{event.price}</span>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        event.isOutdated
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                      }`}
                      disabled={event.isOutdated}
                    >
                      {event.isOutdated ? 'Expired' : 'Book Now'}
                    </button>
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
