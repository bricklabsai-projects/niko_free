import { Upload, CheckCircle, Building2, Mail, Phone, Tag, FileText, ArrowRight, ArrowLeft, MapPin, PenTool, Plus, Minus, AlertCircle, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { applyAsPartner } from '../services/partnerService';

interface BecomePartnerProps {
  onNavigate: (page: string) => void;
}

export default function BecomePartner({ onNavigate }: BecomePartnerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    logo: null as File | null,
    location: '',
    categories: [] as string[],
    interests: '',
    description: '',
    email: '',
    phone: '',
    signature: '',
    acceptTerms: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationTimeoutRef = useRef<NodeJS.Timeout>();
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [businessNameError, setBusinessNameError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories matching backend database IDs
  const categories = [
    { id: '1', name: 'Travel' },
    { id: '2', name: 'Sports & Fitness' },
    { id: '3', name: 'Social Activities' },
    { id: '4', name: 'Hobbies & Interests' },
    { id: '5', name: 'Religious' },
    { id: '6', name: 'Pets & Animals' },
    { id: '7', name: 'Autofest' },
    { id: '8', name: 'Health & Wellbeing' },
    { id: '9', name: 'Music & Culture' },
    { id: '10', name: 'Coaching & Support' },
    { id: '11', name: 'Dance' },
    { id: '12', name: 'Technology' },
    { id: '13', name: 'Gaming' },
    { id: '14', name: 'Shopping' },
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare data for API
      const allInterests = [...customInterests];
      if (formData.interests.trim()) {
        allInterests.push(formData.interests.trim());
      }

      const applicationData = {
        business_name: formData.businessName,
        email: formData.email,
        phone_number: formData.phone,
        location: formData.location,
        category_id: formData.categories[0], // Use first selected category as primary
        interests: allInterests.length > 0 ? JSON.stringify(allInterests) : undefined,
        description: formData.description || undefined,
        signature_name: formData.signature,
        terms_accepted: 'true',
        logo: formData.logo || undefined,
      };

      // Call API
      await applyAsPartner(applicationData);
      
      // Success - show success page
      setSubmitted(true);
    } catch (error: any) {
      console.error('Application submission error:', error);
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIDescription = async () => {
    if (!formData.businessName) {
      alert('Please enter your business name first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      // Direct import to ensure it's loaded
      const openaiService = await import('../services/openaiService');
      const { generatePartnerDescription } = openaiService;
      
      const selectedCategory = formData.categories.length > 0 
        ? categories.find(c => c.id === formData.categories[0])?.name 
        : undefined;
      
      const allInterests = [...customInterests];
      if (formData.interests && formData.interests.trim()) {
        allInterests.push(formData.interests.trim());
      }
      
      console.log('Generating description with params:', {
        businessName: formData.businessName,
        category: selectedCategory,
        location: formData.location,
        interests: allInterests.length > 0 ? allInterests : undefined,
      });
      
      const description = await generatePartnerDescription({
        businessName: formData.businessName,
        category: selectedCategory,
        location: formData.location,
        interests: allInterests.length > 0 ? allInterests : undefined,
      });
      
      console.log('Generated description:', description);
      
      if (description && description.trim()) {
        setFormData(prev => ({ ...prev, description: description.trim() }));
      } else {
        throw new Error('Empty description received from AI');
      }
    } catch (error: any) {
      console.error('Error generating description:', error);
      const errorMessage = error?.message || 'Failed to generate description. Please try again.';
      alert(errorMessage);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Auto-detect user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.county;
            if (city) {
              setFormData(prev => ({ ...prev, location: city }));
            }
          } catch (error) {
            console.error('Error fetching location:', error);
            setFormData(prev => ({ ...prev, location: 'Nairobi' }));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setFormData(prev => ({ ...prev, location: 'Nairobi' }));
        }
      );
    } else {
      setFormData(prev => ({ ...prev, location: 'Nairobi' }));
    }
  }, []);

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ke`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    locationTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  };

  const handleLocationSelect = (location: any) => {
    const locationName = location.display_name.split(',')[0];
    setFormData({ ...formData, location: locationName });
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateBusinessName = (name: string) => {
    if (!name) {
      setBusinessNameError('Business name is required');
      return false;
    }
    if (name.length < 2) {
      setBusinessNameError('Business name must be at least 2 characters');
      return false;
    }
    if (name.length > 100) {
      setBusinessNameError('Business name must not exceed 100 characters');
      return false;
    }
    // Check for valid characters (letters, numbers, spaces, and common business symbols)
    const businessNameRegex = /^[a-zA-Z0-9\s&.,'-]+$/;
    if (!businessNameRegex.test(name)) {
      setBusinessNameError('Business name contains invalid characters');
      return false;
    }
    setBusinessNameError('');
    return true;
  };

  const validateLogo = (file: File | null) => {
    if (!file) {
      setLogoError('Logo is required');
      return false;
    }
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setLogoError('Please upload a PNG or JPG file');
      return false;
    }
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setLogoError('File size must not exceed 5MB');
      return false;
    }
    setLogoError('');
    return true;
  };

  const validatePhone = (phone: string) => {
    // Kenyan (+254) phone number format: +254 followed by 9 digits, or 0 followed by 9 digits
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid Kenyan number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (value) {
      validateEmail(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phone: value });
    if (value) {
      validatePhone(value);
    }
  };

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, businessName: value });
    if (value) {
      validateBusinessName(value);
    }
  };

  const handleLogoUpload = (file: File | null) => {
    if (file) {
      validateLogo(file);
      setFormData({ ...formData, logo: file });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleLogoUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0] || null;
    handleLogoUpload(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !customInterests.includes(customInterest.trim())) {
      setCustomInterests([...customInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleRemoveCustomInterest = (interest: string) => {
    setCustomInterests(customInterests.filter(i => i !== interest));
  };

  const handleCustomInterestKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomInterest();
    }
  };

  const canProceedStep1 = formData.businessName && formData.location && formData.logo && !businessNameError && !logoError;
  const canProceedStep2 = formData.categories.length > 0;
  const canProceedStep3 = formData.email && formData.phone && !emailError && !phoneError;
  const canProceedStep4 = formData.signature && formData.acceptTerms;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onNavigate={onNavigate} currentPage="become-partner" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Application Submitted!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Thank you for your interest in becoming a partner.
            </p>
            <div className="rounded-xl p-6 mb-8 dark:bg-gray-700/50" style={{ backgroundColor: '#e6f7ff', borderWidth: '2px', borderStyle: 'solid', borderColor: '#27aae2' }}>
              <p className="text-lg font-semibold mb-2" style={{ color: '#1a8ec4' }}>What's Next?</p>
              <p className="text-gray-700 dark:text-gray-300">
                Our admin team will review your application within 24 hours. You'll receive an email at <strong>{formData.email}</strong> with the approval status.
              </p>
            </div>
            <button
              onClick={() => onNavigate('landing')}
              className="px-8 py-4 text-white rounded-xl font-bold transition-colors"
              style={{ backgroundColor: '#27aae2' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
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
        <Navbar onNavigate={onNavigate} currentPage="become-partner" />

      <div className="pt-10 ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Become a Partner
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
            Join thousands of event organizers using Niko Free
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" style={{ height: '3px' }}>
              <div
                className="h-full transition-all duration-500 ease-in-out rounded-full"
                style={{ 
                  width: `${(currentStep / 4) * 100}%`,
                  backgroundColor: '#27aae2'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1 mb-3">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left side - Form (2 columns) */}
          <div className="lg:col-span-2 p-8 md:p-12">
          
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h2>
                <p className="text-gray-600 dark:text-gray-400">Tell us about your business</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>Business/Brand Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleBusinessNameChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none transition-colors ${
                    businessNameError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ borderColor: formData.businessName && !businessNameError ? '#27aae2' : '' }}
                  onFocus={(e) => { if (!businessNameError) e.target.style.borderColor = '#27aae2'; }}
                  onBlur={(e) => { 
                    if (formData.businessName) validateBusinessName(formData.businessName);
                    if (!businessNameError && !formData.businessName) e.target.style.borderColor = '';
                  }}
                  placeholder="Enter your business or brand name"
                />
                {businessNameError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{businessNameError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="w-4 h-4" />
                  <span>Logo/Profile Picture Upload *</span>
                </label>
                <div 
                  className={`border-2 border-dashed dark:bg-gray-800 rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    logoError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  style={{ borderColor: formData.logo && !logoError ? '#27aae2' : '' }}
                  onMouseEnter={(e) => { if (!logoError) e.currentTarget.style.borderColor = '#27aae2'; }}
                  onMouseLeave={(e) => { if (!formData.logo && !logoError) e.currentTarget.style.borderColor = ''; }}
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {formData.logo ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 mx-auto" style={{ color: '#27aae2' }} />
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.logo.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(formData.logo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-sm" style={{ color: '#27aae2' }}>Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
                {logoError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{logoError}</span>
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleLocationChange}
                  onFocus={(e) => { 
                    if (formData.location.length >= 3) setShowLocationSuggestions(true);
                    e.target.style.borderColor = '#27aae2';
                  }}
                  onBlur={(e) => { if (!formData.location) e.target.style.borderColor = ''; }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none transition-colors"
                  style={{ borderColor: formData.location ? '#27aae2' : '' }}
                  placeholder="Search for your location..."
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className="w-full px-4 py-3 text-left transition-colors flex items-start space-x-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#27aae2' }} />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{location.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    canProceedStep1
                      ? 'text-white hover:opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={canProceedStep1 ? { backgroundColor: '#27aae2' } : {}}
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Categories & Interests */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Categories & Interests</h2>
                <p className="text-gray-600 dark:text-gray-400">What type of events will you organize?</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  <Tag className="w-4 h-4" />
                  <span>Select Categories * (Choose at least one)</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => {
                    const isSelected = formData.categories.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`px-4 py-2 rounded-full border-2 transition-all flex items-center space-x-2 ${
                          isSelected
                            ? 'text-white'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                        style={isSelected ? { 
                          borderColor: '#27aae2', 
                          backgroundColor: '#27aae2' 
                        } : {}}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#27aae2';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '';
                        }}
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                        {isSelected ? (
                          <Minus className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Additional Interests (Optional)</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyPress={handleCustomInterestKeyPress}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none transition-colors text-sm"
                    onFocus={(e) => e.target.style.borderColor = '#27aae2'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    placeholder="Type an interest and press Enter or click Add"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomInterest}
                    className="px-6 py-2 text-white rounded-xl font-medium hover:opacity-90 transition-colors text-sm"
                    style={{ backgroundColor: '#27aae2' }}
                  >
                    Add
                  </button>
                </div>
                {customInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customInterests.map((interest, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 rounded-full border-2 text-white flex items-center space-x-2"
                        style={{ borderColor: '#000000', backgroundColor: '#000000' }}
                      >
                        <span className="text-sm font-medium">{interest}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomInterest(interest)}
                          className="hover:bg-gray-800 rounded-full p-0.5 transition-colors"
                        >
                          <Minus className="w-4 h-4 flex-shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4" />
                    <span>Business Description (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    disabled={isGeneratingDescription || !formData.businessName}
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
                  placeholder="Describe your business, what you do, and what makes you unique..."
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none transition-colors resize-none"
                  onFocus={(e) => e.target.style.borderColor = '#27aae2'}
                  onBlur={(e) => { if (!formData.description) e.target.style.borderColor = ''; }}
                  style={{ borderColor: formData.description ? '#27aae2' : '' }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Help us understand your business better. This will be reviewed during your application.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevious}
                  className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center space-x-2 dark:hover:border-[#27aae2] dark:hover:text-[#27aae2]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#27aae2';
                    e.currentTarget.style.color = '#27aae2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.color = '';
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    canProceedStep2
                      ? 'text-white hover:opacity-90'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  style={canProceedStep2 ? { backgroundColor: '#27aae2' } : {}}
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Details</h2>
                <p className="text-gray-600 dark:text-gray-400">How can we reach you?</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Email to Receive RSVPs *</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none transition-colors ${
                    emailError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onFocus={(e) => { if (!emailError) e.target.style.borderColor = '#27aae2'; }}
                  onBlur={(e) => { 
                    if (formData.email) validateEmail(formData.email);
                    if (!emailError && !formData.email) e.target.style.borderColor = '';
                  }}
                  placeholder="email@example.com"
                />
                {emailError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{emailError}</span>
                  </p>
                )}
                {!emailError && formData.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You'll receive event confirmations and attendee notifications here</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>Contact Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none transition-colors ${
                    phoneError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onFocus={(e) => { if (!phoneError) e.target.style.borderColor = '#27aae2'; }}
                  onBlur={(e) => { 
                    if (formData.phone) validatePhone(formData.phone);
                    if (!phoneError && !formData.phone) e.target.style.borderColor = '';
                  }}
                  placeholder="+254 700 000 000"
                />
                {phoneError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{phoneError}</span>
                  </p>
                )}
                {!phoneError && formData.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will be displayed to attendees for inquiries</p>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevious}
                  className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center space-x-2 dark:hover:border-[#27aae2] dark:hover:text-[#27aae2]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#27aae2';
                    e.currentTarget.style.color = '#27aae2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.color = '';
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep3}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    canProceedStep3
                      ? 'text-white hover:opacity-90'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  style={canProceedStep3 ? { backgroundColor: '#27aae2' } : {}}
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Sign Contract */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Partner Agreement</h2>
                <p className="text-gray-600 dark:text-gray-400">Review and sign the partner contract</p>
              </div>

              {/* Flex container for large screens */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left side: Terms & Conditions */}
                <div className="lg:flex-1">
                  <div className="border-2 rounded-xl p-6 dark:bg-gray-800/50 h-full" style={{ backgroundColor: '#e6f7ff', borderColor: '#27aae2' }}>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Partner Terms & Conditions</span>
                    </h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 p-4 rounded-lg">
                      <p className="font-semibold">By signing this agreement, you agree to:</p>
                      <p>• Pay a 7% commission on all ticket sales processed through Niko Free</p>
                      <p>• Ensure all events comply with local laws and regulations</p>
                      <p>• Maintain high quality standards and attendee satisfaction</p>
                      <p>• Provide accurate event information and timely updates</p>
                      <p>• Respond to attendee inquiries within 24 hours</p>
                      <p>• Accept that Niko Free reserves the right to remove events that violate guidelines</p>
                      <p>• Understand that payment processing takes 2-3 business days</p>
                      <p>• Maintain ownership of your event content and data</p>
                      <p>• Comply with our data protection and privacy policies</p>
                      <p className="pt-2 font-semibold">Cancellation & Refund Policy:</p>
                      <p>• Refunds must be processed according to your stated event policy</p>
                      <p>• Partners are responsible for communicating cancellations to attendees</p>
                    </div>
                    <button 
                      className="text-sm font-medium transition-colors"
                      style={{ color: '#27aae2' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Read Full Terms & Conditions →
                    </button>
                  </div>
                </div>

                {/* Right side: Digital Signature & Agreement */}
                <div className="lg:flex-[1.5] space-y-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <PenTool className="w-4 h-4" />
                      <span>Digital Signature *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signature}
                      onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none transition-colors font-cursive text-xl"
                      onFocus={(e) => e.target.style.borderColor = '#27aae2'}
                      onBlur={(e) => { if (!formData.signature) e.target.style.borderColor = ''; }}
                      placeholder="Type your full name as signature"
                      style={{ fontFamily: 'Brush Script MT, cursive', borderColor: formData.signature ? '#27aae2' : '' }}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">By typing your name, you agree to sign this contract electronically</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        className="mt-1 w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2"
                        style={{ 
                          accentColor: '#27aae2',
                          outlineColor: '#27aae2'
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        I have read and agree to the Partner Terms & Conditions and Privacy Policy. I understand that my digital signature above constitutes a legally binding agreement.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Error message display */}
              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-3 mt-4">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Submission Failed</p>
                    <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center space-x-2 dark:hover:border-[#27aae2] dark:hover:text-[#27aae2] disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.borderColor = '#27aae2';
                      e.currentTarget.style.color = '#27aae2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedStep4 || isSubmitting}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    canProceedStep4 && !isSubmitting
                      ? 'text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  style={canProceedStep4 && !isSubmitting ? { 
                    background: 'linear-gradient(to right, #27aae2, #1a8ec4)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (canProceedStep4 && !isSubmitting) e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (canProceedStep4 && !isSubmitting) e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Benefits - Shows below form on small screens */}
        <div className="lg:hidden mt-8 px-4">
          {/* Benefit 1 - Step 1 */}
          {currentStep === 1 && (
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                <svg className="w-7 h-7" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Over 2 Million Users</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Visibility reach on your event with over 2 million active users browsing and discovering amazing experiences daily.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">User Growth</span>
                  <span className="font-bold" style={{ color: '#27aae2' }}>+75%</span>
                </div>
              </div>
            </div>
          )}

          {/* Benefit 2 - Step 2 */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                <svg className="w-7 h-7" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Instant Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                On user actions including ticket purchases, RSVPs, and attendee questions sent to you instantly in real-time.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="font-bold" style={{ color: '#27aae2' }}>Live 24/7</span>
                </div>
              </div>
            </div>
          )}

          {/* Benefit 3 - Step 3 */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                <svg className="w-7 h-7" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Know Estimated Event Attendance</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Get detailed analytics and insights with estimated attendance predictions to help you plan better and maximize success.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Prediction Accuracy</span>
                  <span className="font-bold" style={{ color: '#27aae2' }}>87%</span>
                </div>
              </div>
            </div>
          )}

          {/* Benefit 4 - Step 4 */}
          {currentStep === 4 && (
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                <svg className="w-7 h-7" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Set Attendees Limit</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Full control over capacity - choose unlimited attendance or set exclusive limits like "Only 100 tickets available" for your events.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Options</span>
                  <span className="font-bold" style={{ color: '#27aae2' }}>Unlimited / Custom</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Benefits (1 column) - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 mt-16">
            {/* Benefit 1 - Step 1 */}
            {currentStep === 1 && (
              <div className="p-8 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                  <svg className="w-10 h-10" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Over 2 Million Users</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Visibility reach on your event with over 2 million active users browsing and discovering amazing experiences daily.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">User Growth</span>
                    <span className="text-2xl font-bold" style={{ color: '#27aae2' }}>+75%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Benefit 2 - Step 2 */}
            {currentStep === 2 && (
              <div className="p-8 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                  <svg className="w-10 h-10" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Instant Notifications</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  On user actions including ticket purchases, RSVPs, and attendee questions sent to you instantly in real-time.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className="text-2xl font-bold" style={{ color: '#27aae2' }}>Live 24/7</span>
                  </div>
                </div>
              </div>
            )}

            {/* Benefit 3 - Step 3 */}
            {currentStep === 3 && (
              <div className="p-8 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                  <svg className="w-10 h-10" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Know Estimated Event Attendance</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get detailed analytics and insights with estimated attendance predictions to help you plan better and maximize success.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Prediction Accuracy</span>
                    <span className="text-2xl font-bold" style={{ color: '#27aae2' }}>87%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Benefit 4 - Step 4 */}
            {currentStep === 4 && (
              <div className="p-8 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(39, 170, 226, 0.1)' }}>
                  <svg className="w-10 h-10" style={{ color: '#27aae2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Set Attendees Limit</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Full control over capacity - choose unlimited attendance or set exclusive limits like "Only 100 tickets available" for your events.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Options</span>
                    <span className="text-2xl font-bold" style={{ color: '#27aae2' }}>Unlimited / Custom</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      </div>
      </div>
    </div>
  );
}
