import { TrendingUp, DollarSign, Wallet, ArrowDownRight, Calendar, Users, Eye, Download, ArrowUpRight, ChevronLeft, ChevronRight, X, MapPin, Clock, Tag, Ticket, Sparkles, Globe, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPartnerEvents, getPartnerToken } from '../../services/partnerService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { createPortal } from 'react-dom';

interface OverviewProps {
  onWithdrawClick?: () => void;
}

interface EventDetails {
  id: number;
  title: string;
  description: string;
  poster_image?: string;
  start_date: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  is_online: boolean;
  online_link?: string;
  category?: { name: string };
  interests?: Array<{ name: string }>;
  ticket_types?: Array<{ name: string; price: number; quantity_sold: number; quantity_total?: number }>;
  attendee_count: number;
  total_tickets_sold: number;
  view_count: number;
  revenue?: number;
  status: string;
}

export default function Overview({ onWithdrawClick }: OverviewProps) {
  const [currentEventsPage, setCurrentEventsPage] = useState(0);
  const [historyEventsPage, setHistoryEventsPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const eventsPerPage = 5;

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current events (upcoming + ongoing)
      const currentResponse = await getPartnerEvents('upcoming');
      const ongoingResponse = await getPartnerEvents('ongoing');
      
      const upcoming = currentResponse.events || [];
      const ongoing = ongoingResponse.events || [];
      const allCurrent = [...upcoming, ...ongoing];
      
      // Format current events
      const formattedCurrent = allCurrent.map((event: any) => ({
        id: event.id,
        title: event.title,
        image: event.poster_image 
          ? (event.poster_image.startsWith('http') ? event.poster_image : `${API_BASE_URL}/${event.poster_image.replace(/^\/+/, '')}`)
          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
        date: new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        attendees: `${event.attendee_count || 0}/${event.total_tickets_sold || 0}`,
        ticketsSold: event.total_tickets_sold || 0,
        totalTickets: event.total_tickets_sold || 0, // Will calculate from ticket types if needed
        grossRevenue: `Ksh ${((event.revenue || 0) / 0.93).toLocaleString()}`,
        netEarnings: `Ksh ${(event.revenue || 0).toLocaleString()}`,
        views: (event.view_count || 0).toLocaleString(),
        status: 'active',
        rawEvent: event
      }));
      
      setCurrentEvents(formattedCurrent);
      
      // Fetch past events
      const pastResponse = await getPartnerEvents('past');
      const pastEvents = pastResponse.events || [];
      
      // Format past events
      const formattedPast = pastEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        image: event.poster_image 
          ? (event.poster_image.startsWith('http') ? event.poster_image : `${API_BASE_URL}/${event.poster_image.replace(/^\/+/, '')}`)
          : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
        date: new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        attendees: `${event.attendee_count || 0}`,
        grossRevenue: `Ksh ${((event.revenue || 0) / 0.93).toLocaleString()}`,
        netEarnings: `Ksh ${(event.revenue || 0).toLocaleString()}`,
        views: (event.view_count || 0).toLocaleString(),
        status: 'completed',
        rawEvent: event
      }));
      
      setEventHistory(formattedPast);
    } catch (err) {
      console.error('Error fetching overview data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (event: any) => {
    try {
      const token = getPartnerToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(event.id)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      setSelectedEvent(data.event || data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  // Financial Stats - Net earnings after 7% deduction (using 0 for now)
  const financialStats = [
    {
      label: 'Net Earnings',
      value: 'Ksh 0',
      subtext: 'After 7% deduction',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      change: '+0%',
      isPositive: true
    },
    {
      label: 'Amount Withdrawn',
      value: 'Ksh 0',
      subtext: 'Total withdrawals',
      icon: ArrowDownRight,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Current Balance',
      value: 'Ksh 0',
      subtext: 'Available to withdraw',
      icon: Wallet,
      color: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Gross Revenue',
      value: 'Ksh 0',
      subtext: 'Before deductions',
      icon: DollarSign,
      color: 'from-orange-500 to-red-600',
    }
  ];

  // Recent Withdrawals (empty for now)
  const withdrawals: any[] = [];

  const currentEventsSlides = [];
  for (let i = 0; i < currentEvents.length; i += eventsPerPage) {
    currentEventsSlides.push(currentEvents.slice(i, i + eventsPerPage));
  }

  const historyEventsSlides = [];
  for (let i = 0; i < eventHistory.length; i += eventsPerPage) {
    historyEventsSlides.push(eventHistory.slice(i, i + eventsPerPage));
  }

  return (
    <div className="space-y-6">
      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    stat.isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={onWithdrawClick}
          className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-bold mb-1">Withdraw Funds</h3>
              <p className="text-blue-100 text-sm">Instant to M-Pesa or Bank</p>
            </div>
            <ArrowUpRight className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </button>
        
        <button className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-[#27aae2] transition-all group">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Download Statement</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">PDF or Excel format</p>
            </div>
            <Download className="w-8 h-8 text-gray-700 dark:text-gray-300 group-hover:translate-y-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Withdrawals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Withdrawals</h3>
          <button className="text-[#27aae2] hover:text-[#1e8bb8] font-semibold text-sm">View All</button>
        </div>
        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No withdrawals yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Your withdrawal history will appear here</p>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center">
                    {withdrawal.type === 'mpesa' ? (
                      <Wallet className="w-6 h-6 text-[#27aae2]" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-[#27aae2]" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{withdrawal.method}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {withdrawal.phone || withdrawal.account} • {withdrawal.date} at {withdrawal.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{withdrawal.amount}</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full font-semibold">
                    {withdrawal.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Events Slideshow */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Current Events</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentEventsPage(Math.max(0, currentEventsPage - 1))}
              disabled={currentEventsPage === 0}
              className={`p-2 rounded-lg ${
                currentEventsPage === 0
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentEventsPage + 1} / {currentEventsSlides.length}
            </span>
            <button
              onClick={() => setCurrentEventsPage(Math.min(currentEventsSlides.length - 1, currentEventsPage + 1))}
              disabled={currentEventsPage === currentEventsSlides.length - 1}
              className={`p-2 rounded-lg ${
                currentEventsPage === currentEventsSlides.length - 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
          </div>
        ) : currentEventsSlides.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">No current events</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Your upcoming and ongoing events will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {currentEventsSlides[currentEventsPage]?.map((event) => (
            <div
              key={event.id}
              className="group cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative h-32">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ACTIVE
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm">{event.title}</h4>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  {event.date}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Net Earnings</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{event.netEarnings}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Gross Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{event.grossRevenue}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="w-3 h-3 mr-1" />
                      <span>Attendees</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{event.attendees}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>Views</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{event.views}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-[#27aae2] h-2 rounded-full transition-all"
                      style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                    {event.ticketsSold}/{event.totalTickets} tickets sold
                  </p>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Events History Slideshow */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Events History</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHistoryEventsPage(Math.max(0, historyEventsPage - 1))}
              disabled={historyEventsPage === 0}
              className={`p-2 rounded-lg ${
                historyEventsPage === 0
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {historyEventsPage + 1} / {historyEventsSlides.length}
            </span>
            <button
              onClick={() => setHistoryEventsPage(Math.min(historyEventsSlides.length - 1, historyEventsPage + 1))}
              disabled={historyEventsPage === historyEventsSlides.length - 1}
              className={`p-2 rounded-lg ${
                historyEventsPage === historyEventsSlides.length - 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
          </div>
        ) : historyEventsSlides.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">No past events</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Your completed events will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {historyEventsSlides[historyEventsPage]?.map((event) => (
            <div
              key={event.id}
              className="group cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative h-32">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  COMPLETED
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm">{event.title}</h4>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  {event.date}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Net Earnings</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{event.netEarnings}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Gross Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{event.grossRevenue}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="w-3 h-3 mr-1" />
                      <span>Attendees</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{event.attendees}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>Total Views</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{event.views}</span>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(event)}
                    className="w-full py-2 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 text-[#27aae2] rounded-lg font-semibold hover:bg-[#27aae2]/20 dark:hover:bg-[#27aae2]/30 transition-colors text-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💰 <strong>Note:</strong> All earnings shown are net amounts after 7% platform deduction. Withdrawals are processed instantly via M-Pesa Daraja API split payments. Your funds dashboard is updated in real-time for 100% accuracy.
        </p>
      </div>

      {/* Event Details Modal */}
      {isDetailsModalOpen && selectedEvent && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80 backdrop-blur-sm"
              onClick={() => setIsDetailsModalOpen(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Event Image */}
              {selectedEvent.poster_image && (
                <div className="relative h-64 w-full">
                  <img
                    src={selectedEvent.poster_image.startsWith('http') ? selectedEvent.poster_image : `${API_BASE_URL}/${selectedEvent.poster_image.replace(/^\/+/, '')}`}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                    <div className="flex items-center space-x-4 text-white/90 text-sm">
                      {selectedEvent.category && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          <span>{selectedEvent.category.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedEvent.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                {!selectedEvent.poster_image && (
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedEvent.title}</h2>
                )}

                {/* Event Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-[#27aae2]" />
                      <span className="font-semibold text-gray-900 dark:text-white">Date & Time</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(selectedEvent.start_date).toLocaleString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                    {selectedEvent.end_date && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Until {new Date(selectedEvent.end_date).toLocaleString('en-US', { 
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>

                  {selectedEvent.is_online ? (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {selectedEvent.online_link ? (
                          <Video className="w-5 h-5 text-[#27aae2]" />
                        ) : (
                          <Globe className="w-5 h-5 text-[#27aae2]" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-white">Location</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Online Event</p>
                      {selectedEvent.online_link && (
                        <a 
                          href={selectedEvent.online_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-[#27aae2] hover:underline mt-1 block"
                        >
                          {selectedEvent.online_link}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-[#27aae2]" />
                        <span className="font-semibold text-gray-900 dark:text-white">Venue</span>
                      </div>
                      {selectedEvent.venue_name && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEvent.venue_name}</p>
                      )}
                      {selectedEvent.venue_address && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedEvent.venue_address}</p>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-[#27aae2]" />
                      <span className="font-semibold text-gray-900 dark:text-white">Attendees</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEvent.attendee_count || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedEvent.total_tickets_sold || 0} tickets sold
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-[#27aae2]" />
                      <span className="font-semibold text-gray-900 dark:text-white">Views</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(selectedEvent.view_count || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About This Event</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Interests */}
                {selectedEvent.interests && selectedEvent.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Interests & Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.interests.map((interest: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 text-[#27aae2] rounded-full text-sm font-medium flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{interest.name || interest}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket Types */}
                {selectedEvent.ticket_types && selectedEvent.ticket_types.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ticket Types</h3>
                    <div className="space-y-2">
                      {selectedEvent.ticket_types.map((ticket: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Ticket className="w-5 h-5 text-[#27aae2]" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{ticket.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {ticket.quantity_sold || 0} sold
                                {ticket.quantity_total && ` / ${ticket.quantity_total} total`}
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            Ksh {parseFloat(ticket.price || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revenue Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Revenue</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      Ksh {((selectedEvent.revenue || 0) / 0.93).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Earnings</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      Ksh {(selectedEvent.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
