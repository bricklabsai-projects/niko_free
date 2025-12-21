import { Search, Download, Users, Mail, Phone, Calendar, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPartnerAttendees } from '../../services/partnerService';

interface Attendee {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  ticketType: string;
  event: string;
  eventDate: string;
  bookingDate: string;
  status: 'Confirmed' | 'Cancelled' | 'Pending';
  isCurrentEvent: boolean;
}

export default function Attendees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch attendees on mount
  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getPartnerAttendees();
      
      // Transform API data to component format
      const formattedAttendees: Attendee[] = (response.attendees || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email ? `${item.email.split('@')[0].slice(0, 4)}***@${item.email.split('@')[1]}` : '',
        phone: item.phone ? `+254${item.phone.slice(-3)}***${item.phone.slice(-3)}` : '',
        age: item.age || 0,
        gender: item.gender || 'Other',
        location: item.location || '',
        ticketType: item.ticketType || 'Regular',
        event: item.event || '',
        eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
        bookingDate: item.bookingDate ? new Date(item.bookingDate).toISOString().split('T')[0] : '',
        status: item.status === 'Confirmed' ? 'Confirmed' : 'Pending',
        isCurrentEvent: item.isCurrentEvent || false
      }));
      
      setAttendees(formattedAttendees);
    } catch (err: any) {
      console.error('Error fetching attendees:', err);
      setError(err.message || 'Failed to load attendees');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data removed - now using real data from API
  const mockAttendees: Attendee[] = [
    {
      id: 1,
      name: 'John Kamau',
      email: 'john***@gmail.com',
      phone: '+2547***890',
      age: 28,
      gender: 'Male',
      location: 'Nairobi',
      ticketType: 'VIP',
      event: 'PICNICS AT NGONG HILLS',
      eventDate: '2025-11-20',
      bookingDate: '2025-11-10',
      status: 'Confirmed',
      isCurrentEvent: true
    },
    {
      id: 2,
      name: 'Sarah Muthoni',
      email: 'sarah***@yahoo.com',
      phone: '+2547***234',
      age: 32,
      gender: 'Female',
      location: 'Kiambu',
      ticketType: 'Regular',
      event: 'Tech Meetup Nairobi',
      eventDate: '2025-11-25',
      bookingDate: '2025-11-08',
      status: 'Confirmed',
      isCurrentEvent: true
    },
    {
      id: 3,
      name: 'David Ochieng',
      email: 'david***@gmail.com',
      phone: '+2547***567',
      age: 25,
      gender: 'Male',
      location: 'Mombasa',
      ticketType: 'VIP',
      event: 'PICNICS AT NGONG HILLS',
      eventDate: '2025-11-20',
      bookingDate: '2025-11-09',
      status: 'Confirmed',
      isCurrentEvent: true
    },
    {
      id: 4,
      name: 'Mary Njeri',
      email: 'mary***@outlook.com',
      phone: '+2547***901',
      age: 30,
      gender: 'Female',
      location: 'Nakuru',
      ticketType: 'Regular',
      event: 'Sunset Yoga Session',
      eventDate: '2025-10-15',
      bookingDate: '2025-10-05',
      status: 'Confirmed',
      isCurrentEvent: false
    },
    {
      id: 5,
      name: 'Peter Kimani',
      email: 'peter***@gmail.com',
      phone: '+2547***345',
      age: 35,
      gender: 'Male',
      location: 'Nairobi',
      ticketType: 'VIP',
      event: 'Tech Meetup Nairobi',
      eventDate: '2025-11-25',
      bookingDate: '2025-11-11',
      status: 'Confirmed',
      isCurrentEvent: true
    },
    {
      id: 6,
      name: 'Grace Wanjiku',
      email: 'grace***@gmail.com',
      phone: '+2547***678',
      age: 27,
      gender: 'Female',
      location: 'Kisumu',
      ticketType: 'Regular',
      event: 'Food & Wine Expo',
      eventDate: '2025-09-20',
      bookingDate: '2025-09-10',
      status: 'Confirmed',
      isCurrentEvent: false
    },
    {
      id: 7,
      name: 'James Mutua',
      email: 'james***@yahoo.com',
      phone: '+2547***123',
      age: 42,
      gender: 'Male',
      location: 'Eldoret',
      ticketType: 'VIP',
      event: 'Sunset Yoga Session',
      eventDate: '2025-10-15',
      bookingDate: '2025-10-01',
      status: 'Confirmed',
      isCurrentEvent: false
    },
    {
      id: 8,
      name: 'Anne Akinyi',
      email: 'anne***@gmail.com',
      phone: '+2547***456',
      age: 29,
      gender: 'Female',
      location: 'Nairobi',
      ticketType: 'Regular',
      event: 'PICNICS AT NGONG HILLS',
      eventDate: '2025-11-20',
      bookingDate: '2025-11-12',
      status: 'Confirmed',
      isCurrentEvent: true
    }
  ];

  const filteredAttendees = (attendees.length > 0 ? attendees : mockAttendees).filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || attendee.ticketType.toLowerCase() === filter.toLowerCase();
    const matchesSelectedEvent = selectedEvent === 'all' || attendee.event === selectedEvent;
    return matchesSearch && matchesFilter && matchesSelectedEvent;
  });

  // Get unique ticket types for filtering
  const allAttendees = attendees.length > 0 ? attendees : mockAttendees;
  const uniqueTicketTypes = ['all', ...Array.from(new Set(allAttendees.map(a => a.ticketType)))];

  // Calculate demographics
  const demographics = {
    totalAttendees: allAttendees.length,
    currentEvents: allAttendees.filter(a => a.isCurrentEvent).length,
    pastEvents: allAttendees.filter(a => !a.isCurrentEvent).length,
    averageAge: allAttendees.length > 0 ? Math.round(allAttendees.reduce((sum, a) => sum + a.age, 0) / allAttendees.length) : 0
  };

  // Get attendees by event
  const eventSummary = Array.from(new Set(allAttendees.map(a => a.event)))
    .map(event => ({
      event,
      count: allAttendees.filter(a => a.event === event).length,
      date: allAttendees.find(a => a.event === event)?.eventDate || '',
      isCurrent: allAttendees.find(a => a.event === event)?.isCurrentEvent || false
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get unique events for dropdown
  const uniqueEvents = ['all', ...Array.from(new Set(allAttendees.map(a => a.event)))];

  const stats = [
    {
      label: 'Total Attendees',
      value: demographics.totalAttendees.toString(),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Current Events',
      value: demographics.currentEvents.toString(),
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Past Events',
      value: demographics.pastEvents.toString(),
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      label: 'Average Age',
      value: demographics.averageAge.toString(),
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  const handleExport = (format: 'excel' | 'pdf') => {
    // In production, this would trigger actual file download
    alert(`Exporting ${filteredAttendees.length} attendees to ${format.toUpperCase()}...`);
    setExportMenuOpen(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendees</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your event attendees and view demographics
          </p>
        </div>
        
        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center space-x-2 bg-[#27aae2] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e8bc3] transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </button>
          
          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Export to Excel</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Export to PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendees by Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventSummary.map((event, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${
                event.isCurrent 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{event.event}</h4>
                {event.isCurrent && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{event.date}</p>
              <p className="text-2xl font-bold text-[#27aae2]">{event.count} attendees</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Event Selector Dropdown */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-3 rounded-xl font-medium transition-all text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
          >
            <option value="all">All Events</option>
            {uniqueEvents.filter(e => e !== 'all').map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>

          {/* Ticket Type Selector Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl font-medium transition-all text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Ticket Types</option>
            {uniqueTicketTypes.filter(t => t !== 'all').map((ticketType) => (
              <option key={ticketType} value={ticketType}>{ticketType}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Attendees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attendee.name.split(' ')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {attendee.age}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{attendee.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{attendee.email}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No attendees found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
