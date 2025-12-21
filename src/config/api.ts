/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Base URL for the API - use environment variable or default to localhost for development
export const API_BASE_URL = "https://nikofree-arhecnfueegrasf8.canadacentral-01.azurewebsites.net";

// export const API_BASE_URL = "http://localhost:5000";
// Base URL for the API - defaults to localhost:5001 for development
// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nikofree-server.onrender.com';

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
    events: `${API_BASE_URL}/api/admin/events`,
    approveEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/approve`,
    rejectEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/reject`,
    revenueCharts: (type: string, period?: string) => `${API_BASE_URL}/api/admin/revenue/charts?type=${type}${period ? `&period=${period}` : ''}`,
    users: `${API_BASE_URL}/api/admin/users`,
    user: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
    flagUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/flag`,
    unflagUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/unflag`,
    deleteUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
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
    uploadLogo: '/api/partners/logo',
    changePassword: '/api/partners/change-password',
    deleteAccount: '/api/partners/account',
  },
  
  // Events
  events: {
    list: '/api/events',
    search: '/api/events/search',
    featured: '/api/events/featured',
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
    partner: '/api/notifications/partner',
    markRead: (id: number) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/partner/read-all',
    delete: (id: number) => `/api/notifications/${id}`,
  },
  
  // Tickets
  tickets: {
    book: '/api/tickets/book',
    verify: '/api/tickets/verify',
    qr: (bookingId: number) => `/api/tickets/${bookingId}/qr`,
    download: (bookingId: number) => `/api/tickets/${bookingId}/download`,
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

