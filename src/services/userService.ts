import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getToken, getAuthHeaders } from './authService';

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.profile}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch profile');
  }

  return data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: any): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.profile}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  return data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.profile}/picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload profile picture');
  }

  return data;
};

/**
 * Get user bookings
 */
export const getUserBookings = async (status?: 'upcoming' | 'past' | 'cancelled' | 'pending'): Promise<any> => {
  const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.users.bookings}`);
  if (status) {
    url.searchParams.append('status', status);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch bookings');
  }

  return data;
};

/**
 * Get single booking
 */
export const getBooking = async (bookingId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.bookings}/${bookingId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch booking');
  }

  return data;
};

/**
 * Get bucketlist
 */
export const getBucketlist = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.bucketlist}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch bucketlist');
  }

  return data;
};

/**
 * Add event to bucketlist
 */
export const addToBucketlist = async (eventId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.bucketlist}/${eventId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add to bucketlist');
  }

  return data;
};

/**
 * Remove event from bucketlist
 */
export const removeFromBucketlist = async (eventId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.bucketlist}/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to remove from bucketlist');
  }

  return data;
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (unreadOnly: boolean = false): Promise<any> => {
  const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.users.notifications}`);
  if (unreadOnly) {
    url.searchParams.append('unread_only', 'true');
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch notifications');
  }

  return data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.notifications}/${notificationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to mark notification as read');
  }

  return data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.notifications}/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to mark all notifications as read');
  }

  return data;
};

/**
 * Change user password
 */
export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to change password');
  }

  return data;
};

/**
 * Get event reviews
 */
export const getEventReviews = async (eventId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/reviews`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch reviews');
  }

  return data;
};

/**
 * Add review to event
 */
export const addEventReview = async (eventId: number, rating: number, comment: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      rating,
      comment,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add review');
  }

  return data;
};

/**
 * Update review
 */
export const updateEventReview = async (eventId: number, reviewId: number, rating: number, comment: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      rating,
      comment,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update review');
  }

  return data;
};

/**
 * Delete review
 */
export const deleteEventReview = async (eventId: number, reviewId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete review');
  }

  return data;
};

/**
 * Download ticket as PDF
 */
export const downloadTicket = async (bookingId: number): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/tickets/${bookingId}/download`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to download ticket');
  }

  return response.blob();
};

/**
 * Get ticket QR code
 */
export const getTicketQRCode = async (bookingId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/tickets/${bookingId}/qr`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get QR code');
  }

  return data;
};

