import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getToken } from './authService';

/**
 * Get auth headers
 */
const getAuthHeaders = () => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Get all events with filters
 */
export const getEvents = async (params?: {
  page?: number;
  per_page?: number;
  category?: string;
  location?: string;
  search?: string;
  is_free?: boolean;
  featured?: boolean;
  this_weekend?: boolean;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.location) queryParams.append('location', params.location);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.is_free !== undefined) queryParams.append('is_free', params.is_free.toString());
  if (params?.featured) queryParams.append('featured', 'true');
  if (params?.this_weekend) queryParams.append('this_weekend', 'true');
  
  const url = `${API_BASE_URL}${API_ENDPOINTS.events.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch events' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the API server is running.');
    }
    throw error;
  }
};

/**
 * Get featured events (Can't Miss)
 */
export const getFeaturedEvents = async (limit: number = 10): Promise<any> => {
  return getEvents({ featured: true, per_page: limit });
};

/**
 * Get events by category
 */
export const getEventsByCategory = async (categorySlug: string, limit: number = 20): Promise<any> => {
  return getEvents({ category: categorySlug, per_page: limit });
};

/**
 * Get event categories
 */
export const getCategories = async (): Promise<any> => {
  const url = `${API_BASE_URL}${API_ENDPOINTS.events.categories}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch categories' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the API server is running.');
    }
    throw error;
  }
};

/**
 * Get single event details
 */
export const getEventDetails = async (eventId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.events.detail(eventId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch event details');
  }
  
  return data;
};

