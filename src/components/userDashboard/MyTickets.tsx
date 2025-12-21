import { Calendar, MapPin, Download, QrCode, Share2, Ticket, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getUserBookings, getTicketQRCode, downloadTicket } from '../../services/userService';
import { API_BASE_URL } from '../../config/api';

interface TicketData {
  id: number;
  bookingId: number;
  eventTitle: string;
  eventImage: string;
  date: string;
  time: string;
  location: string;
  ticketId: string;
  ticketType: string;
  price: string;
  status: 'active' | 'used' | 'cancelled' | 'pending';
  qrCode?: string;
  orderNumber: string;
  purchaseDate: string;
  reservedUntil?: string | null;
}

export default function MyTickets() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'used' | 'cancelled'>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const status = selectedFilter === 'all' ? undefined : 
                    selectedFilter === 'active' ? 'upcoming' :
                    selectedFilter === 'used' ? 'past' : 'cancelled';
      
      const response = await getUserBookings(status);
      
      // Transform API data to component format
      // Only show bookings that have tickets (payment completed)
      // This ensures users can't download tickets before payment
      const formattedTickets: TicketData[] = (response.bookings || []).map((booking: any) => {
      // IMPORTANT: Filter out pending/unpaid bookings - only show confirmed/paid tickets
      const formattedTickets: TicketData[] = (response.bookings || [])
        .filter((booking: any) => {
          // Only include confirmed bookings or paid bookings
          // Exclude pending bookings that haven't been paid
          return booking.status === 'confirmed' || 
                 (booking.status !== 'pending' || booking.payment_status === 'paid');
        })
        .map((booking: any) => {
        const event = booking.event || {};
        const firstTicket = booking.tickets?.[0] || {};
        const ticketType = firstTicket.ticket_type || {};
        
        // Determine status - no pending status here since we filtered them out
        let status: 'active' | 'used' | 'cancelled' = 'active';
        if (booking.status === 'cancelled') {
          status = 'cancelled';
        } else if (event.start_date && new Date(event.start_date) < new Date()) {
          status = 'used';
        }
        
        // Format date
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        // Format time
        const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const endDate = event.end_date ? new Date(event.end_date) : null;
        const endTimeStr = endDate ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
        const time = endTimeStr ? `${timeStr} - ${endTimeStr}` : timeStr;
        
        return {
          id: firstTicket.id || booking.id,
          bookingId: booking.id,
          eventTitle: event.title || 'Event',
          eventImage: event.poster_image ? `${API_BASE_URL}/uploads/${event.poster_image}` : '',
          date: dateStr,
          time: time,
          location: event.venue_name || event.venue_address || 'Online',
          ticketId: firstTicket.ticket_number || booking.booking_number || 'N/A',
          ticketType: ticketType.name || 'General Admission',
          price: booking.total_amount > 0 ? `KES ${booking.total_amount.toLocaleString()}` : 'Free',
          status: status,
          orderNumber: booking.booking_number || `ORD-${booking.id}`,
          purchaseDate: booking.created_at ? new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          reservedUntil: null // Not needed for confirmed tickets
        };
      });
      
      setTickets(formattedTickets);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchTickets();
    
    // Set up interval to check and release expired bookings every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/release-expired`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.released_count > 0) {
            // Refresh tickets if any were released
            fetchTickets();
          }
        }
      } catch (err) {
        // Silently fail - this is a background task
        console.error('Error releasing expired bookings:', err);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(ticket => {
    if (selectedFilter === 'all') return true;
    return ticket.status === selectedFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-xs font-semibold">Active</span>
          </div>
        );
      case 'used':
        return (
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-xs font-semibold">Used</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-xs font-semibold">Cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleViewQR = async (ticket: TicketData) => {
    try {
      const qrData = await getTicketQRCode(ticket.bookingId);
      setSelectedTicket({
        ...ticket,
        qrCode: qrData.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.ticketId}`
      });
    } catch (err: any) {
      console.error('Error fetching QR code:', err);
      // Fallback to generated QR
      setSelectedTicket({
        ...ticket,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.ticketId}`
      });
    }
  };

  const handleDownloadTicket = async (ticket: TicketData) => {
    try {
      const blob = await downloadTicket(ticket.bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading ticket:', err);
      alert('Download feature coming soon. Use QR code for entry.');
    }
  };

  const handleShareTicket = (ticket: TicketData) => {
    const shareText = `I'm attending ${ticket.eventTitle}! 🎉`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: ticket.eventTitle,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Link copied to clipboard!');
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">My Tickets</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage all your event tickets</p>
        </div>
        
        {/* Filter Buttons - Responsive */}
        <div className="flex items-center overflow-x-auto bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 dark:border-gray-700 scrollbar-hide">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setSelectedFilter('active')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'active'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Active ({tickets.filter(t => t.status === 'active').length})
          </button>
          <button
            onClick={() => setSelectedFilter('used')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'used'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Used ({tickets.filter(t => t.status === 'used').length})
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'cancelled'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Cancelled ({tickets.filter(t => t.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-12 text-center">
          <Ticket className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">No tickets found</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">You don't have any {selectedFilter !== 'all' ? selectedFilter : ''} tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Ticket Header with Image */}
              <div className="relative h-28 sm:h-36">
                <img
                  src={ticket.eventImage}
                  alt={ticket.eventTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-1">{ticket.eventTitle}</h3>

                {/* Event Details - Compact */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{ticket.date}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ticket.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{ticket.location}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-start space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                      <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{ticket.ticketType}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#27aae2] whitespace-nowrap">{ticket.price}</span>
                  </div>
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{ticket.ticketId}</p>
                  </div>
                </div>


                {/* Action Buttons - Mobile Optimized */}
                <div className="flex gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleViewQR(ticket)}
                    disabled={ticket.status === 'cancelled' || ticket.status === 'pending'}
                    className={`flex-1 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                      ticket.status === 'cancelled' || ticket.status === 'pending'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                    }`}
                  >
                    <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline sm:hidden">QR</span>
                    <span className="hidden sm:inline">View QR</span>
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    className="p-1.5 sm:p-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md sm:rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                    title="Download"
                  >
                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    onClick={() => handleShareTicket(ticket)}
                    disabled={ticket.status === 'cancelled'}
                    className={`p-1.5 sm:p-2 border rounded-md sm:rounded-lg font-semibold transition-all ${
                      ticket.status === 'cancelled'
                        ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#27aae2] hover:text-[#27aae2]'
                    }`}
                    title="Share"
                  >
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 line-clamp-2">{selectedTicket.eventTitle}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">{selectedTicket.date}</p>

              {/* QR Code */}
              <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl mb-3 sm:mb-6 inline-block">
                <img
                  src={selectedTicket.qrCode}
                  alt="QR Code"
                  className="w-40 h-40 sm:w-56 sm:h-56 mx-auto"
                />
              </div>

              {/* Ticket ID */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2.5 sm:p-4 mb-3 sm:mb-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Ticket ID</p>
                <p className="text-xs sm:text-lg font-mono font-bold text-gray-900 dark:text-white break-all">{selectedTicket.ticketId}</p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2 sm:py-3 bg-[#27aae2] text-white rounded-lg sm:rounded-xl font-semibold hover:bg-[#1e8bb8] transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
