import { Calendar, Users, Zap, Home, Bell, UserPlus, QrCode, Award, Menu, X, Search, User, Settings as SettingsIcon, LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Overview from '../components/partnerDashboard/Overview';
import MyEvents from '../components/partnerDashboard/MyEvents';
import Attendees from '../components/partnerDashboard/Attendees';
import BoostEvent from '../components/partnerDashboard/BoostEvent';
import NotificationSettings from '../components/partnerDashboard/NotificationSettings';
import Notifications from '../components/partnerDashboard/Notifications';
import AssignRoles from '../components/partnerDashboard/AssignRoles';
import TicketScanner from '../components/partnerDashboard/TicketScanner';
import PartnerVerification from '../components/partnerDashboard/PartnerVerification';
import Settings from '../components/partnerDashboard/Settings';
import MyProfile from '../components/partnerDashboard/MyProfile';
import CreateEvent from '../components/partnerDashboard/CreateEvent';
import WithdrawFunds from '../components/partnerDashboard/WithdrawFunds';
import { getPartner, getPartnerProfile, logoutPartner, getPartnerToken } from '../services/partnerService';

interface PartnerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PartnerDashboard({ onNavigate }: PartnerDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'attendees' | 'boost' | 'notifications' | 'roles' | 'scanner' | 'verification' | 'settings' | 'profile'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const [partnerData, setPartnerData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = getPartnerToken();
    if (!token) {
      navigate('/');
      return;
    }
    setIsAuthorized(true);
    
    const fetchPartnerData = async () => {
      try {
        // Get from localStorage first (fast)
        const cachedPartner = getPartner();
        if (cachedPartner) {
          setPartnerData(cachedPartner);
        }

        // Then fetch fresh data
        const response = await getPartnerProfile();
        if (response) {
          setPartnerData(response.partner || response);
        }
      } catch (err: any) {
        console.error('Error fetching partner data:', err);
        // If error fetching, might be invalid token, redirect to login
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized') || err?.message?.includes('Not authenticated')) {
          logoutPartner();
          navigate('/');
          return;
        }
        // Fallback to localStorage if API fails
        const cachedPartner = getPartner();
        if (cachedPartner) {
          setPartnerData(cachedPartner);
        }
      }
    };

    fetchPartnerData();
  }, [navigate]);

  const menuItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'boost', label: 'Boost Event', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'roles', label: 'Assign Roles', icon: UserPlus },
    { id: 'scanner', label: 'Scan Tickets', icon: QrCode },
    { id: 'verification', label: 'Partner Verification', icon: Award }
  ];

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  // Show loading or redirect if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
                          setActiveTab(item.id as typeof activeTab);
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
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  
                  {/* Account Menu */}
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                    >
                      {partnerData?.logo ? (
                        <img 
                          src={partnerData.logo.startsWith('http') ? partnerData.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/${partnerData.logo.replace(/^\/+/, '')}`}
                          alt={partnerData.business_name}
                          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                        </div>
                      )}
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {partnerData?.business_name || 'Partner Account'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {partnerData?.email || 'Loading...'}
                        </p>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {partnerData?.business_name || 'Partner Account'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {partnerData?.email || 'Loading...'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveTab('profile');
                            setAccountMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('settings');
                            setAccountMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                          <button 
                            onClick={() => {
                              logoutPartner();
                              navigate('/');
                            }}
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
            {activeTab === 'overview' && <Overview onWithdrawClick={() => setWithdrawOpen(true)} />}
            {activeTab === 'events' && (
              <MyEvents 
                onCreateEvent={() => setCreateEventOpen(true)}
                key={activeTab} // Force re-render when tab changes
              />
            )}
            {activeTab === 'attendees' && <Attendees />}
            {activeTab === 'boost' && <BoostEvent />}
            {activeTab === 'notifications' && <Notifications />}
            {activeTab === 'roles' && <AssignRoles />}
            {activeTab === 'scanner' && <TicketScanner />}
            {activeTab === 'verification' && <PartnerVerification />}
            {activeTab === 'settings' && <Settings onNavigate={onNavigate} />}
            {activeTab === 'profile' && <MyProfile />}
          </div>
        </main>

        {/* Create Event Modal */}
        <CreateEvent 
          isOpen={createEventOpen} 
          onClose={() => setCreateEventOpen(false)}
          onEventCreated={() => {
            // Force refresh events by re-mounting the component
            // This is handled by the key prop on MyEvents
            if (activeTab === 'events') {
              // Trigger a re-render
              setCreateEventOpen(false);
            }
          }}
        />

        {/* Withdraw Funds Modal */}
        <WithdrawFunds 
          isOpen={withdrawOpen} 
          onClose={() => setWithdrawOpen(false)}
          availableBalance={36000}
        />
      </div>
      </div>
    </div>
  );
}
