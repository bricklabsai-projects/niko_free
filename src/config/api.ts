/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Base URL for the API - use environment variable or default to localhost for development
// export const API_BASE_URL = "https://nikofree-arhecnfueegrasf8.canadacentral-01.azurewebsites.net";

export const API_BASE_URL = "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    adminLogin: `${API_BASE_URL}/api/auth/admin/login`,
    googleLogin: `${API_BASE_URL}/api/auth/google`,
    appleLogin: `${API_BASE_URL}/api/auth/apple`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    verify: `${API_BASE_URL}/api/auth/verify`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    partnerForgotPassword: `${API_BASE_URL}/api/auth/partner/forgot-password`,
    partnerResetPassword: `${API_BASE_URL}/api/auth/partner/reset-password`,
  },
  
  // Admin
  admin: {
    dashboard: `${API_BASE_URL}/api/admin/dashboard`,
    partners: `${API_BASE_URL}/api/admin/partners`,
    partnerStats: `${API_BASE_URL}/api/admin/partners/stats`,
    partner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}`,
    approvePartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/approve`,
    rejectPartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/reject`,
    unrejectPartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/unreject`,
    resendPartnerCredentials: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/resend-credentials`,
    rejectionReasons: `${API_BASE_URL}/api/admin/rejection-reasons`,
    suspendPartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/suspend`,
    activatePartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/activate`,
    events: `${API_BASE_URL}/api/admin/events`,
    approveEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/approve`,
    rejectEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/reject`,
    featureEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/feature`,
    promoteEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/promote`,
    unpromoteEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/unpromote`,
    promotedEvents: `${API_BASE_URL}/api/admin/promoted-events`,
    users: `${API_BASE_URL}/api/admin/users`,
    user: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
    flagUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/flag`,
    unflagUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/unflag`,
    deleteUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
    inviteAdmin: `${API_BASE_URL}/api/admin/invite-admin`,
    revenueCharts: (type: string, period?: string) => `${API_BASE_URL}/api/admin/revenue/charts?type=${type}${period ? `&period=${period}` : ''}`,
    categories: `${API_BASE_URL}/api/admin/categories`,
    locations: `${API_BASE_URL}/api/admin/locations`,
    analytics: `${API_BASE_URL}/api/admin/analytics`,
    payouts: `${API_BASE_URL}/api/admin/payouts`,
    approvePayout: (id: number) => `${API_BASE_URL}/api/admin/payouts/${id}/approve`,
    logs: `${API_BASE_URL}/api/admin/logs`,
    support: `${API_BASE_URL}/api/admin/support`,
    updateSupportStatus: (id: number) => `${API_BASE_URL}/api/admin/support/${id}/status`,
    inbox: `${API_BASE_URL}/api/admin/inbox`,
    markMessageRead: (id: number, type: string) => `${API_BASE_URL}/api/admin/inbox/${id}/read?type=${type}`,
    toggleMessageStar: (id: number, type: string) => `${API_BASE_URL}/api/admin/inbox/${id}/star?type=${type}`,
    archiveMessage: (id: number, type: string) => `${API_BASE_URL}/api/admin/inbox/${id}/archive?type=${type}`,
    deleteMessage: (id: number, type: string) => `${API_BASE_URL}/api/admin/inbox/${id}?type=${type}`,
  },
  
  // Messages
  messages: {
    feedback: `${API_BASE_URL}/api/messages/feedback`,
    contact: `${API_BASE_URL}/api/messages/contact`,
  },
  
  // Partner
  partner: {
    apply: '/api/auth/partner/apply',
    register: '/api/auth/partner/register',
    login: '/api/auth/partner/login',
    dashboard: '/api/partners/dashboard',
    profile: '/api/partners/profile',
    events: '/api/partners/events',
    event: (id: number) => `/api/partners/events/${id}`,
    promoteEvent: (id: number) => `/api/partners/events/${id}/promote`,
    toggleTicket: (ticketTypeId: number) => `${API_BASE_URL}/api/partners/ticket-types/${ticketTypeId}/toggle`,
    uploadLogo: '/api/partners/logo',
    analytics: '/api/partners/analytics',
    changePassword: '/api/partners/change-password',
    deleteAccount: '/api/partners/account',
  },
  
  // Events
  events: {
    list: '/api/events',
    search: '/api/events/search',
    featured: '/api/events/featured',
    promoted: '/api/events/promoted',
    detail: (id: number) => `/api/events/${id}`,
    categories: '/api/events/categories',
    locations: '/api/events/locations',
    reviews: (id: number) => `/api/events/${id}/reviews`,
    addReview: (id: number) => `/api/events/${id}/reviews`,
    updateReview: (eventId: number, reviewId: number) => `/api/events/${eventId}/reviews/${reviewId}`,
    deleteReview: (eventId: number, reviewId: number) => `/api/events/${eventId}/reviews/${reviewId}`,
  },
  
  // Users
  users: {
    profile: '/api/users/profile',
    bookings: '/api/users/bookings',
    bucketlist: '/api/users/bucketlist',
    notifications: '/api/users/notifications',
    changePassword: '/api/users/change-password',
  },
  
  // Notifications
  notifications: {
    user: '/api/notifications/user',
    partner: '/api/notifications/partner',
    admin: '/api/notifications/admin',
    markRead: (id: number) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
    markAllPartnerRead: '/api/notifications/partner/read-all',
    markAllAdminRead: '/api/notifications/admin/read-all',
    delete: (id: number) => `/api/notifications/${id}`,
  },
  
  // Tickets
  tickets: {
    book: '/api/tickets/book',
    verify: '/api/tickets/verify',
    qr: (bookingId: number) => `/api/tickets/${bookingId}/qr`,
    download: (bookingId: number) => `/api/tickets/${bookingId}/download`,
    releaseExpired: '/api/tickets/release-expired',
  },
  
  // Payments
  payments: {
    initiate: '/api/payments/initiate',
    callback: '/api/payments/mpesa/callback',
    status: (paymentId: number) => `/api/payments/status/${paymentId}`,
    history: '/api/payments/history',
  },
};

/**
 * Helper function to build full URL
 */
export const buildUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get a valid image URL from poster_image field
 * Handles base64 data URIs, relative paths, and absolute URLs
 */
export const getImageUrl = (posterImage: string | null | undefined): string => {
  if (!posterImage) {
    return 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }
  
  // Skip base64 data URIs - they shouldn't be in the database
  if (posterImage.startsWith('data:image')) {
    return 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }
  
  // Already a full URL
  if (posterImage.startsWith('http://') || posterImage.startsWith('https://')) {
    return posterImage;
  }
  
  // Fix double /uploads/uploads/ paths
  let cleanPath = posterImage;
  if (cleanPath.includes('/uploads/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/uploads/', '/uploads/');
  }
  
  // Remove leading slash if present to avoid double slashes
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Ensure path starts with uploads/
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }
  
  // Construct full URL - ensure no double slashes
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${cleanPath}`;
};

