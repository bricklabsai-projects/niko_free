import { Calendar, MapPin, Users, Clock, Tag, ExternalLink, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import TicketSelector from '../components/TicketSelector';
import EventActions from '../components/EventActions';
import { getEventDetails } from '../services/eventService';
import { API_BASE_URL } from '../config/api';

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (page: string) => void;
}

export default function EventDetailPage({ eventId, onNavigate }: EventDetailPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [copyLinkText, setCopyLinkText] = useState('Copy Link');
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event details from API
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId || eventId === '1') {
        setError('Invalid event ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getEventDetails(parseInt(eventId));
        setEventData(data);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Format date and time
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'TBA';
    const start = formatTime(startDate);
    const end = formatTime(endDate);
    return `${start} - ${end}`;
  };

  // Share functionality
  const eventUrl = window.location.href;
  const shareText = eventData ? `Check out this event: ${eventData.title}` : 'Check out this event';

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${eventUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopyLinkText('Link Copied!');
      setTimeout(() => {
        setCopyLinkText('Copy Link');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyLinkText('Link Copied!');
        setTimeout(() => {
          setCopyLinkText('Copy Link');
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onNavigate={onNavigate} currentPage="event-detail" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{error || 'The event you are looking for does not exist.'}</p>
            <button
              onClick={() => onNavigate('landing')}
              className="px-6 py-3 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format ticket types for TicketSelector component
  const ticketTypes = eventData.ticket_types || [];
  const isFree = eventData.is_free || false;
  
  // Determine ticket type structure
  let ticketType: 'uniform' | 'class' | 'loyalty' | 'season' | 'timeslot' = 'uniform';
  let tickets: any = { 
    uniform: [],
    class: [],
    loyalty: [],
    season: [],
    timeslot: []
  };

  if (ticketTypes.length === 0 && isFree) {
    ticketType = 'uniform';
    tickets = {
      uniform: [{ id: 'free', name: 'Free Ticket', price: 0, available: eventData.capacity || 999 }],
      class: [],
      loyalty: [],
      season: [],
      timeslot: []
    };
  } else if (ticketTypes.length > 0) {
    // Use uniform for now - can be enhanced based on ticket type structure
    ticketType = 'uniform';
    const mappedTickets = ticketTypes.map((tt: any) => ({
      id: tt.id?.toString() || tt.name?.toLowerCase().replace(/\s+/g, '-') || 'ticket-1',
      name: tt.name || 'Standard Ticket',
      price: parseFloat(tt.price || 0),
      available: tt.quantity_available || tt.quantity || tt.available || 0
    }));
    
    tickets = {
      uniform: mappedTickets.length > 0 ? mappedTickets : [{ id: 'default', name: 'Standard Ticket', price: 0, available: 0 }],
      class: [],
      loyalty: [],
      season: [],
      timeslot: []
    };
  } else {
    // No tickets available - show default
    tickets = {
      uniform: [{ id: 'default', name: 'Ticket', price: 0, available: 0 }],
      class: [],
      loyalty: [],
      season: [],
      timeslot: []
    };
  }

  const eventImage = eventData.poster_image 
    ? (eventData.poster_image.startsWith('http') 
        ? eventData.poster_image 
        : `${API_BASE_URL}${eventData.poster_image.startsWith('/') ? '' : '/'}${eventData.poster_image}`)
    : 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200';

  const location = eventData.is_online 
    ? (eventData.online_link ? `Online - ${eventData.online_link}` : 'Online Event')
    : (eventData.venue_name || eventData.venue_address || 'Location TBA');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
      {/* Light mode dot pattern overlay */}
      <div className="block dark:hidden fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Dark mode dot pattern overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} currentPage="event-detail" />

        <button
          onClick={() => onNavigate('landing')}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-[#27aae2] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Events</span>
        </button>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="relative h-96">
                  <img
                    src={eventImage}
                    alt={eventData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-[#27aae2] text-white text-sm font-semibold rounded-full">
                      {eventData.category?.name || 'Event'}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{eventData.title}</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatDate(eventData.start_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTimeRange(eventData.start_date, eventData.end_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{location}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Attendees</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {eventData.attendee_count || 0} {eventData.capacity ? `/ ${eventData.capacity}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{eventData.description}</p>
                  </div>

                  {(eventData.interests && eventData.interests.length > 0) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Interests & Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {eventData.interests.map((interest: any, index: number) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-[#27aae2]/10 hover:text-[#27aae2] transition-colors cursor-pointer"
                          >
                            {typeof interest === 'string' ? interest : interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {eventData.partner && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hosted By</h3>
                      <div className="flex items-center space-x-4">
                        {eventData.partner.logo && (
                          <img
                            src={eventData.partner.logo.startsWith('http') 
                              ? eventData.partner.logo 
                              : `${API_BASE_URL}${eventData.partner.logo.startsWith('/') ? '' : '/'}${eventData.partner.logo}`}
                            alt={eventData.partner.business_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {eventData.partner.business_name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {eventData.partner.category?.name || 'Event Organizer'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Event Map - Only show if physical location */}
                {!eventData.is_online && eventData.venue_name && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-[#27aae2]" />
                        <span>Event Venue</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{location}</p>
                    </div>
                    <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8159534114384!2d36.82035431475395!3d-1.2880051359988408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d6d6f8f8f3%3A0x3f0e0e0e0e0e0e0e!2s${encodeURIComponent(location)}!5e0!3m2!1sen!2ske!4v1234567890123!5m2!1sen!2ske`}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event Location Map"
                      ></iframe>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-[#27aae2] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Maps</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Ticketing Section */}
                <TicketSelector
                  ticketType={ticketType}
                  tickets={tickets}
                  selectedTicketType={selectedTicketType}
                  selectedTimeSlot={selectedTimeSlot}
                  onSelectTicketType={setSelectedTicketType}
                  onSelectTimeSlot={setSelectedTimeSlot}
                  isRSVPed={false}
                  onBuyTicket={() => setShowLoginModal(true)}
                />

                {/* Event Actions */}
                <EventActions />

                {/* Share Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Share Event</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={handleWhatsAppShare}
                      className="w-full py-2.5 px-4 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors text-sm"
                    >
                      Share on WhatsApp
                    </button>
                    <button 
                      onClick={handleLinkedInShare}
                      className="w-full py-2.5 px-4 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Share on LinkedIn
                    </button>
                    <button 
                      onClick={handleCopyLink}
                      className="w-full py-2.5 px-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:border-[#27aae2] hover:text-[#27aae2] transition-colors text-sm"
                    >
                      {copyLinkText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}
