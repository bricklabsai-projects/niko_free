import { Users, Calendar, DollarSign, CheckCircle, XCircle, Clock, Ban, Settings, Menu, X, Search, User, LogOut, Shield, FileText, BarChart3, Mail, MessageSquare, Building2, Phone, MapPin, Globe, Loader, TrendingUp, Wallet, Zap, AlertCircle, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'events' | 'users' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resendingCredentials, setResendingCredentials] = useState<number | null>(null);
  const [resendMessage, setResendMessage] = useState<{ partnerId: number; message: string } | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);
  const [approvedPartners, setApprovedPartners] = useState<any[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedRevenueType, setSelectedRevenueType] = useState<string | null>(null);
  const [revenueChartData, setRevenueChartData] = useState<any>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [rejectedPartners, setRejectedPartners] = useState<any[]>([]);
  const [isLoadingRejected, setIsLoadingRejected] = useState(false);
  const [isUnrejectModalOpen, setIsUnrejectModalOpen] = useState(false);
  const [selectedPartnerForUnreject, setSelectedPartnerForUnreject] = useState<any | null>(null);
  const [unrejectReason, setUnrejectReason] = useState('');
  const [isUnrejecting, setIsUnrejecting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedUserForFlag, setSelectedUserForFlag] = useState<any | null>(null);
  const [flagNotes, setFlagNotes] = useState('');
  const [isFlagging, setIsFlagging] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inviteAdminEmail, setInviteAdminEmail] = useState('');
  const [isInvitingAdmin, setIsInvitingAdmin] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleViewPartnerDetails = async (partnerId: number) => {
    setIsLoadingPartner(true);
    setIsPartnerModalOpen(true);
    setSelectedPartner(null);
    
    try {
      const token = localStorage.getItem('niko_free_admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.admin.partner(partnerId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch partner details');
      }

      setSelectedPartner(data.partner || data);
    } catch (error: any) {
      console.error('Error fetching partner details:', error);
      alert(error.message || 'Failed to load partner details');
      setIsPartnerModalOpen(false);
    } finally {
      setIsLoadingPartner(false);
    }
  };

  const handleResendCredentials = async (partnerId: number) => {
    setResendingCredentials(partnerId);
    setResendMessage(null);
    
    try {
      const token = localStorage.getItem('niko_free_admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.admin.resendPartnerCredentials(partnerId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend credentials');
      }

      setResendMessage({
        partnerId,
        message: data.message || 'Credentials have been sent to partner via email and SMS'
      });

      // Clear message after 5 seconds
      setTimeout(() => {
        setResendMessage(null);
      }, 5000);
    } catch (error: any) {
      setResendMessage({
        partnerId,
        message: error.message || 'Failed to resend credentials. Please try again.'
      });
    } finally {
      setResendingCredentials(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(1)}K`;
    }
    return `KES ${amount.toLocaleString()}`;
  };

  const stats = dashboardStats ? [
    { label: 'Total Users', value: dashboardStats.total_users?.toLocaleString() || '0', icon: Users, color: 'from-[#27aae2] to-[#1e8bb8]', change: `${dashboardStats.users_change >= 0 ? '+' : ''}${dashboardStats.users_change?.toFixed(1) || 0}% this month` },
    { label: 'Active Partners', value: dashboardStats.total_partners?.toLocaleString() || '0', icon: Users, color: 'from-green-500 to-green-600', change: `${dashboardStats.partners_change >= 0 ? '+' : ''}${dashboardStats.partners_change?.toFixed(1) || 0}% this month` },
    { label: 'Total Events', value: dashboardStats.total_events?.toLocaleString() || '0', icon: Calendar, color: 'from-gray-700 to-gray-900', change: `${dashboardStats.events_change >= 0 ? '+' : ''}${dashboardStats.events_change || 0} this month` },
    { label: 'Total Revenue', value: formatCurrency(dashboardStats.total_revenue || 0), icon: DollarSign, color: 'from-orange-500 to-orange-600', change: 'All sources' }
  ] : [
    { label: 'Total Users', value: '...', icon: Users, color: 'from-[#27aae2] to-[#1e8bb8]', change: 'Loading...' },
    { label: 'Active Partners', value: '...', icon: Users, color: 'from-green-500 to-green-600', change: 'Loading...' },
    { label: 'Total Events', value: '...', icon: Calendar, color: 'from-gray-700 to-gray-900', change: 'Loading...' },
    { label: 'Total Revenue', value: '...', icon: DollarSign, color: 'from-orange-500 to-orange-600', change: 'Loading...' }
  ];

  const pendingPartners = [
    {
      id: '1',
      name: 'Tech Hub Africa',
      email: 'contact@techhub.africa',
      category: 'Technology',
      submittedDate: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Fitness Pro Kenya',
      email: 'info@fitnesspro.ke',
      category: 'Sports & Fitness',
      submittedDate: '5 hours ago',
      status: 'pending'
    }
  ];

  const pendingEvents = [
    {
      id: '1',
      title: 'Nairobi Innovation Week',
      partner: 'Tech Hub Africa',
      category: 'Technology',
      date: 'Nov 15, 2025',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Marathon for Health',
      partner: 'Fitness Pro Kenya',
      category: 'Sports',
      date: 'Nov 10, 2025',
      status: 'pending'
    }
  ];

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoadingStats(true);
      try {
        const token = localStorage.getItem('niko_free_admin_token');
        if (!token) {
          console.error('No admin token found');
          setIsLoadingStats(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.admin.dashboard, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard stats');
        }

        setDashboardStats(data.stats || {});
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (activeTab === 'overview') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Fetch revenue chart data when a revenue card is clicked
  useEffect(() => {
    const fetchRevenueChart = async () => {
      if (!selectedRevenueType) {
        setRevenueChartData(null);
        return;
      }

      setIsLoadingChart(true);
      try {
        const token = localStorage.getItem('niko_free_admin_token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(API_ENDPOINTS.admin.revenueCharts(selectedRevenueType, '30_days'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch chart data');
        }

        setRevenueChartData(data);
      } catch (error: any) {
        console.error('Error fetching revenue chart:', error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchRevenueChart();
  }, [selectedRevenueType]);

  // Fetch approved partners from API
  useEffect(() => {
    const fetchApprovedPartners = async () => {
      if (activeTab !== 'partners') return;
      
      setIsLoadingPartners(true);
      try {
        const token = localStorage.getItem('niko_free_admin_token');
        if (!token) {
          console.error('No admin token found');
          setIsLoadingPartners(false);
          return;
        }

        const response = await fetch(`${API_ENDPOINTS.admin.partners}?status=approved`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch partners');
        }

        // Transform API data to match component expectations
        const formattedPartners = (data.partners || []).map((partner: any) => ({
          id: partner.id,
          name: partner.business_name || partner.name,
          email: partner.email,
          totalEvents: partner.total_events || 0,
          totalRevenue: partner.total_revenue ? `KES ${partner.total_revenue.toLocaleString()}` : 'KES 0',
          rating: 4.5, // Default rating if not available
          status: partner.status || 'approved'
        }));

        console.log('Fetched approved partners:', formattedPartners);
        setApprovedPartners(formattedPartners);
      } catch (error: any) {
        console.error('Error fetching approved partners:', error);
        // Fallback to empty array on error
        setApprovedPartners([]);
      } finally {
        setIsLoadingPartners(false);
      }
    };

    fetchApprovedPartners();
  }, [activeTab]);

  // Fetch rejected partners from API
  useEffect(() => {
    const fetchRejectedPartners = async () => {
      if (activeTab !== 'partners') return;
      
      setIsLoadingRejected(true);
      try {
        const token = localStorage.getItem('niko_free_admin_token');
        if (!token) {
          console.error('No admin token found');
          setIsLoadingRejected(false);
          return;
        }

        const response = await fetch(`${API_ENDPOINTS.admin.partners}?status=rejected`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch rejected partners');
        }

        // Transform API data
        const formattedPartners = (data.partners || []).map((partner: any) => ({
          id: partner.id,
          name: partner.business_name || partner.name,
          email: partner.email,
          category: partner.category?.name || 'N/A',
          rejectionReason: partner.rejection_reason || 'No reason provided',
          submittedDate: partner.created_at ? new Date(partner.created_at).toLocaleDateString() : 'N/A',
          status: partner.status || 'rejected'
        }));

        setRejectedPartners(formattedPartners);
      } catch (error: any) {
        console.error('Error fetching rejected partners:', error);
        setRejectedPartners([]);
      } finally {
        setIsLoadingRejected(false);
      }
    };

    fetchRejectedPartners();
  }, [activeTab]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'users') return;
      
      setIsLoadingUsers(true);
      try {
        const token = localStorage.getItem('niko_free_admin_token');
        if (!token) {
          console.error('No admin token found');
          setIsLoadingUsers(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.admin.users, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch users');
        }

        setUsers(data.users || []);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

  const handleFlagUser = async () => {
    if (!selectedUserForFlag || !flagNotes.trim()) {
      alert('Please provide notes when flagging a user');
      return;
    }

    setIsFlagging(true);
    try {
      const token = localStorage.getItem('niko_free_admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.admin.flagUser(selectedUserForFlag.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: flagNotes.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to flag user');
      }

      // Refresh users list
      const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        setUsers(usersData.users || []);
      }

      setIsFlagModalOpen(false);
      setSelectedUserForFlag(null);
      setFlagNotes('');
      alert('User flagged successfully');
    } catch (error: any) {
      console.error('Error flagging user:', error);
      alert(error.message || 'Failed to flag user. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('niko_free_admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.admin.deleteUser(selectedUserForDelete.id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Refresh users list
      const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        setUsers(usersData.users || []);
      }

      setIsDeleteModalOpen(false);
      setSelectedUserForDelete(null);
      alert('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnrejectPartner = async () => {
    if (!selectedPartnerForUnreject || !unrejectReason.trim()) {
      alert('Please provide a reason for unrejecting this partner');
      return;
    }

    setIsUnrejecting(true);
    try {
      const token = localStorage.getItem('niko_free_admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.admin.unrejectPartner(selectedPartnerForUnreject.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: unrejectReason.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unreject partner');
      }

      // Refresh rejected partners list
      const rejectedResponse = await fetch(`${API_ENDPOINTS.admin.partners}?status=rejected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const rejectedData = await rejectedResponse.json();
      if (rejectedResponse.ok) {
        const formattedPartners = (rejectedData.partners || []).map((partner: any) => ({
          id: partner.id,
          name: partner.business_name || partner.name,
          email: partner.email,
          category: partner.category?.name || 'N/A',
          rejectionReason: partner.rejection_reason || 'No reason provided',
          submittedDate: partner.created_at ? new Date(partner.created_at).toLocaleDateString() : 'N/A',
          status: partner.status || 'rejected'
        }));
        setRejectedPartners(formattedPartners);
      }

      // Close modal and reset
      setIsUnrejectModalOpen(false);
      setSelectedPartnerForUnreject(null);
      setUnrejectReason('');
      alert('Partner account has been reopened. They will receive an email with the reason.');
    } catch (error: any) {
      console.error('Error unrejecting partner:', error);
      alert(error.message || 'Failed to unreject partner. Please try again.');
    } finally {
      setIsUnrejecting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
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
      
      <div className="relative z-10 flex min-h-screen w-full">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Admin Portal</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">System Control</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('partners')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'partners'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Partners</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'events'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              <button
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </button>

              <button
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <DollarSign className="w-5 h-5" />
                <span>Revenue</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left - Menu & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'partners' && 'Partner Management'}
                    {activeTab === 'events' && 'Event Management'}
                    {activeTab === 'users' && 'User Management'}
                    {activeTab === 'settings' && 'Platform Settings'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage platform operations</p>
                </div>
              </div>

              {/* Center - Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Right - Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <img
                    src="https://i.pravatar.cc/150?img=60"
                    alt="Admin"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">System Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">System Admin</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@nikofree.com</p>
                    </div>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button 
                        onClick={() => onNavigate('landing')}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
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
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                  </div>
                );
              })}
            </div>

            {/* Revenue Breakdown Cards - Always show, even if loading */}
            {isLoadingStats ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Breakdown</h3>
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-[#27aae2]" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading revenue data...</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Platform Fees Card */}
                <div
                  onClick={() => setSelectedRevenueType('platform_fees')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Platform Fees</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {dashboardStats ? formatCurrency(dashboardStats.platform_fees || 0) : 'KES 0'}
                  </p>
                  <p className="text-white/70 text-xs">7% commission from ticket sales</p>
                </div>

                {/* Withdrawal Fees Card */}
                <div
                  onClick={() => setSelectedRevenueType('withdrawal_fees')}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Withdrawal Fees</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {dashboardStats ? formatCurrency(dashboardStats.withdrawal_fees || 0) : 'KES 0'}
                  </p>
                  <p className="text-white/70 text-xs">Fees from partner withdrawals</p>
                </div>

                {/* Promotions Revenue Card */}
                <div
                  onClick={() => setSelectedRevenueType('promotions')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Promotions</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {dashboardStats ? formatCurrency(dashboardStats.promotion_revenue || 0) : 'KES 0'}
                  </p>
                  <p className="text-white/70 text-xs">Revenue from event promotions</p>
                </div>
              </div>
            </div>
            )}

            {/* Revenue Trend Chart (Keep existing) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Revenue trend chart will be displayed here</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Approvals</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    {pendingPartners.length + pendingEvents.length}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white">Partner Applications</p>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pendingPartners.length} pending</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('partners')}
                      className="text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium"
                    >
                      Review now →
                    </button>
                  </div>
                  <div className="p-4 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 border border-[#27aae2]/30 dark:border-[#27aae2]/40 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white">Event Submissions</p>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pendingEvents.length} pending</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium"
                    >
                      Review now →
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Partner approved', name: 'Creative Arts Kenya', time: '1 hour ago' },
                    { action: 'Event published', name: 'Jazz Night Live', time: '3 hours ago' },
                    { action: 'New user registered', name: 'John Doe', time: '5 hours ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.name}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-8">
            {/* Rejected Partners Section - Show First */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rejected Partner Applications</h2>
              {isLoadingRejected ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-[#27aae2]" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading rejected partners...</span>
                </div>
              ) : rejectedPartners.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No rejected partners found
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {rejectedPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                            <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-semibold">
                              REJECTED
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mt-3">
                            <span>{partner.email}</span>
                            <span>Category: {partner.category}</span>
                            <span>Rejected: {partner.submittedDate}</span>
                          </div>
                          {partner.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                              <p className="text-sm text-red-700 dark:text-red-400">
                                <strong>Reason:</strong> {partner.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap w-full lg:w-auto">
                          <button
                            onClick={() => {
                              setSelectedPartnerForUnreject(partner);
                              setIsUnrejectModalOpen(true);
                            }}
                            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 text-sm whitespace-nowrap"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Unreject</span>
                          </button>
                          <button 
                            onClick={() => handleViewPartnerDetails(Number(partner.id))}
                            className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all text-sm"
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

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Partner Applications</h2>
              <div className="space-y-4">
                {pendingPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{partner.email}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Category: {partner.category}</span>
                          <span>Submitted: {partner.submittedDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2">
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Partners</h2>
              {isLoadingPartners ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-[#27aae2]" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading partners...</span>
                </div>
              ) : approvedPartners.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No approved partners found
                </div>
              ) : (
              <div className="space-y-4">
                {approvedPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            ACTIVE
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mt-3">
                          <span>{partner.totalEvents} events</span>
                          <span>Revenue: {partner.totalRevenue}</span>
                          <span>Rating: {partner.rating}/5.0</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap w-full lg:w-auto items-center">
                        <button 
                          onClick={() => handleViewPartnerDetails(Number(partner.id))}
                          className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all text-sm whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleResendCredentials(Number(partner.id))}
                          disabled={resendingCredentials === Number(partner.id)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap min-w-[160px] justify-center"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{resendingCredentials === Number(partner.id) ? 'Sending...' : 'Resend Login Details'}</span>
                        </button>
                        <button className="px-4 py-2.5 border-2 border-red-200 dark:border-red-700 text-red-600 rounded-lg font-semibold hover:border-red-500 transition-all flex items-center space-x-2 text-sm whitespace-nowrap">
                          <Ban className="w-4 h-4" />
                          <span>Suspend</span>
                        </button>
                      </div>
                      {resendMessage && resendMessage.partnerId === Number(partner.id) && (
                        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-sm">
                          {resendMessage.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Event Approvals</h2>
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                        <span className="px-3 py-1 bg-[#27aae2]/20 text-[#27aae2] rounded-full text-xs font-semibold">
                          {event.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>By: {event.partner}</span>
                        <span>Date: {event.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-lg focus:ring-2 focus:ring-[#27aae2] focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-[#27aae2]" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No users found
              </div>
            ) : (
              <div className="space-y-4">
                {users
                  .filter((user) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      user.email?.toLowerCase().includes(query) ||
                      user.first_name?.toLowerCase().includes(query) ||
                      user.last_name?.toLowerCase().includes(query) ||
                      `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
                    );
                  })
                  .map((user) => (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </h3>
                            {!user.is_active && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-semibold">
                                FLAGGED
                              </span>
                            )}
                            {user.is_active && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-semibold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mt-3">
                            <span>{user.email}</span>
                            {user.phone_number && <span>{user.phone_number}</span>}
                            <span>
                              Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                            <span>
                              Last Active: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap w-full lg:w-auto">
                          {user.is_active ? (
                            <button
                              onClick={() => {
                                setSelectedUserForFlag(user);
                                setIsFlagModalOpen(true);
                              }}
                              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 text-sm"
                            >
                              <Ban className="w-4 h-4" />
                              <span>Flag User</span>
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('niko_free_admin_token');
                                  if (!token) throw new Error('Not authenticated');

                                  const response = await fetch(API_ENDPOINTS.admin.unflagUser(user.id), {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                  });

                                  if (!response.ok) throw new Error('Failed to unflag user');

                                  // Refresh users
                                  const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                    },
                                  });
                                  const usersData = await usersResponse.json();
                                  if (usersResponse.ok) setUsers(usersData.users || []);
                                } catch (error: any) {
                                  alert(error.message || 'Failed to unflag user');
                                }
                              }}
                              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Unflag</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUserForDelete(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Settings</h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#27aae2]" />
                Invite Admin
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Invite a new administrator to join the Niko Free admin dashboard. They will receive login credentials via email.</p>
              
              {inviteMessage && (
                <div className={`mb-4 p-4 rounded-lg ${
                  inviteMessage.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {inviteMessage.text}
                </div>
              )}
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!inviteAdminEmail.trim()) {
                  setInviteMessage({ type: 'error', text: 'Please enter an email address' });
                  return;
                }

                setIsInvitingAdmin(true);
                setInviteMessage(null);
                
                try {
                  const token = localStorage.getItem('niko_free_admin_token');
                  if (!token) {
                    throw new Error('Not authenticated');
                  }

                  const response = await fetch(API_ENDPOINTS.admin.inviteAdmin, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ email: inviteAdminEmail.trim() }),
                  });

                  const data = await response.json();

                  if (response.ok) {
                    setInviteMessage({ type: 'success', text: `Admin invitation sent successfully! Credentials have been emailed to ${inviteAdminEmail}.` });
                    setInviteAdminEmail('');
                  } else {
                    setInviteMessage({ type: 'error', text: data.error || 'Failed to invite admin' });
                  }
                } catch (error: any) {
                  console.error('Error inviting admin:', error);
                  setInviteMessage({ type: 'error', text: error.message || 'Error inviting admin' });
                } finally {
                  setIsInvitingAdmin(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteAdminEmail}
                    onChange={(e) => setInviteAdminEmail(e.target.value)}
                    placeholder="Enter email address to invite as admin"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    The invited admin will receive an email with their login credentials.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isInvitingAdmin}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isInvitingAdmin ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Sending Invitation...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Send Admin Invitation</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
        </main>
      </div>
      </div>

      {/* Partner Details Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Details</h2>
              <button
                onClick={() => {
                  setIsPartnerModalOpen(false);
                  setSelectedPartner(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingPartner ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-[#27aae2]" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading partner details...</span>
                </div>
              ) : selectedPartner ? (
                <div className="space-y-6">
                  {/* Partner Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        Business Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.business_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.contact_person || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.category?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Phone
                          </label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Location
                          </label>
                          <p className="text-gray-900 dark:text-white">{selectedPartner.location || 'N/A'}</p>
                        </div>
                        {selectedPartner.website && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                              <Globe className="w-4 h-4 mr-1" />
                              Website
                            </label>
                            <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-[#27aae2] hover:underline">
                              {selectedPartner.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedPartner.status === 'approved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : selectedPartner.status === 'pending'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {selectedPartner.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                      {selectedPartner.status === 'approved' && (
                        <button
                          onClick={() => handleResendCredentials(selectedPartner.id)}
                          disabled={resendingCredentials === selectedPartner.id}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{resendingCredentials === selectedPartner.id ? 'Sending...' : 'Resend Login Details'}</span>
                        </button>
                      )}
                    </div>
                    {resendMessage && resendMessage.partnerId === selectedPartner.id && (
                      <div className="mt-2 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-sm">
                        {resendMessage.message}
                      </div>
                    )}
                  </div>

                  {/* Events List */}
                  {selectedPartner.events && selectedPartner.events.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Events ({selectedPartner.events.length})</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedPartner.events.map((event: any) => (
                          <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Date TBA'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No partner data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flag User Modal */}
      {isFlagModalOpen && selectedUserForFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Flag User</h2>
              <button
                onClick={() => {
                  setIsFlagModalOpen(false);
                  setSelectedUserForFlag(null);
                  setFlagNotes('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  You are about to flag <strong>{selectedUserForFlag.first_name} {selectedUserForFlag.last_name}</strong> ({selectedUserForFlag.email}).
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please provide notes explaining why this user is being flagged. This will help track the reason for flagging.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes *
                </label>
                <textarea
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Enter notes explaining why this user is being flagged..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  These notes will be logged in the admin activity log
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsFlagModalOpen(false);
                    setSelectedUserForFlag(null);
                    setFlagNotes('');
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlagUser}
                  disabled={isFlagging || !flagNotes.trim()}
                  className={`px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    isFlagging || !flagNotes.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isFlagging ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Flagging...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>Flag User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && selectedUserForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Confirm User Deletion</h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedUserForDelete(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Are you absolutely sure you want to delete <strong>{selectedUserForDelete.first_name} {selectedUserForDelete.last_name}</strong> ({selectedUserForDelete.email})?
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action is <strong className="text-red-600 dark:text-red-400">irreversible</strong> and will permanently remove:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                      <li>User account and profile</li>
                      <li>All bookings and tickets</li>
                      <li>All notifications</li>
                      <li>All associated data</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUserForDelete(null);
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Delete User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart Modal */}
      {selectedRevenueType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedRevenueType === 'platform_fees' && 'Platform Fees Revenue'}
                {selectedRevenueType === 'withdrawal_fees' && 'Withdrawal Fees Revenue'}
                {selectedRevenueType === 'promotions' && 'Promotions Revenue'}
              </h2>
              <button
                onClick={() => {
                  setSelectedRevenueType(null);
                  setRevenueChartData(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingChart ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-[#27aae2]" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart data...</span>
                </div>
              ) : revenueChartData ? (
                <div className="space-y-6">
                  {/* Total Summary */}
                  <div className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(revenueChartData.total || 0)}</p>
                    <p className="text-sm opacity-80 mt-1">Last 30 days</p>
                  </div>

                  {/* Chart */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                    <div className="h-64 flex items-center justify-center">
                      {revenueChartData.data && revenueChartData.data.length > 0 ? (
                        <div className="w-full">
                          {/* Simple bar chart visualization */}
                          <div className="flex items-end justify-between h-48 space-x-1">
                            {revenueChartData.data.map((item: any, index: number) => {
                              const maxValue = Math.max(...revenueChartData.data.map((d: any) => d.value));
                              const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                              return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                  <div
                                    className="w-full bg-gradient-to-t from-[#27aae2] to-[#1e8bb8] rounded-t transition-all hover:opacity-80"
                                    style={{ height: `${height}%` }}
                                    title={`${item.label}: ${formatCurrency(item.value)}`}
                                  ></div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                                    {item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No data available for this period</p>
                      )}
                    </div>
                  </div>

                  {/* Data Table */}
                  {revenueChartData.data && revenueChartData.data.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Data</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Date</th>
                              <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueChartData.data.map((item: any, index: number) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-3 px-4 text-gray-900 dark:text-white">{item.label}</td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(item.value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No chart data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
