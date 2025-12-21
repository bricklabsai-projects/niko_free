/**
 * Partner Service
 * Handles all partner-related API calls
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export interface PartnerApplicationData {
  business_name: string;
  email: string;
  phone_number: string;
  location: string;
  category_id: string;
  interests?: string; // JSON string or comma-separated
  description?: string; // Business description
  signature_name: string;
  terms_accepted: string; // 'true' or 'false'
  logo?: File;
}

export interface PartnerApplicationResponse {
  message: string;
  application_id: number;
  status: string;
}

export interface ApiError {
  error: string;
}

/**
 * Submit partner application
 */
export const applyAsPartner = async (
  data: PartnerApplicationData
): Promise<PartnerApplicationResponse> => {
  const formData = new FormData();
  
  // Append all required fields
  formData.append('business_name', data.business_name);
  formData.append('email', data.email);
  formData.append('phone_number', data.phone_number);
  formData.append('location', data.location);
  formData.append('category_id', data.category_id);
  formData.append('signature_name', data.signature_name);
  formData.append('terms_accepted', data.terms_accepted);
  
  // Append optional fields
  if (data.interests) {
    formData.append('interests', data.interests);
  }
  
  if (data.description) {
    formData.append('description', data.description);
  }
  
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.apply}`, {
    method: 'POST',
    body: formData,
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || 'Failed to submit application');
  }
  
  return responseData;
};

/**
 * Partner login
 */
export const loginPartner = async (
  email: string,
  password: string
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.login}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  return data;
};

/**
 * Get partner events
 */
export const getPartnerEvents = async (status?: string): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = status && status !== 'all' 
    ? `${API_BASE_URL}${API_ENDPOINTS.partner.events}?status=${status}`
    : `${API_BASE_URL}${API_ENDPOINTS.partner.events}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch events');
  }

  return data;
};

/**
 * Create event
 */
export const createEvent = async (eventData: FormData): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.events}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: eventData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create event');
  }

  return data;
};

/**
 * Get single event by ID
 */
export const getEvent = async (eventId: number): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(eventId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch event');
  }

  return data;
};

/**
 * Update event
 */
export const updateEvent = async (eventId: number, eventData: FormData): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(eventId)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: eventData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update event');
  }

  return data;
};

/**
 * Get all attendees for partner
 */
export const getPartnerAttendees = async (eventId?: number): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = eventId
    ? `${API_BASE_URL}${API_ENDPOINTS.partner.events}/${eventId}/attendees`
    : `${API_BASE_URL}/api/partners/attendees`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch attendees');
  }

  return data;
};

/**
 * Get partner verification status
 */
export const getPartnerVerification = async (): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/verification`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch verification status');
  }

  return data;
};

/**
 * Claim verification badge
 */
export const claimVerificationBadge = async (): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/verification/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to claim verification badge');
  }

  return data;
};

/**
 * Change partner password
 */
export const changePartnerPassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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
 * Logout partner
 */
export const logoutPartner = (): void => {
  localStorage.removeItem('niko_free_partner_token');
  localStorage.removeItem('niko_free_partner');
  // Redirect will be handled by the component
};

/**
 * Get partner token from localStorage
 */
export const getPartnerToken = (): string | null => {
  return localStorage.getItem('niko_free_partner_token');
};

/**
 * Get partner data from localStorage
 */
export const getPartner = (): any | null => {
  const partner = localStorage.getItem('niko_free_partner');
  return partner ? JSON.parse(partner) : null;
};

/**
 * Get partner profile
 */
export const getPartnerProfile = async (): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.profile}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch profile');
  }

  // The API returns partner data directly (not wrapped in 'partner' key)
  // Update localStorage with latest data
  if (data) {
    localStorage.setItem('niko_free_partner', JSON.stringify(data));
  }

  return { partner: data };
};

/**
 * Update partner profile
 */
export const updatePartnerProfile = async (profileData: any): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.profile}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  // Update localStorage with latest data
  if (data.partner) {
    localStorage.setItem('niko_free_partner', JSON.stringify(data.partner));
  }

  return data;
};

/**
 * Upload partner logo
 */
export const uploadPartnerLogo = async (file: File): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.uploadLogo}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload logo');
  }

  // Update localStorage with latest data
  if (data.partner) {
    localStorage.setItem('niko_free_partner', JSON.stringify(data.partner));
  }

  return data;
};

/**
 * Delete partner account
 */
export const deletePartnerAccount = async (): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.deleteAccount}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete account');
  }

  // Clear localStorage after successful deletion
  logoutPartner();

  return data;
};

