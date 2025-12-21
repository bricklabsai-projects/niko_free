import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  Image as ImageIcon, 
  FileText, 
  DollarSign, 
  Users, 
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Check,
  Globe,
  Video,
  AlertCircle
} from 'lucide-react';
import { createEvent, getEvent, updateEvent } from '../../services/partnerService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface CreateEventProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  eventId?: number | null; // If provided, we're editing
}

interface EventFormData {
  // Step 1: Location
  locationType: 'physical' | 'online' | 'hybrid';
  locationName: string;
  coordinates: { lat: number; lng: number } | null;
  onlineLink: string;
  linkShareTime: string;
  
  // Step 2: Date & Time
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  
  // Step 3: Categories
  closedCategories: string[];
  openInterests: string[];
  
  // Step 4: Event Details
  eventName: string;
  eventPhoto: File | null;
  photoPreview: string;
  
  // Step 5: Description & Limits
  description: string;
  attendeeLimit: number | null;
  isUnlimited: boolean;
  
  // Step 6: Pricing
  isFree: boolean;
  ticketTypes: TicketType[];
  
  // Step 7: Promo Codes (Hosts removed)
  promoCodes: PromoCode[];
}

interface TicketType {
  id: string;
  name: string;
  ticketStructure: 'basic' | 'class' | 'loyalty' | 'season' | 'timeslot';
  // Class-based fields
  classType?: 'vvip' | 'vip' | 'regular';
  // Loyalty-based fields
  loyaltyType?: 'diehard' | 'earlybird' | 'advance' | 'gate';
  // Season-based fields
  seasonType?: 'daily' | 'season';
  seasonDuration?: number; // Number of days for season ticket
  // Timeslot-based fields
  timeslot?: string; // e.g., "9:00 AM - 10:00 AM"
  price: number;
  quantity: number;
  vatIncluded: boolean;
  existingId?: number; // For editing existing tickets
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  maxUses: number;
  expiryDate: string;
  existingId?: number; // For editing existing promo codes
}

// Categories will be fetched from API

export default function CreateEvent({ isOpen, onClose, onEventCreated, eventId }: CreateEventProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const isEditMode = !!eventId;
  const [formData, setFormData] = useState<EventFormData>({
    locationType: 'physical',
    locationName: '',
    coordinates: null,
    onlineLink: '',
    linkShareTime: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    closedCategories: [],
    openInterests: [],
    eventName: '',
    eventPhoto: null,
    photoPreview: '',
    description: '',
    attendeeLimit: null,
    isUnlimited: true,
    isFree: true,
    ticketTypes: [],
    promoCodes: []
  });

  const totalSteps = 7;

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (isEditMode && eventId) {
        fetchEventData(eventId);
      } else {
        // Reset form for new event
        setFormData({
          locationType: 'physical',
          locationName: '',
          coordinates: null,
          onlineLink: '',
          linkShareTime: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          closedCategories: [],
          openInterests: [],
          eventName: '',
          eventPhoto: null,
          photoPreview: '',
          description: '',
          attendeeLimit: null,
          isUnlimited: true,
          isFree: true,
          ticketTypes: [],
          promoCodes: []
        });
        setCurrentStep(1);
      }
    }
  }, [isOpen, eventId, isEditMode]);

  const fetchEventData = async (id: number) => {
    try {
      setIsLoadingEvent(true);
      const response = await getEvent(id);
      const event = response.event || response;
      
      // Parse dates
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;
      
      // Determine location type
      let locationType: 'physical' | 'online' | 'hybrid' = 'physical';
      if (event.is_online && event.online_link && event.venue_name) {
        locationType = 'hybrid';
      } else if (event.is_online && event.online_link) {
        locationType = 'online';
      }
      
      // Format ticket types
      const ticketTypes = (event.ticket_types || []).map((tt: any) => ({
        id: tt.id?.toString() || Date.now().toString(),
        name: tt.name || '',
        ticketStructure: 'basic' as const,
        price: parseFloat(tt.price || 0),
        quantity: tt.quantity_total || 0,
        vatIncluded: true,
        existingId: tt.id // Keep original ID for updates
      }));
      
      // Format promo codes
      const promoCodes = (event.promo_codes || []).map((pc: any) => ({
        id: pc.id?.toString() || Date.now().toString(),
        code: pc.code || '',
        discount: parseFloat(pc.discount_value || 0),
        discountType: pc.discount_type || 'percentage' as const,
        maxUses: pc.max_uses || 0,
        expiryDate: pc.valid_until ? new Date(pc.valid_until).toISOString().split('T')[0] : '',
        existingId: pc.id
      }));
      
      setFormData({
        locationType,
        locationName: event.venue_name || '',
        coordinates: event.latitude && event.longitude ? { lat: event.latitude, lng: event.longitude } : null,
        onlineLink: event.online_link || '',
        linkShareTime: '',
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate ? endDate.toISOString().split('T')[0] : '',
        endTime: endDate ? endDate.toTimeString().slice(0, 5) : '',
        closedCategories: event.category ? [event.category.id.toString()] : [],
        openInterests: event.interests || [],
        eventName: event.title || '',
        eventPhoto: null,
        photoPreview: event.poster_image ? (event.poster_image.startsWith('http') ? event.poster_image : `${API_BASE_URL}/${event.poster_image.replace(/^\/+/, '')}`) : '',
        description: event.description || '',
        attendeeLimit: null, // Calculate from ticket types if needed
        isUnlimited: true,
        isFree: event.is_free !== false,
        ticketTypes,
        promoCodes
      });
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError(err.message || 'Failed to load event data');
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.events.categories}`);
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleInterestAdd = (interest: string) => {
    if (formData.openInterests.length < 5 && interest.trim() && !formData.openInterests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        openInterests: [...prev.openInterests, interest.trim()]
      }));
    }
  };

  const handleInterestRemove = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      openInterests: prev.openInterests.filter(i => i !== interest)
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        eventPhoto: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateAIDescription = async () => {
    if (!formData.eventName) {
      alert('Please enter an event name first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const { generateEventDescription } = await import('../../services/openaiService');
      
      const description = await generateEventDescription({
        eventName: formData.eventName,
        categories: formData.closedCategories,
        interests: formData.openInterests,
        locationType: formData.locationType,
        locationName: formData.locationName,
        startDate: formData.startDate,
        startTime: formData.startTime,
      });
      
      setFormData(prev => ({ ...prev, description }));
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const addTicketType = () => {
    // Check if trying to add more than 8 timeslot tickets
    const timeslotTickets = formData.ticketTypes.filter(t => t.ticketStructure === 'timeslot');
    if (timeslotTickets.length >= 8) {
      alert('Maximum 8 time slot tickets allowed per event.');
      return;
    }

    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: '',
      ticketStructure: 'basic',
      price: 0,
      quantity: 0,
      vatIncluded: true
    };
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicket]
    }));
  };

  const removeTicketType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(t => t.id !== id)
    }));
  };

  const updateTicketType = (id: string, field: keyof TicketType, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const addPromoCode = () => {
    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: '',
      discount: 0,
      discountType: 'percentage',
      maxUses: 0,
      expiryDate: ''
    };
    setFormData(prev => ({
      ...prev,
      promoCodes: [...prev.promoCodes, newPromo]
    }));
  };

  const removePromoCode = (id: string) => {
    setFormData(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.filter(p => p.id !== id)
    }));
  };

  const updatePromoCode = (id: string, field: keyof PromoCode, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };


  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate required fields
      if (!formData.eventName) {
        setError('Event name is required');
        setIsLoading(false);
        return;
      }
      if (!formData.startDate || !formData.startTime) {
        setError('Start date and time are required');
        setIsLoading(false);
        return;
      }
      if (formData.closedCategories.length === 0) {
        setError('Please select at least one category');
        setIsLoading(false);
        return;
      }
      if (!formData.description) {
        setError('Event description is required');
        setIsLoading(false);
        return;
      }
      if (!formData.isFree && formData.ticketTypes.length === 0) {
        setError('Please add at least one ticket type for paid events');
        setIsLoading(false);
        return;
      }

      // Create FormData
      const eventFormData = new FormData();
      
      // Basic info
      eventFormData.append('title', formData.eventName);
      eventFormData.append('description', formData.description);
      eventFormData.append('category_id', formData.closedCategories[0]); // Use first selected category
      eventFormData.append('start_date', formData.startDate);
      eventFormData.append('start_time', formData.startTime);
      if (formData.endDate) {
        eventFormData.append('end_date', formData.endDate);
        eventFormData.append('end_time', formData.endTime || '23:59');
      }
      
      // Location
      eventFormData.append('location_type', formData.locationType);
      if (formData.locationName) {
        eventFormData.append('location_name', formData.locationName);
        eventFormData.append('venue_name', formData.locationName);
      }
      if (formData.onlineLink) {
        eventFormData.append('online_link', formData.onlineLink);
      }
      if (formData.linkShareTime) {
        eventFormData.append('link_share_time', formData.linkShareTime);
      }
      if (formData.coordinates) {
        eventFormData.append('latitude', formData.coordinates.lat.toString());
        eventFormData.append('longitude', formData.coordinates.lng.toString());
      }
      
      // Interests
      if (formData.openInterests.length > 0) {
        eventFormData.append('interests', JSON.stringify(formData.openInterests));
      }
      
      // Capacity
      if (!formData.isUnlimited && formData.attendeeLimit) {
        eventFormData.append('attendee_limit', formData.attendeeLimit.toString());
      }
      
      // Pricing
      eventFormData.append('is_free', formData.isFree ? 'true' : 'false');
      
      // Ticket types
      if (!formData.isFree && formData.ticketTypes.length > 0) {
        const ticketTypesData = formData.ticketTypes.map(tt => ({
          name: tt.name,
          price: tt.price,
          quantity: tt.quantity,
          description: `${tt.ticketStructure}${tt.classType ? ` - ${tt.classType}` : ''}${tt.loyaltyType ? ` - ${tt.loyaltyType}` : ''}${tt.seasonType ? ` - ${tt.seasonType}` : ''}${tt.timeslot ? ` - ${tt.timeslot}` : ''}`
        }));
        eventFormData.append('ticket_types', JSON.stringify(ticketTypesData));
      }
      
      // Promo codes
      if (formData.promoCodes.length > 0) {
        const promoCodesData = formData.promoCodes.map(promo => ({
          code: promo.code,
          discount_type: promo.discountType,
          discount: promo.discount,
          max_uses: promo.maxUses,
          expiry_date: promo.expiryDate
        }));
        eventFormData.append('promo_codes', JSON.stringify(promoCodesData));
      }
      
      // Poster image
      if (formData.eventPhoto) {
        eventFormData.append('poster_image', formData.eventPhoto);
      }
      
      // Submit
      if (isEditMode && eventId) {
        // Include existing IDs for ticket types and promo codes
        const existingTicketIds = formData.ticketTypes
          .filter(tt => tt.existingId)
          .map(tt => tt.existingId);
        const existingPromoIds = formData.promoCodes
          .filter(pc => pc.existingId)
          .map(pc => pc.existingId);
        
        if (existingTicketIds.length > 0) {
          eventFormData.append('existing_ticket_ids', JSON.stringify(existingTicketIds));
        }
        if (existingPromoIds.length > 0) {
          eventFormData.append('existing_promo_ids', JSON.stringify(existingPromoIds));
        }
        
        // Include IDs in ticket types and promo codes data
        const ticketTypesWithIds = formData.ticketTypes.map(tt => ({
          ...tt,
          id: tt.existingId || undefined
        }));
        const promoCodesWithIds = formData.promoCodes.map(pc => ({
          ...pc,
          id: pc.existingId || undefined
        }));
        
        eventFormData.set('ticket_types', JSON.stringify(ticketTypesWithIds));
        eventFormData.set('promo_codes', JSON.stringify(promoCodesWithIds));
        
        await updateEvent(eventId, eventFormData);
        alert('Event updated successfully!');
      } else {
        await createEvent(eventFormData);
        alert('Event submitted for approval! You will be notified once it\'s approved.');
      }
      
      // Trigger refresh
      if (onEventCreated) {
        onEventCreated();
      }
      
      // Also try to refresh via window function
      if ((window as any).refreshPartnerEvents) {
        (window as any).refreshPartnerEvents();
      }
      
      onClose();
      
      // Reset form
      setFormData({
        locationType: 'physical',
        locationName: '',
        coordinates: null,
        onlineLink: '',
        linkShareTime: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        closedCategories: [],
        openInterests: [],
        eventName: '',
        eventPhoto: null,
        photoPreview: '',
        description: '',
        attendeeLimit: null,
        isUnlimited: true,
        isFree: true,
        ticketTypes: [],
        promoCodes: []
      });
      setCurrentStep(1);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Event' : 'Create New Event'}</h3>
                <p className="text-sm text-white/80 mt-1">Step {currentStep} of {totalSteps}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Loading Event Data */}
            {isLoadingEvent && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
                <p className="ml-4 text-gray-600 dark:text-gray-400">Loading event data...</p>
              </div>
            )}
            
            {/* Error Display */}
            {error && !isLoadingEvent && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {!isLoadingEvent && (
              <>
                {/* Step 1: Location */}
                {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Location</h4>
                  
                  {/* Location Type */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, locationType: 'physical' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.locationType === 'physical'
                          ? 'border-[#27aae2] bg-[#27aae2]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#27aae2]/50'
                      }`}
                    >
                      <MapPin className={`w-8 h-8 mx-auto mb-2 ${
                        formData.locationType === 'physical' ? 'text-[#27aae2]' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Physical</p>
                    </button>

                    <button
                      onClick={() => setFormData(prev => ({ ...prev, locationType: 'online' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.locationType === 'online'
                          ? 'border-[#27aae2] bg-[#27aae2]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#27aae2]/50'
                      }`}
                    >
                      <Globe className={`w-8 h-8 mx-auto mb-2 ${
                        formData.locationType === 'online' ? 'text-[#27aae2]' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Online</p>
                    </button>

                    <button
                      onClick={() => setFormData(prev => ({ ...prev, locationType: 'hybrid' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.locationType === 'hybrid'
                          ? 'border-[#27aae2] bg-[#27aae2]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#27aae2]/50'
                      }`}
                    >
                      <Video className={`w-8 h-8 mx-auto mb-2 ${
                        formData.locationType === 'hybrid' ? 'text-[#27aae2]' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Hybrid</p>
                    </button>
                  </div>

                  {/* Physical/Hybrid Location */}
                  {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location Name
                      </label>
                      <input
                        type="text"
                        value={formData.locationName}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                        placeholder="e.g., Ngong Hills, Nairobi"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                      <button className="mt-2 text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium">
                        📍 Pin on Map
                      </button>
                    </div>
                  )}

                  {/* Online/Hybrid Link */}
                  {(formData.locationType === 'online' || formData.locationType === 'hybrid') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <LinkIcon className="w-4 h-4 inline mr-1" />
                          Event Link
                        </label>
                        <input
                          type="url"
                          value={formData.onlineLink}
                          onChange={(e) => setFormData(prev => ({ ...prev, onlineLink: e.target.value }))}
                          placeholder="https://zoom.us/j/..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Link Share Time
                        </label>
                        <select
                          value={formData.linkShareTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkShareTime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          <option value="">Select when to share link</option>
                          <option value="immediately">Immediately after booking</option>
                          <option value="1hour">1 hour before event</option>
                          <option value="30min">30 minutes before event</option>
                          <option value="15min">15 minutes before event</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Date & Time
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Categories */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <Tag className="w-5 h-5 inline mr-2" />
                    Categories & Interests
                  </h4>

                  {/* Closed Categories */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => {
                              // Only allow one category selection
                              setFormData(prev => ({
                                ...prev,
                                closedCategories: prev.closedCategories.includes(category.id.toString())
                                  ? []
                                  : [category.id.toString()]
                              }));
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                              formData.closedCategories.includes(category.id.toString())
                                ? 'border-[#27aae2] bg-[#27aae2] text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#27aae2]'
                            }`}
                          >
                            {formData.closedCategories.includes(category.id.toString()) && (
                              <Check className="w-4 h-4 inline mr-1" />
                            )}
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
                      )}
                    </div>
                  </div>

                  {/* Open Interests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Custom Interests (Max 5)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        id="interestInput"
                        placeholder="e.g., Hiking, Photography"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleInterestAdd((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('interestInput') as HTMLInputElement;
                          handleInterestAdd(input.value);
                          input.value = '';
                        }}
                        disabled={formData.openInterests.length >= 5}
                        className="px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.openInterests.map(interest => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-[#27aae2]/10 text-[#27aae2] rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {interest}
                          <button
                            onClick={() => handleInterestRemove(interest)}
                            className="hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formData.openInterests.length}/5 interests added
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Event Name & Photo */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Event Details
                  </h4>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                      placeholder="e.g., PICNICS AT NGONG HILLS"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Event Photo
                    </label>
                    
                    {formData.photoPreview ? (
                      <div className="relative">
                        <img
                          src={formData.photoPreview}
                          alt="Event preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, eventPhoto: null, photoPreview: '' }))}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[#27aae2] transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload event photo</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Description & Limits */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <FileText className="w-5 h-5 inline mr-2" />
                    Description & Capacity
                  </h4>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event Description
                      </label>
                      <button
                        onClick={generateAIDescription}
                        disabled={isGeneratingDescription}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className={`w-4 h-4 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                        {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      placeholder="Describe your event..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Users className="w-4 h-4 inline mr-1" />
                      Attendee Capacity
                    </label>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.isUnlimited}
                          onChange={() => setFormData(prev => ({ ...prev, isUnlimited: true, attendeeLimit: null }))}
                          className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.isUnlimited}
                          onChange={() => setFormData(prev => ({ ...prev, isUnlimited: false }))}
                          className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Limited</span>
                      </label>
                    </div>

                    {!formData.isUnlimited && (
                      <input
                        type="number"
                        value={formData.attendeeLimit || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, attendeeLimit: parseInt(e.target.value) || null }))}
                        placeholder="Maximum attendees"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Pricing */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Event Pricing
                  </h4>

                  <div className="flex items-center gap-4 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.isFree}
                        onChange={() => setFormData(prev => ({ ...prev, isFree: true, ticketTypes: [] }))}
                        className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Free Event</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!formData.isFree}
                        onChange={() => setFormData(prev => ({ ...prev, isFree: false }))}
                        className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Paid Event</span>
                    </label>
                  </div>

                  {!formData.isFree && (
                    <div>
                      {/* Ticket Types Info */}
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Ticket Types Guide:</h5>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                          <li><strong>Basic:</strong> One uniform price for all attendees (e.g., Tour packages)</li>
                          <li><strong>Class-Based:</strong> Different pricing tiers - VVIP, VIP, Regular</li>
                          <li><strong>Loyalty:</strong> Reward early/loyal customers - Die Hard, Early Bird, Advance, Gate</li>
                          <li><strong>Season:</strong> Daily tickets or multi-day passes for events spanning multiple days</li>
                          <li><strong>Time Slot:</strong> Book specific time periods (max 8 slots, e.g., hourly training sessions)</li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ticket Types
                        </label>
                        <button
                          onClick={addTicketType}
                          className="flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Ticket
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.ticketTypes.map((ticket) => (
                          <div key={ticket.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <div className="space-y-4">
                              {/* Ticket Structure Selection */}
                              <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ticket Structure</label>
                                <select
                                  value={ticket.ticketStructure}
                                  onChange={(e) => updateTicketType(ticket.id, 'ticketStructure', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                >
                                  <option value="basic">Basic Ticket (Uniform Price)</option>
                                  <option value="class">Class-Based (VVIP, VIP, Regular)</option>
                                  <option value="loyalty">Loyalty-Based (Die Hard, Early Bird, etc.)</option>
                                  <option value="season">Season Ticket (Daily/Multi-day)</option>
                                  <option value="timeslot">Time Slot Ticket</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Ticket Name */}
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ticket Name</label>
                                  <input
                                    type="text"
                                    value={ticket.name}
                                    onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                                    placeholder={
                                      ticket.ticketStructure === 'basic' ? 'e.g., General Admission' :
                                      ticket.ticketStructure === 'class' ? 'e.g., VIP Access' :
                                      ticket.ticketStructure === 'loyalty' ? 'e.g., Early Bird Special' :
                                      ticket.ticketStructure === 'season' ? 'e.g., 3-Day Pass' :
                                      'e.g., Morning Session'
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                  />
                                </div>

                                {/* Class Type (only for class-based) */}
                                {ticket.ticketStructure === 'class' && (
                                  <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Class Type</label>
                                    <select
                                      value={ticket.classType || 'regular'}
                                      onChange={(e) => updateTicketType(ticket.id, 'classType', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      <option value="vvip">VVIP</option>
                                      <option value="vip">VIP</option>
                                      <option value="regular">Regular</option>
                                    </select>
                                  </div>
                                )}

                                {/* Loyalty Type (only for loyalty-based) */}
                                {ticket.ticketStructure === 'loyalty' && (
                                  <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Loyalty Type</label>
                                    <select
                                      value={ticket.loyaltyType || 'earlybird'}
                                      onChange={(e) => updateTicketType(ticket.id, 'loyaltyType', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      <option value="diehard">Die Hard</option>
                                      <option value="earlybird">Early Bird</option>
                                      <option value="advance">Advance</option>
                                      <option value="gate">Gate Ticket</option>
                                    </select>
                                  </div>
                                )}

                                {/* Season Type (only for season-based) */}
                                {ticket.ticketStructure === 'season' && (
                                  <>
                                    <div>
                                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Season Type</label>
                                      <select
                                        value={ticket.seasonType || 'daily'}
                                        onChange={(e) => updateTicketType(ticket.id, 'seasonType', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        <option value="daily">Daily Ticket</option>
                                        <option value="season">Season Ticket</option>
                                      </select>
                                    </div>
                                    {ticket.seasonType === 'season' && (
                                      <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Duration (Days)</label>
                                        <input
                                          type="number"
                                          value={ticket.seasonDuration || ''}
                                          onChange={(e) => updateTicketType(ticket.id, 'seasonDuration', parseInt(e.target.value) || 1)}
                                          placeholder="e.g., 3"
                                          min="1"
                                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Time Slot (only for timeslot-based) */}
                                {ticket.ticketStructure === 'timeslot' && (
                                  <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Time Slot</label>
                                    <input
                                      type="text"
                                      value={ticket.timeslot || ''}
                                      onChange={(e) => updateTicketType(ticket.id, 'timeslot', e.target.value)}
                                      placeholder="e.g., 9:00 AM - 10:00 AM"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 8 time slots per event</p>
                                  </div>
                                )}

                                {/* Price */}
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (KES)</label>
                                  <input
                                    type="number"
                                    value={ticket.price || ''}
                                    onChange={(e) => updateTicketType(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                  />
                                </div>

                                {/* Quantity */}
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity Available</label>
                                  <input
                                    type="number"
                                    value={ticket.quantity || ''}
                                    onChange={(e) => updateTicketType(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                  />
                                </div>
                              </div>

                              {/* VAT and Delete */}
                              <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={ticket.vatIncluded}
                                    onChange={(e) => updateTicketType(ticket.id, 'vatIncluded', e.target.checked)}
                                    className="w-4 h-4 text-[#27aae2] rounded focus:ring-[#27aae2]"
                                  />
                                  <span className="text-xs text-gray-700 dark:text-gray-300">VAT Included</span>
                                </label>

                                <button
                                  onClick={() => removeTicketType(ticket.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Remove
                                </button>
                              </div>

                              {/* Ticket Preview */}
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {ticket.name || 'Ticket Name'} 
                                  {ticket.ticketStructure === 'class' && ` (${ticket.classType?.toUpperCase() || 'CLASS'})`}
                                  {ticket.ticketStructure === 'loyalty' && ` (${ticket.loyaltyType?.replace(/([A-Z])/g, ' $1').trim() || 'LOYALTY TYPE'})`}
                                  {ticket.ticketStructure === 'season' && ticket.seasonType === 'season' && ` (${ticket.seasonDuration || 0}-Day Pass)`}
                                  {ticket.ticketStructure === 'timeslot' && ` (${ticket.timeslot || 'TIME SLOT'})`}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  KES {ticket.price.toLocaleString()} {ticket.vatIncluded && '(incl. VAT)'} • {ticket.quantity} available
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {formData.ticketTypes.length === 0 && (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No ticket types added yet. Click "Add Ticket" to create one.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 7: Promo Codes */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Promo Codes
                  </h4>

                  {/* Promo Codes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Promo Codes (Optional)
                      </label>
                      <button
                        onClick={addPromoCode}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Promo
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.promoCodes.map(promo => (
                        <div key={promo.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Promo Code</label>
                              <input
                                type="text"
                                value={promo.code}
                                onChange={(e) => updatePromoCode(promo.id, 'code', e.target.value.toUpperCase())}
                                placeholder="e.g., EARLYBIRD"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Discount Type</label>
                              <select
                                value={promo.discountType}
                                onChange={(e) => updatePromoCode(promo.id, 'discountType', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (KES)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Discount Value</label>
                              <input
                                type="number"
                                value={promo.discount}
                                onChange={(e) => updatePromoCode(promo.id, 'discount', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Uses</label>
                              <input
                                type="number"
                                value={promo.maxUses}
                                onChange={(e) => updatePromoCode(promo.id, 'maxUses', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Expiry Date</label>
                              <input
                                type="date"
                                value={promo.expiryDate}
                                onChange={(e) => updatePromoCode(promo.id, 'expiryDate', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                onClick={() => removePromoCode(promo.id)}
                                className="w-full p-2 text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.promoCodes.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                          No promo codes added. Promo codes are optional.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{isEditMode ? 'Update Event' : 'Submit for Approval'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
