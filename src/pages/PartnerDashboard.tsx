import { Calendar, Users, DollarSign, Download, Zap, Home, Bell, UserPlus, QrCode, Award, Menu, X, ChevronRight, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Clock, Search, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

interface PartnerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PartnerDashboard({ onNavigate }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'attendees' | 'boost' | 'notifications' | 'roles' | 'scanner' | 'verification'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const financialStats = [
    { 
      label: 'Net Earnings', 
      value: 'KES 264,771', 
      icon: DollarSign, 
      color: 'from-[#27aae2] to-[#1e8bb8]', 
      subtext: 'After 7% commission',
      change: '+15%',
      isPositive: true
    },
    { 
      label: 'Amount Withdrawn', 
      value: 'KES 180,000', 
      icon: ArrowDownRight, 
      color: 'from-gray-700 to-gray-900', 
      subtext: 'Total withdrawn',
      change: '3 transactions',
      isPositive: false
    },
    { 
      label: 'Current Balance', 
      value: 'KES 84,771', 
      icon: Wallet, 
      color: 'from-green-500 to-green-600', 
      subtext: 'Available to withdraw',
      change: 'Instant withdrawal',
      isPositive: true
    },
    { 
      label: 'Pending Clearance', 
      value: 'KES 12,500', 
      icon: Clock, 
      color: 'from-orange-500 to-orange-600', 
      subtext: 'From recent events',
      change: 'Clears in 24hrs',
      isPositive: true
    }
  ];

  const withdrawals = [
    { id: '1', date: '2025-11-01', amount: 'KES 80,000', method: 'M-Pesa', phone: '***456789', status: 'completed' },
    { id: '2', date: '2025-10-25', amount: 'KES 50,000', method: 'Bank', account: '***1234', status: 'completed' },
    { id: '3', date: '2025-10-15', amount: 'KES 50,000', method: 'M-Pesa', phone: '***456789', status: 'completed' }
  ];

  const currentEvents = [
    {
      id: '1',
      title: 'Nairobi Tech Summit 2025',
      date: 'Nov 15, 2025',
      attendees: 847,
      revenue: 'KES 158,000',
      netEarnings: 'KES 146,940',
      ticketsSold: 847,
      totalTickets: 1000,
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'Startup Networking Mixer',
      date: 'Nov 20, 2025',
      attendees: 120,
      revenue: 'KES 46,500',
      netEarnings: 'KES 43,245',
      ticketsSold: 120,
      totalTickets: 150,
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'Wellness & Fitness Expo',
      date: 'Nov 25, 2025',
      attendees: 234,
      revenue: 'KES 72,300',
      netEarnings: 'KES 67,239',
      ticketsSold: 234,
      totalTickets: 300,
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const eventHistory = [
    {
      id: '4',
      title: 'Jazz Night Live',
      date: 'Oct 25, 2025',
      attendees: 189,
      revenue: 'KES 80,200',
      netEarnings: 'KES 74,586',
      ticketsSold: 189,
      totalTickets: 200,
      image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '5',
      title: 'Art Gallery Opening',
      date: 'Oct 18, 2025',
      attendees: 95,
      revenue: 'KES 35,000',
      netEarnings: 'KES 32,550',
      ticketsSold: 95,
      totalTickets: 100,
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'boost', label: 'Boost Event', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'roles', label: 'Assign Roles', icon: UserPlus },
    { id: 'scanner', label: 'Scan Tickets', icon: QrCode },
    { id: 'verification', label: 'Verification', icon: Award }
  ];

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
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Partner Portal</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id as 'dashboard' | 'events' | 'attendees' | 'boost' | 'notifications' | 'roles' | 'scanner' | 'verification');
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-[#27aae2] text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {/* Top Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-sm">
            <div className="px-2 sm:px-4 lg:px-8 py-2 sm:py-3 md:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Section - Menu & Title */}
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="hidden sm:block">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      {menuItems.find(item => item.id === activeTab)?.label}
                    </h1>
                  </div>
                </div>

                {/* Center Section - Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events, attendees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Section - Actions & Account */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {/* Account Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Tech Hub Africa</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Partner Account</p>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Tech Hub Africa</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">partner@techhub.com</p>
                        </div>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3">
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                          <button 
                            onClick={() => onNavigate('landing')}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Search Bar */}
              <div className="mt-2 md:hidden">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 pt-[7.5rem] sm:pt-32 md:pt-20 lg:pt-24">
            {activeTab === 'dashboard' && (
              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                {/* Financial Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {financialStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          {stat.change && (
                            <span className={`text-[9px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-0.5 rounded-full ${
                              stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {stat.change}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mb-0.5">{stat.label}</p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-0.5">{stat.value}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">{stat.subtext}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Withdraw & Statement Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xs sm:text-sm md:text-base font-bold mb-0.5">Withdraw Funds</h3>
                        <p className="text-blue-100 text-[10px] sm:text-xs">Instant to M-Pesa or Bank</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </div>
                  </button>
                  <button className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg hover:border-[#27aae2] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white mb-0.5">Download Statement</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">PDF or Excel format</p>
                      </div>
                      <Download className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700 dark:text-gray-300" />
                    </div>
                  </button>
                </div>

                {/* Recent Withdrawals */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">Recent Withdrawals</h3>
                    <button className="text-[#27aae2] hover:text-[#1e8bb8] font-semibold text-[10px] sm:text-xs">View All</button>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-1.5 sm:p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#27aae2]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-[10px] sm:text-xs truncate">{withdrawal.method}</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 truncate">
                              {withdrawal.phone || withdrawal.account} • {withdrawal.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-1.5">
                          <p className="font-bold text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">{withdrawal.amount}</p>
                          <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                            {withdrawal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Events Slideshow */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">Current Events</h3>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {currentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="group cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="relative h-20 sm:h-24">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-green-500 text-white px-1 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold">
                            ACTIVE
                          </div>
                        </div>
                        <div className="p-1.5 sm:p-2">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-1 text-[9px] sm:text-[10px]">{event.title}</h4>
                          <p className="text-[8px] sm:text-[9px] text-gray-600 dark:text-gray-400 mb-1">{event.date}</p>
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                              <span className="text-gray-600 dark:text-gray-400">Earnings</span>
                              <span className="font-bold text-green-600 text-[7px] sm:text-[8px]">{event.netEarnings}</span>
                            </div>
                            <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                              <span className="text-gray-600 dark:text-gray-400">Attendees</span>
                              <span className="font-semibold dark:text-white">{event.attendees}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-0.5 sm:h-1">
                              <div
                                className="bg-[#27aae2] h-0.5 sm:h-1 rounded-full"
                                style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-[7px] sm:text-[8px] text-gray-600 dark:text-gray-400 text-right">
                              {event.ticketsSold}/{event.totalTickets} sold
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events History Slideshow */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">Events History</h3>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {eventHistory.map((event) => (
                      <div
                        key={event.id}
                        className="group cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="relative h-20 sm:h-24">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-gray-500 text-white px-1 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold">
                            DONE
                          </div>
                        </div>
                        <div className="p-1.5 sm:p-2">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-1 text-[9px] sm:text-[10px]">{event.title}</h4>
                          <p className="text-[8px] sm:text-[9px] text-gray-600 dark:text-gray-400 mb-1">{event.date}</p>
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                              <span className="text-gray-600 dark:text-gray-400">Earnings</span>
                              <span className="font-bold text-green-600 text-[7px] sm:text-[8px]">{event.netEarnings}</span>
                            </div>
                            <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                              <span className="text-gray-600 dark:text-gray-400">Attendees</span>
                              <span className="font-semibold dark:text-white">{event.attendees}</span>
                            </div>
                            <button className="w-full py-0.5 sm:py-1 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 text-[#27aae2] rounded font-semibold hover:bg-[#27aae2]/20 dark:hover:bg-[#27aae2]/30 transition-colors text-[8px] sm:text-[9px]">
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <Calendar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Events Management</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Edit events, manage tickets, and update hosts</p>
              </div>
            )}

            {activeTab === 'attendees' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <Users className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Attendees Demographics</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">View attendee details and download reports</p>
              </div>
            )}

            {activeTab === 'boost' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <Zap className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Boost Your Events</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Increase visibility and reach more attendees</p>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <Bell className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Notification Settings</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your notification preferences</p>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <UserPlus className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Assign Roles</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage team members and promotional agents</p>
              </div>
            )}

            {activeTab === 'scanner' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <QrCode className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Scan Tickets</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Verify attendee tickets at your events</p>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <Award className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Partner Verification</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Track your progress to become NIKO VERIFIED</p>
              </div>
            )}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
