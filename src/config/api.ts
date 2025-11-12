/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Base URL for the API - defaults to localhost:5001 for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nikofree-server.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    googleLogin: `${API_BASE_URL}/api/auth/google`,
    appleLogin: `${API_BASE_URL}/api/auth/apple`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    verify: `${API_BASE_URL}/api/auth/verify`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
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

