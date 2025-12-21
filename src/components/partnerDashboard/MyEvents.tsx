import { Calendar, MapPin, Users, Eye, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPartnerEvents } from '../../services/partnerService';
import { API_BASE_URL } from '../../config/api';
import CreateEvent from './CreateEvent';

interface MyEventsProps {
  onCreateEvent: () => void;
}

export default function MyEvents({ onCreateEvent }: MyEventsProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past' | 'pending'>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Fetch events on mount and when filter changes
  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // Expose refresh function via window for CreateEvent to call
  useEffect(() => {
    (window as any).refreshPartnerEvents = fetchEvents;
    return () => {
      delete (window as any).refreshPartnerEvents;
    };
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Map filter to API status
      let apiStatus: string | undefined;
      if (filter === 'pending') {
        apiStatus = 'pending';
      } else if (filter === 'all') {
        apiStatus = undefined; // Get all
      } else {
        // For upcoming, ongoing, past - we'll filter client-side based on dates
        apiStatus = 'approved'; // Get approved events and filter by date
      }
      
      const response = await getPartnerEvents(apiStatus);
      
      if (response.events) {
        let filteredEvents = response.events;
        
        // Filter by date for upcoming, ongoing, past
        if (filter !== 'all' && filter !== 'pending') {
          const now = new Date();
          filteredEvents = response.events.filter((event: any) => {
            const startDate = new Date(event.start_date);
            const endDate = event.end_date ? new Date(event.end_date) : startDate;
            
            if (filter === 'upcoming') {
              return startDate > now && event.status === 'approved';
            } else if (filter === 'ongoing') {
              return startDate <= now && endDate >= now && event.status === 'approved';
            } else if (filter === 'past') {
              return endDate < now && event.status === 'approved';
            }
            return true;
          });
        }
        
        setEvents(filteredEvents);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      // TODO: Call delete API
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleEditEvent = (eventId: number) => {
    setEditEventId(eventId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditEventId(null);
    // Refresh events after edit
    fetchEvents();
  };

  const getEventStatus = (event: any): string => {
    if (event.status === 'pending') return 'pending';
    if (event.status === 'rejected') return 'rejected';
    
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;
    
    if (startDate > now) return 'upcoming';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'past';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTotalTickets = (event: any): number => {
    if (event.ticket_types && event.ticket_types.length > 0) {
      return event.ticket_types.reduce((sum: number, tt: any) => sum + (tt.quantity_total || 0), 0);
    }
    return 0;
  };

  const getTicketsSold = (event: any): number => {
    return event.total_tickets_sold || 0;
  };

  const getEventImage = (event: any): string => {
    if (event.poster_image) {
      return event.poster_image.startsWith('http') 
        ? event.poster_image 
        : `${API_BASE_URL}/${event.poster_image.replace(/^\/+/, '')}`;
    }
    return 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop';
  };

  const getEventLocation = (event: any): string => {
    if (event.is_online && event.online_link) {
      return 'Online Event';
    }
    return event.venue_name || event.venue_address || 'Location TBD';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Events</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your events</p>
        </div>
        <button 
          onClick={onCreateEvent}
          className="flex items-center space-x-2 bg-[#27aae2] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e8bc3] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'ongoing', label: 'Ongoing' },
          { id: 'past', label: 'Past' },
          { id: 'pending', label: 'Awaiting Approval' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === item.id
                ? 'bg-[#27aae2] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 text-center">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event) => {
            const status = getEventStatus(event);
            const totalTickets = getTotalTickets(event);
            const ticketsSold = getTicketsSold(event);
            const progress = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;
            
            return (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-40">
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'upcoming' ? 'bg-blue-500 text-white' :
                      status === 'ongoing' ? 'bg-green-500 text-white' :
                      status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs truncate">{getEventLocation(event)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {totalTickets > 0 && (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Tickets</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {ticketsSold} / {totalTickets}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-[#27aae2] h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{event.attendee_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{event.view_count || 0}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleEditEvent(event.id)}
                          className="flex items-center space-x-1 text-[#27aae2] hover:text-[#1e8bc3] transition-colors"
                          title="Edit event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No {filter !== 'all' && filter} events found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? "You haven't created any events yet. Click 'Create Event' to get started!"
              : `You don't have any ${filter} events at the moment.`
            }
          </p>
        </div>
      )}

      {/* Edit Event Modal */}
      <CreateEvent
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        eventId={editEventId}
        onEventCreated={() => {
          handleCloseEditModal();
        }}
      />
    </div>
  );
}
