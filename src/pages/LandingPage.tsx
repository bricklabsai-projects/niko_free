import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight, Dumbbell, Users, Music, Heart, Dog, Car, Sparkles, Brain, Gamepad2, ShoppingBag, Church, Target, Camera, Calendar, Share2, Briefcase, Theater, Bus, Mountain } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import PartnerLoginModal from '../components/PartnerLoginModal';
import { getFeaturedEvents, getEvents, getCategories } from '../services/eventService';
import { API_BASE_URL } from '../config/api';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onEventClick: (eventId: string) => void;
}

export default function LandingPage({ onNavigate, onEventClick }: LandingPageProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Detecting location...');
  const [locationPlaceholder, setLocationPlaceholder] = useState('Detecting location...');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoriesRef = React.useRef<HTMLDivElement>(null);
  const cantMissRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showCantMissLeftArrow, setShowCantMissLeftArrow] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{display_name: string, lat: string, lon: string}>>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const locationInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const [showAd, setShowAd] = useState(false);
  const [adDismissed, setAdDismissed] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const lastScrollY = React.useRef(0);
  const [showPartnerLoginModal, setShowPartnerLoginModal] = useState(false);
  const [categoryRotation, setCategoryRotation] = useState(0);
  const [rotationDirection, setRotationDirection] = useState<'left' | 'right'>('right');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search events...');
  const [heroText, setHeroText] = useState('');
  const [cantMissEvents, setCantMissEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Ad Configuration (This would come from admin panel in production)
  const adConfig = {
    enabled: true,
    title: "Limited Time Offer! 🎉",
    description: "Get 30% off on all premium events this month. Use code PREMIUM30 at checkout.",
    buttonText: "Claim Offer",
    buttonLink: "/calendar",
    imageUrl: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600",
    showFrequency: 2, // Show ad every 2 scroll events
  };

  React.useEffect(() => {
    // Get user's location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.county || data.address.state;
            const country = data.address.country;
            const locationString = `${city}, ${country}`;
            setSelectedLocation(locationString);
            setLocationPlaceholder(locationString);
          } catch (error) {
            console.error('Error getting location name:', error);
            setSelectedLocation('Nairobi, Kenya');
            setLocationPlaceholder('Nairobi, Kenya');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setSelectedLocation('Nairobi, Kenya');
          setLocationPlaceholder('Nairobi, Kenya');
        }
      );
    } else {
      setSelectedLocation('Nairobi, Kenya');
      setLocationPlaceholder('Nairobi, Kenya');
    }
  }, []);

  // Typing animation for search placeholder
  React.useEffect(() => {
    const categoryNames = [
      'Search events...',
      'Explore-Kenya events...',
      'Hiking adventures...',
      'Sports & Fitness...',
      'Social Activities...',
      'Music & Dance...',
      'Technology events...',
      'Art & Photography...',
      'Gaming events...',
      'Shopping events...',
      'Religious events...',
      'Health & Wellbeing...',
      'Culture events...',
      'Business events...',
      'Live Plays...',
      'Pets & Animals...',
      'Coaching & Support...',
      'Autofest events...',
      'Hobbies & Interests...'
    ];

    let charIndex = 0;
    let isDeleting = false;
    let categoryIndex = 0;

    const typeWriter = () => {
      const currentCategory = categoryNames[categoryIndex];
      
      if (!isDeleting) {
        // Typing
        setSearchPlaceholder(currentCategory.substring(0, charIndex + 1));
        charIndex++;
        
        if (charIndex === currentCategory.length) {
          // Pause at end before deleting
          setTimeout(() => {
            isDeleting = true;
          }, 2000);
        }
      } else {
        // Deleting
        setSearchPlaceholder(currentCategory.substring(0, charIndex - 1));
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
          categoryIndex = (categoryIndex + 1) % categoryNames.length;
        }
      }
    };

    const typingInterval = setInterval(() => {
      typeWriter();
    }, isDeleting ? 50 : 100); // Faster when deleting

    return () => clearInterval(typingInterval);
  }, []);

  // Typing effect for hero heading
  React.useEffect(() => {
    const fullText = 'Discover Amazing Events';
    let charIndex = 0;
    let isDeleting = false;

    const typeWriter = () => {
      if (!isDeleting) {
        // Typing
        setHeroText(fullText.substring(0, charIndex + 1));
        charIndex++;
        
        if (charIndex === fullText.length) {
          // Pause at end before deleting
          setTimeout(() => {
            isDeleting = true;
          }, 2000);
        }
      } else {
        // Deleting
        setHeroText(fullText.substring(0, charIndex - 1));
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
        }
      }
    };

    const typingInterval = setInterval(() => {
      typeWriter();
    }, isDeleting ? 50 : 100); // Faster when deleting

    return () => clearInterval(typingInterval);
  }, []);

  // Auto-rotate categories every 5 seconds with random direction
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      // Randomly choose direction
      const randomDirection = Math.random() > 0.5 ? 'right' : 'left';
      setRotationDirection(randomDirection);
      
      setCategoryRotation((prev) => {
        if (randomDirection === 'right') {
          return prev + 1;
        } else {
          return prev - 1;
        }
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(intervalId);
  }, []);


  // Fetch events by category when category is selected
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      const fetchCategoryEvents = async () => {
        try {
          const response = await getEvents({ category: selectedCategory, per_page: 20 });
          const events = (response.events || []).map((event: any) => {
            const startDate = event.start_date ? new Date(event.start_date) : new Date();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let dateStr = 'Tomorrow';
            if (daysDiff === 0) {
              dateStr = 'Today';
            } else if (daysDiff > 1) {
              dateStr = startDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric'
              });
            }
            
            const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            
            // Check if event is sold out
            let isSoldOut = false;
            if (!event.is_free && event.ticket_types && event.ticket_types.length > 0) {
              const hasAvailableTickets = event.ticket_types.some((tt: any) => {
                const isActive = tt.is_active !== false; // Default to true if not set
                const hasQuantity = tt.quantity_available !== null && tt.quantity_available > 0;
                return isActive && (tt.quantity_total === null || hasQuantity);
              });
              isSoldOut = !hasAvailableTickets;
            }
            
            return {
              id: event.id.toString(),
              title: event.title,
              image: event.poster_image 
                ? (event.poster_image.startsWith('http') 
                    ? event.poster_image 
                    : `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`)
                : 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=600',
              date: dateStr,
              time: timeStr,
              location: event.venue_name || event.venue_address || 'Online',
              attendees: event.attendee_count || 0,
              category: event.category?.name || 'General',
              price: event.is_free ? 'Free' : (event.ticket_types?.[0]?.price ? `KES ${parseInt(event.ticket_types[0].price).toLocaleString()}` : 'TBA'),
              isSoldOut: isSoldOut
            };
          });
          setUpcomingEvents(events);
        } catch (err) {
          console.error('Error fetching category events:', err);
        }
      };

      fetchCategoryEvents();
    } else if (selectedCategory === null) {
      // Fetch all events when "All" is selected
      const fetchAllEvents = async () => {
        try {
          const response = await getEvents({ per_page: 20 });
          const events = (response.events || []).map((event: any) => {
            const startDate = event.start_date ? new Date(event.start_date) : new Date();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let dateStr = 'Tomorrow';
            if (daysDiff === 0) {
              dateStr = 'Today';
            } else if (daysDiff > 1) {
              dateStr = startDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric'
              });
            }
            
            const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            
            return {
              id: event.id.toString(),
              title: event.title,
              image: event.poster_image 
                ? (event.poster_image.startsWith('http') 
                    ? event.poster_image 
                    : `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`)
                : 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=600',
              date: dateStr,
              time: timeStr,
              location: event.venue_name || event.venue_address || 'Online',
              attendees: event.attendee_count || 0,
              category: event.category?.name || 'General',
              price: event.is_free ? 'Free' : (event.ticket_types?.[0]?.price ? `KES ${parseInt(event.ticket_types[0].price).toLocaleString()}` : 'TBA')
            };
          });
          setUpcomingEvents(events);
        } catch (err) {
          console.error('Error fetching all events:', err);
        }
      };

      fetchAllEvents();
    }
  }, [selectedCategory]);

  // Fetch featured events (Can't Miss)
  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await getFeaturedEvents(10);
        const events = (response.events || []).map((event: any) => {
          const startDate = event.start_date ? new Date(event.start_date) : new Date();
          const dateStr = startDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric'
          });
          const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          
          // Check if event is sold out
          let isSoldOut = false;
          if (!event.is_free && event.ticket_types && event.ticket_types.length > 0) {
            const hasAvailableTickets = event.ticket_types.some((tt: any) => {
              const isActive = tt.is_active !== false; // Default to true if not set
              const hasQuantity = tt.quantity_available !== null && tt.quantity_available > 0;
              return isActive && (tt.quantity_total === null || hasQuantity);
            });
            isSoldOut = !hasAvailableTickets;
          }
          
          return {
            id: event.id.toString(),
            title: event.title,
            image: event.poster_image 
              ? (event.poster_image.startsWith('http') 
                  ? event.poster_image 
                  : `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`)
              : 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
            date: dateStr,
            time: timeStr,
            location: event.venue_name || event.venue_address || 'Online',
            attendees: event.attendee_count || 0,
            category: event.category?.name || 'General',
            price: event.is_free ? 'Free' : (event.ticket_types?.[0]?.price ? `KES ${parseInt(event.ticket_types[0].price).toLocaleString()}` : 'TBA'),
            isSoldOut: isSoldOut
          };
        });
        setCantMissEvents(events);
      } catch (err) {
        console.error('Error fetching featured events:', err);
        // Keep empty array on error
        setCantMissEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  // Fetch upcoming events for categories section
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await getEvents({ per_page: 20 });
        const events = (response.events || []).map((event: any) => {
          const startDate = event.start_date ? new Date(event.start_date) : new Date();
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let dateStr = 'Tomorrow';
          if (daysDiff === 0) {
            dateStr = 'Today';
          } else if (daysDiff > 1) {
            dateStr = startDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric'
            });
          }
          
          const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          
          // Check if event is sold out
          // Event is sold out if:
          // 1. It has ticket types AND
          // 2. All ticket types are either disabled (is_active = false) OR have 0 available tickets
          let isSoldOut = false;
          if (!event.is_free && event.ticket_types && event.ticket_types.length > 0) {
            const hasAvailableTickets = event.ticket_types.some((tt: any) => {
              const isActive = tt.is_active !== false; // Default to true if not set
              const hasQuantity = tt.quantity_available !== null && tt.quantity_available > 0;
              return isActive && (tt.quantity_total === null || hasQuantity);
            });
            isSoldOut = !hasAvailableTickets;
          }
          
          return {
            id: event.id.toString(),
            title: event.title,
            image: event.poster_image 
              ? (event.poster_image.startsWith('http') 
                  ? event.poster_image 
                  : `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`)
              : 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=600',
            date: dateStr,
            time: timeStr,
            location: event.venue_name || event.venue_address || 'Online',
            attendees: event.attendee_count || 0,
            category: event.category?.name || 'General',
            price: event.is_free ? 'Free' : (event.ticket_types?.[0]?.price ? `KES ${parseInt(event.ticket_types[0].price).toLocaleString()}` : 'TBA'),
            isSoldOut: isSoldOut
          };
        });
        setUpcomingEvents(events);
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        setUpcomingEvents([]);
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await getCategories();
        const cats = (response.categories || []).map((cat: any) => {
          // Map category names to icons (keep existing mapping)
          const iconMap: { [key: string]: any } = {
            'Travel': Bus,
            'Hiking': Mountain,
            'Sports & Fitness': Dumbbell,
            'Social Activities': Users,
            'Hobbies & Interests': Sparkles,
            'Religious': Church,
            'Autofest': Car,
            'Health & Wellbeing': Heart,
            'Music & Dance': Music,
            'Music & Culture': Music,
            'Culture': Theater,
            'Dance': Music,
            'Pets & Animals': Dog,
            'Coaching & Support': Target,
            'Business & Networking': Briefcase,
            'Technology': Brain,
            'Live Plays': Theater,
            'Art & Photography': Camera,
            'Shopping': ShoppingBag,
            'Gaming': Gamepad2
          };
          
          return {
            name: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
            displayName: cat.name === 'Travel' ? 'Explore- 🇰🇪' : cat.name,
            icon: iconMap[cat.name] || Users,
            count: cat.event_count || 0,
            iconColor: '#27aae2' // Default color
          };
        });
        
        // Add "All" category at the beginning
        setCategories([
          { name: 'All', icon: Users, count: upcomingEvents.length, iconColor: '#6B7280' },
          ...cats
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Keep default categories on error
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [upcomingEvents.length]);

  // Use categories from API, fallback to default if not loaded
  const displayCategories = React.useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }
    // Fallback default categories
    return [
      { name: 'All', icon: Users, count: upcomingEvents.length, iconColor: '#6B7280' },
      { name: 'Explore-Kenya', displayName: 'Explore- 🇰🇪', icon: Bus, count: 0, iconColor: '#0EA5E9' },
      { name: 'Hiking', icon: Mountain, count: 0, iconColor: '#059669' },
      { name: 'Sports & Fitness', icon: Dumbbell, count: 0, iconColor: '#10B981' },
      { name: 'Social Activities', icon: Users, count: 0, iconColor: '#A855F7' },
      { name: 'Hobbies & Interests', icon: Sparkles, count: 0, iconColor: '#F59E0B' },
      { name: 'Religious', icon: Church, count: 0, iconColor: '#6366F1' },
      { name: 'Autofest', icon: Car, count: 0, iconColor: '#FFA500' },
      { name: 'Health & Wellbeing', icon: Heart, count: 0, iconColor: '#EC4899' },
      { name: 'Music & Dance', icon: Music, count: 0, iconColor: '#EF4444' },
      { name: 'Culture', icon: Theater, count: 0, iconColor: '#F59E0B' },
      { name: 'Pets & Animals', icon: Dog, count: 0, iconColor: '#F97316' },
      { name: 'Coaching & Support', icon: Target, count: 0, iconColor: '#14B8A6' },
      { name: 'Business & Networking', icon: Briefcase, count: 0, iconColor: '#475569' },
      { name: 'Technology', icon: Brain, count: 0, iconColor: '#8B5CF6' },
      { name: 'Live Plays', icon: Theater, count: 0, iconColor: '#E11D48' },
      { name: 'Art & Photography', icon: Camera, count: 0, iconColor: '#10B981' },
      { name: 'Shopping', icon: ShoppingBag, count: 0, iconColor: '#D946EF' },
      { name: 'Gaming', icon: Gamepad2, count: 0, iconColor: '#7C3AED' }
    ];
  }, [categories, upcomingEvents.length]);

  // Rotate categories while keeping "All" at the first position with random direction
  const rotatedCategories = React.useMemo(() => {
    const allCategory = displayCategories[0];
    const otherCategories = displayCategories.slice(1);
    
    // Use absolute value for rotation and modulo to keep it in range
    const absRotation = Math.abs(categoryRotation) % otherCategories.length;
    
    // Determine if we should rotate forward or backward based on rotation value
    let rotated;
    if (categoryRotation >= 0) {
      rotated = [
        ...otherCategories.slice(absRotation),
        ...otherCategories.slice(0, absRotation)
      ];
    } else {
      // Rotate in reverse direction
      const reverseIndex = otherCategories.length - absRotation;
      rotated = [
        ...otherCategories.slice(reverseIndex),
        ...otherCategories.slice(0, reverseIndex)
      ];
    }
    
    return [allCategory, ...rotated];
  }, [categoryRotation, displayCategories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoriesRef.current) return;
    const scrollAmount = 600;
    categoriesRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleCategoryScroll = () => {
    if (categoriesRef.current) {
      setShowLeftArrow(categoriesRef.current.scrollLeft > 0);
    }
  };

  const handleCantMissScroll = () => {
    if (cantMissRef.current) {
      setShowCantMissLeftArrow(cantMissRef.current.scrollLeft > 0);
    }
  };

  const scrollCantMiss = (direction: 'left' | 'right') => {
    if (!cantMissRef.current) return;
    const scrollAmount = 600;
    cantMissRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  React.useEffect(() => {
    const element = categoriesRef.current;
    if (element) {
      element.addEventListener('scroll', handleCategoryScroll);
      return () => element.removeEventListener('scroll', handleCategoryScroll);
    }
  }, []);

  React.useEffect(() => {
    const element = cantMissRef.current;
    if (element) {
      element.addEventListener('scroll', handleCantMissScroll);
      return () => element.removeEventListener('scroll', handleCantMissScroll);
    }
  }, []);

  // Auto-scroll Can't Miss events
  React.useEffect(() => {
    const element = cantMissRef.current;
    if (!element) return;

    let isPaused = false;
    let pauseTimeout: NodeJS.Timeout;

    const autoScroll = () => {
      if (isPaused) return;

      const maxScroll = element.scrollWidth - element.clientWidth;
      const currentScroll = element.scrollLeft;

      if (currentScroll >= maxScroll) {
        // Reset to start when reaching the end
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll to the next event card (approximately 300px)
        element.scrollBy({ left: 300, behavior: 'smooth' });
      }
    };

    // Start auto-scrolling every 3 seconds
    const scrollInterval = setInterval(autoScroll, 3000);

    // Pause auto-scroll when user hovers over the section
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    // Pause auto-scroll when user manually scrolls
    const handleUserScroll = () => {
      isPaused = true;
      clearTimeout(pauseTimeout);
      // Resume auto-scroll after 5 seconds of inactivity
      pauseTimeout = setTimeout(() => {
        isPaused = false;
      }, 5000);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('scroll', handleUserScroll);

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(pauseTimeout);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('scroll', handleUserScroll);
    };
  }, []);

  React.useEffect(() => {
    // Close search on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll detection for showing ad
  React.useEffect(() => {
    if (!adConfig.enabled || adDismissed) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Clear previous timeout
      clearTimeout(scrollTimeout);
      
      // Set timeout to detect when scrolling stops
      scrollTimeout = setTimeout(() => {
        // Only count significant scrolls (more than 100px)
        if (Math.abs(currentScrollY - lastScrollY.current) > 100) {
          lastScrollY.current = currentScrollY;
          setScrollCount(prev => {
            const newCount = prev + 1;
            // Show ad based on frequency
            if (newCount >= adConfig.showFrequency && currentScrollY > 300) {
              setShowAd(true);
              return 0; // Reset counter
            }
            return newCount;
          });
        }
      }, 150); // Wait 150ms after scroll stops
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [adDismissed, adConfig.enabled, adConfig.showFrequency]);

  const handleCloseAd = () => {
    setShowAd(false);
    setAdDismissed(true);
    // Reset dismissed state after 5 minutes
    setTimeout(() => {
      setAdDismissed(false);
    }, 5 * 60 * 1000);
  };

  const handleAdClick = () => {
    setShowAd(false);
    onNavigate(adConfig.buttonLink.replace('/', ''));
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ke`
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setShowLocationSuggestions(true);
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const selectLocationSuggestion = (suggestion: {display_name: string}) => {
    setSelectedLocation(suggestion.display_name);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 relative">
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
      
      <div className="relative">
        {/* Hero Video Section with Overlay Content */}
        <div className="relative h-[550px] sm:h-[570px] md:h-[620px] lg:h-[680px] xl:h-[720px] overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video/watermarked_preview.mp4" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <img 
              src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1920" 
              alt="Events background"
              className="w-full h-full object-cover"
            />
          </video>

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

          {/* Navbar on top of video */}
          <div className="sticky top-0 z-[70]">
            <Navbar onNavigate={onNavigate} currentPage="landing" />
          </div>

          {/* Content Overlay */}
          <div className="relative h-full flex flex-col justify-between py-3 sm:py-4 md:py-6">
            {/* Top Section - Search Bar */}
            <div className="relative z-[60]">
              <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-1 md:py-1.5" data-aos="fade-down">
                <div ref={searchContainerRef} className="relative">
                  {/* Mobile: Collapsed Search Button */}
                  {!isSearchExpanded && (
                    <button
                      onClick={() => setIsSearchExpanded(true)}
                      className="md:hidden w-full flex items-center justify-center space-x-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2.5 shadow-xl transition-all"
                    >
                      <Search className="w-5 h-5" style={{ color: '#27aae2' }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{searchPlaceholder}</span>
                    </button>
                  )}

                  {/* Expanded Search (Mobile) or Always Visible (Desktop) */}
                  <div className={`${isSearchExpanded ? 'block' : 'hidden md:flex'} flex-col md:flex-row items-stretch md:items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl md:rounded-full border border-gray-200 dark:border-gray-700 p-1.5 gap-1.5 transition-colors duration-200 shadow-xl`}>
                    {/* Close Button (Mobile Only) */}
                    <button
                      onClick={() => setIsSearchExpanded(false)}
                      className="md:hidden absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                    >
                      <span className="text-gray-500 text-xl">×</span>
                    </button>

                    {/* Search Input */}
                    <div className="flex-1 flex items-center space-x-2 px-2 py-1.5 min-w-0 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Divider - Vertical on desktop, Horizontal on mobile */}
                    <div className="h-px w-full md:h-8 md:w-px bg-gray-300 dark:bg-gray-600"></div>

                    {/* Location Input */}
                    <div className="w-full md:w-64 relative">
                      <div className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <input
                          ref={locationInputRef}
                          type="text"
                          placeholder={locationPlaceholder}
                          value={selectedLocation}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          onFocus={() => {
                            if (selectedLocation === locationPlaceholder) {
                              setSelectedLocation('');
                              setShowLocationSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow clicking on suggestions
                            setTimeout(() => {
                              if (selectedLocation === '') {
                                setSelectedLocation(locationPlaceholder);
                              }
                              setShowLocationSuggestions(false);
                            }, 200);
                          }}
                          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      
                      {showLocationSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-[100] max-h-64 overflow-y-auto transition-colors duration-200">
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => selectLocationSuggestion(suggestion)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-start space-x-3"
                            >
                              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">{suggestion.display_name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Search Button */}
                    <button 
                      className="w-full md:w-10 h-10 text-white rounded-full flex items-center justify-center transform hover:scale-105 transition-all flex-shrink-0" 
                      style={{ backgroundColor: '#27aae2' }} 
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a8ec4'} 
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27aae2'}
                      onClick={() => {
                        // Handle search action
                        setIsSearchExpanded(false);
                      }}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section - Hero Content */}
            <div className="flex-1 flex items-center">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full py-4">
                <div className="grid xl:grid-cols-2 gap-6 items-center">
                  {/* Left Side - Main Content */}
                  <div className="text-center xl:text-left" data-aos="fade-up">
                    <div className="inline-flex items-center space-x-2 backdrop-blur-sm px-3 py-1.5 rounded-full mb-2 mx-auto xl:mx-0" style={{ backgroundColor: 'rgba(39, 170, 226, 0.3)' }}>
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                      <span className="font-semibold text-[10px] sm:text-xs text-white">Niko Free</span>
                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {heroText}
                </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed mb-3 sm:mb-4 md:mb-6">
                      Join millions of people discovering and attending incredible events every day. From concerts to conferences, find your next adventure with Niko Free.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center xl:justify-start gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-base sm:text-xl md:text-2xl font-bold text-white">2M+</p>
                          <p className="text-[10px] sm:text-xs text-gray-200">Active Users</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-base sm:text-xl md:text-2xl font-bold text-white">10K+</p>
                          <p className="text-[10px] sm:text-xs text-gray-200">Events Monthly</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-base sm:text-xl md:text-2xl font-bold text-white">98%</p>
                          <p className="text-[10px] sm:text-xs text-gray-200">Satisfaction</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center xl:justify-start gap-2 sm:gap-3">
                      <button 
                        onClick={() => onNavigate('become-partner')}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transform hover:scale-105 transition-all shadow-xl"
                        style={{ color: '#27aae2' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Become a Partner
                      </button>
                      <button 
                        onClick={() => setShowPartnerLoginModal(true)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur-md rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transform hover:scale-105 transition-all shadow-xl"
                        style={{ color: '#27aae2' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                      >
                        Partner Login
                      </button>
                      <button 
                        onClick={() => onNavigate('about')}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Dynamic Ad */}
                  {showAd && adConfig.enabled && (
                    <div 
                      className="hidden xl:block"
                      data-aos="fade-left"
                      data-aos-duration="500"
                    >
                      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden max-w-md ml-auto">
                        {/* Close Button */}
                        <button
                          onClick={handleCloseAd}
                          className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-900/50 hover:bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group"
                        >
                          <span className="text-white text-xl group-hover:scale-110 transition-transform">×</span>
                        </button>

                        {/* Ad Image */}
                        {adConfig.imageUrl && (
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={adConfig.imageUrl}
                              alt="Advertisement"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          </div>
                        )}

                        {/* Ad Content */}
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {adConfig.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                            {adConfig.description}
                          </p>
                          <button
                            onClick={handleAdClick}
                            className="w-full py-3 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                            style={{ backgroundColor: '#27aae2' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a8ec4'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27aae2'}
                          >
                            {adConfig.buttonText}
                          </button>
                        </div>

                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-bl-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Can't Miss Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16" data-aos="fade-up">
      {/* Featured Events Banner - Commented Out */}

      {/* <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative h-96 md:h-[500px]">
            <img
              src={featuredEvents[currentBanner].image}
              alt={featuredEvents[currentBanner].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {featuredEvents[currentBanner].title}
                </h2>
                <p className="text-xl text-gray-200 mb-6">
                  {featuredEvents[currentBanner].description}
                </p>
                <div className="flex flex-wrap gap-4 text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{featuredEvents[currentBanner].location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{featuredEvents[currentBanner].date}</span>
                  </div>
                </div>
                <button
                  onClick={() => onEventClick(featuredEvents[currentBanner].id)}
                  className="mt-6 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transform hover:scale-105 transition-all shadow-lg"
                >
                  View Event Details
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentBanner === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div> */}

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Can't Miss!</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-200">Promoted events you shouldn't miss</p>
        </div>

        <div className="relative">
          {isLoadingEvents ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
            </div>
          ) : cantMissEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No featured events available</p>
            </div>
          ) : (
            <div ref={cantMissRef} className="overflow-x-auto scrollbar-hide hide-scrollbar snap-x snap-mandatory">
              <div className="flex gap-3 sm:gap-4 md:gap-6 pb-4">
                {cantMissEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex-shrink-0 snap-start snap-always w-[calc(100vw-2rem)] sm:w-[280px] md:w-[300px] lg:w-[calc(25%-18px)] cursor-pointer group"
                  onClick={() => onEventClick(event.id)}
                >
                  <div className="rounded-2xl overflow-hidden h-full">
                    <div className="relative h-48 sm:h-36 md:h-40">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0"></div>
                      
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 transition-opacity duration-300 group-hover:opacity-0">
                        <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                          <span className="hidden sm:inline">CAN'T MISS</span>
                          <span className="sm:hidden">HOT</span>
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: event.title,
                              text: `Check out this event: ${event.title}`,
                              url: window.location.href,
                            });
                          }
                        }}
                        className="absolute top-2 sm:top-3 left-2 sm:left-3 w-9 sm:w-10 h-9 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-10"
                      >
                        <Share2 className="w-4 sm:w-5 h-4 sm:h-5 text-gray-900" />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-opacity duration-300 group-hover:opacity-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    <div className="py-3 sm:py-4 px-1">
                      <div className="space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <img
                              src={`https://i.pravatar.cc/150?img=${(parseInt(event.id) * 3) % 70}`}
                              alt="Attendee"
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src={`https://i.pravatar.cc/150?img=${(parseInt(event.id) * 3 + 1) % 70}`}
                              alt="Attendee"
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src={`https://i.pravatar.cc/150?img=${(parseInt(event.id) * 3 + 2) % 70}`}
                              alt="Attendee"
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-500 truncate">+{event.attendees - 3} attending</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:gap-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 sm:mt-4">
                        <div className="flex-shrink-0">
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {event.price}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event.id);
                          }}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 text-white rounded-lg font-semibold transition-colors text-sm whitespace-nowrap"
                          style={{ backgroundColor: '#27aae2' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a8ec4'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27aae2'}
                        >
                          {event.price === 'Free' ? 'RSVP' : 'Get Tickets'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}

          {/* Scroll Arrows for Can't Miss */}
          <button
            onClick={() => scrollCantMiss('left')}
            className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full items-center justify-center shadow-xl hover:bg-gray-50 transition-all z-10 ${showCantMissLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={() => scrollCantMiss('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full items-center justify-center shadow-xl hover:bg-gray-50 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16" data-aos="fade-up">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Browse by Category</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-200">Find events that match your interests</p>
        </div>

        {/* Mobile Layout: Side-by-side */}
        <div className="md:hidden flex gap-2 h-[500px]">
          {/* Categories Sidebar - Left */}
          <div className="w-20 flex-shrink-0 flex flex-col">
            {/* All Category - Fixed at top */}
            {(() => {
              const allCategory = rotatedCategories[0];
              const Icon = allCategory.icon;
              const isSelected = selectedCategory === null;
              return (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex flex-col items-center rounded-lg px-1 py-2 mb-1.5 transition-all duration-200 ${
                    isSelected ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full mb-1 transition-transform ${
                    isSelected ? 'scale-110' : ''
                  }`} style={{ backgroundColor: isSelected ? '#27aae2' : 'transparent' }}>
                    <Icon className="w-4 h-4" style={{ color: isSelected ? '#ffffff' : allCategory.iconColor }} />
                  </div>
                  <span className={`text-[8px] text-center leading-tight ${
                    isSelected ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'
                  }`}>
                    {allCategory.name}
                  </span>
                  <span className="text-[7px] text-gray-500 dark:text-gray-500 mt-0.5">
                    {allCategory.count}
                  </span>
                </button>
              );
            })()}

            {/* Other Categories - Scrollable */}
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1.5 pr-0.5">
              {rotatedCategories.slice(1).map((category, idx) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.name;
                return (
                  <button
                    key={`${category.name}-${categoryRotation}-${idx}`}
                    onClick={() => setSelectedCategory(category.name === 'All' ? null : category.name)}
                    className={`w-full flex flex-col items-center rounded-lg px-1 py-2 transition-all duration-200 ${
                      isSelected ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full mb-1 transition-transform ${
                      isSelected ? 'scale-110' : ''
                    }`} style={{ backgroundColor: isSelected ? '#27aae2' : 'transparent' }}>
                      <Icon className="w-4 h-4" style={{ color: isSelected ? '#ffffff' : category.iconColor }} />
                    </div>
                    <span className={`text-[8px] text-center leading-tight ${
                      isSelected ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'
                    }`}>
                      {category.displayName || category.name}
                    </span>
                    <span className="text-[7px] text-gray-500 dark:text-gray-500 mt-0.5">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events Grid - Right */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              {(selectedCategory ? upcomingEvents.filter(event => event.category === selectedCategory) : upcomingEvents)
                .map(event => (
                  <EventCard
                    key={event.id}
                    {...event}
                    onClick={onEventClick}
                  />
                ))}
            </div>
            {(selectedCategory && upcomingEvents.filter(event => event.category === selectedCategory).length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">No events found in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout: Original horizontal scroll */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                ref={categoriesRef}
                className="flex gap-6 snap-x snap-mandatory overflow-x-auto pb-6 hide-scrollbar"
              >
                {rotatedCategories.map((category, index) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.name || (!selectedCategory && index === 0);
                  return (
                    <button
                      key={`${category.name}-${categoryRotation}`}
                      onClick={() => setSelectedCategory(index === 0 ? null : category.name)}
                      className={`flex-none snap-start group flex flex-col items-center rounded-xl px-4 py-4 transition-all duration-200 relative`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 mb-2 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7" style={{ color: category.iconColor }} />
                      </div>
                      <span className={`text-sm mb-1 text-center whitespace-nowrap ${isSelected ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-900 dark:text-gray-300 group-hover:font-bold'}`}>{category.displayName || category.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">{category.count} events</span>
                      <span className={`absolute left-3 right-3 bottom-0 h-1 rounded-full ${isSelected ? '' : 'bg-gray-200 dark:bg-gray-700'}`} style={isSelected ? { backgroundColor: '#27aae2' } : {}} />
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => scrollCategories('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {(selectedCategory ? upcomingEvents.filter(event => event.category === selectedCategory) : upcomingEvents)
              .map(event => (
                <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <EventCard
                    {...event}
                    onClick={onEventClick}
                  />
                </div>
              ))}
          </div>
          {(selectedCategory && upcomingEvents.filter(event => event.category === selectedCategory).length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">No events found in this category</p>
            </div>
          )}
        </div>
      </div>

      <div className="py-20 bg-[#27aae2]" data-aos="fade-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Host Your Own Event?
          </h2>
          <p className="text-xl text-gray-100 mb-8 leading-relaxed">
            Join thousands of organizers using Niko Free to create memorable experiences.
            Start for free and reach your community today.
          </p>
          <button
            onClick={() => onNavigate('become-partner')}
            className="px-10 py-4 bg-white rounded-xl font-bold text-lg transform hover:scale-105 transition-all shadow-xl"
            style={{ color: '#27aae2' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Become a Partner
          </button>
        </div>
      </div>

      <Footer />
      
      {/* Partner Login Modal */}
      <PartnerLoginModal
        isOpen={showPartnerLoginModal}
        onClose={() => setShowPartnerLoginModal(false)}
        onNavigate={onNavigate}
      />
      </div>
    </div>
  );
}
