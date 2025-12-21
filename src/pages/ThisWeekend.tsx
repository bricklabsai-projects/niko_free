import React, { useState } from 'react';
import { MapPin, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';

interface ThisWeekendProps {
  onNavigate: (page: string) => void;
  onEventClick: (eventId: string) => void;
}

export default function ThisWeekend({ onNavigate, onEventClick }: ThisWeekendProps) {
  const [selectedLocation, setSelectedLocation] = useState('Nairobi, Kenya');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [showNextWeekLeftArrow, setShowNextWeekLeftArrow] = useState(false);
  const nextWeekRef = React.useRef<HTMLDivElement>(null);

  const allEvents = [
    {
      id: '1',
      title: 'Weekend Art Exhibition',
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Sat, Nov 2',
      day: 'Saturday',
      time: '10:00 AM',
      location: 'National Museum',
      attendees: 230,
      category: 'Culture',
      price: 'KES 300'
    },
    {
      id: '2',
      title: 'Jazz Night Live',
      image: 'https://images.pexels.com/photos/1481308/pexels-photo-1481308.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Sat, Nov 2',
      day: 'Saturday',
      time: '8:00 PM',
      location: 'Alliance Française',
      attendees: 189,
      category: 'Music',
      price: 'KES 800'
    },
    {
      id: '3',
      title: 'Morning Yoga in the Park',
      image: 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Sun, Nov 3',
      day: 'Sunday',
      time: '6:00 AM',
      location: 'Karura Forest',
      attendees: 45,
      category: 'Fitness',
      price: 'Free'
    },
    {
      id: '4',
      title: 'Tech Thursday Meetup',
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Thu, Oct 31',
      day: 'Thursday',
      time: '6:00 PM',
      location: 'iHub Nairobi',
      attendees: 120,
      category: 'Technology',
      price: 'Free'
    },
    {
      id: '5',
      title: 'Friday Night Comedy',
      image: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Fri, Nov 1',
      day: 'Friday',
      time: '8:30 PM',
      location: 'Comedy Club Kenya',
      attendees: 156,
      category: 'Entertainment',
      price: 'KES 500'
    },
    {
      id: '6',
      title: 'Thursday Food Market',
      image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Thu, Oct 31',
      day: 'Thursday',
      time: '12:00 PM',
      location: 'Village Market',
      attendees: 340,
      category: 'Food',
      price: 'Free'
    },
    {
      id: '7',
      title: 'Friday Beach Cleanup',
      image: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Fri, Nov 1',
      day: 'Friday',
      time: '8:00 AM',
      location: 'Diani Beach',
      attendees: 78,
      category: 'Community',
      price: 'Free'
    },
    {
      id: '8',
      title: 'Sunday Brunch & Music',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Sun, Nov 3',
      day: 'Sunday',
      time: '11:00 AM',
      location: 'Java House Karen',
      attendees: 95,
      category: 'Food',
      price: 'KES 1200'
    }
  ];

  const days = ['All', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Next week events
  const nextWeekEvents = [
    {
      id: '9',
      title: 'Business Networking Breakfast',
      image: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Mon, Nov 4',
      day: 'Monday',
      time: '7:30 AM',
      location: 'Radisson Blu Hotel',
      attendees: 85,
      category: 'Business',
      price: 'KES 800'
    },
    {
      id: '10',
      title: 'Salsa Dance Classes',
      image: 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Tue, Nov 5',
      day: 'Tuesday',
      time: '7:00 PM',
      location: 'Dance Studio Nairobi',
      attendees: 42,
      category: 'Dance',
      price: 'KES 1500'
    },
    {
      id: '11',
      title: 'Photography Workshop',
      image: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Wed, Nov 6',
      day: 'Wednesday',
      time: '2:00 PM',
      location: 'Nairobi Gallery',
      attendees: 65,
      category: 'Photography',
      price: 'KES 2000'
    },
    {
      id: '12',
      title: 'Stand-Up Comedy Night',
      image: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Thu, Nov 7',
      day: 'Thursday',
      time: '8:00 PM',
      location: 'Laugh Inn',
      attendees: 178,
      category: 'Entertainment',
      price: 'KES 600'
    },
    {
      id: '13',
      title: 'Digital Marketing Seminar',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Fri, Nov 8',
      day: 'Friday',
      time: '9:00 AM',
      location: 'Nairobi Garage',
      attendees: 210,
      category: 'Business',
      price: 'KES 3500'
    },
    {
      id: '14',
      title: 'Live Jazz & Dinner',
      image: 'https://images.pexels.com/photos/1481308/pexels-photo-1481308.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Fri, Nov 8',
      day: 'Friday',
      time: '7:30 PM',
      location: 'The Alchemist',
      attendees: 134,
      category: 'Music',
      price: 'KES 2500'
    },
    {
      id: '15',
      title: 'Cycling Tour - Karura Forest',
      image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Sat, Nov 9',
      day: 'Saturday',
      time: '6:00 AM',
      location: 'Karura Forest',
      attendees: 98,
      category: 'Sports',
      price: 'KES 500'
    },
    {
      id: '16',
      title: 'Wine Tasting Experience',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: 'Sat, Nov 9',
      day: 'Saturday',
      time: '4:00 PM',
      location: 'Westlands Wine Bar',
      attendees: 56,
      category: 'Food',
      price: 'KES 3000'
    }
  ];

  // Filter events based on selected day and category
  const weekendEvents = allEvents.filter(event => {
    const matchesDay = selectedDay === 'All' || event.day === selectedDay;
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesDay && matchesCategory;
  });

  const categories = ['All', 'Music', 'Culture', 'Sports', 'Food', 'Technology', 'Fitness'];

  const handleNextWeekScroll = () => {
    if (nextWeekRef.current) {
      setShowNextWeekLeftArrow(nextWeekRef.current.scrollLeft > 0);
    }
  };

  const scrollNextWeek = (direction: 'left' | 'right') => {
    if (!nextWeekRef.current) return;
    const scrollAmount = 600;
    nextWeekRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  React.useEffect(() => {
    const element = nextWeekRef.current;
    if (element) {
      element.addEventListener('scroll', handleNextWeekScroll);
      return () => element.removeEventListener('scroll', handleNextWeekScroll);
    }
  }, []);

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
      
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} currentPage="this-weekend" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12" data-aos="fade-down">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#27aae2' }}>
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">This Weekend</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            Weekend Events Near You
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
            Discover exciting events happening this weekend in your area
          </p>
        </div>

        {/* Marketing Banner */}
        <div 
          className="relative overflow-hidden rounded-3xl mb-12 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #27aae2 0%, #1a8ec4 100%)'
          }}
          data-aos="fade-up"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative px-6 sm:px-12 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <span className="text-white text-sm font-semibold">🎉 Special Offer</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                Get 20% Off Your First Event!
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl">
                Join thousands of event-goers discovering amazing experiences. Use code <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">FIRST20</span> at checkout.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => onNavigate('calendar')}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Browse All Events
                </button>
                <button
                  onClick={() => onNavigate('become-partner')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold hover:bg-white/20 transition-all duration-200"
                >
                  Host Your Event
                </button>
              </div>
            </div>

            {/* Right Image/Icon */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-2xl font-bold text-gray-900">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Selection Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center" data-aos="fade-up">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedDay === day
                  ? 'text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
              }`}
              style={selectedDay === day ? { backgroundColor: '#27aae2' } : {}}
              onMouseEnter={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.borderColor = '#27aae2';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.borderColor = '';
                }
              }}
            >
              {day}
            </button>
          ))}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="100">
          {weekendEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onClick={onEventClick}
            />
          ))}
        </div>

        {weekendEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-200">No events found for this weekend</p>
          </div>
        )}
      </div>

      {/* Next Week Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 py-16 transition-colors duration-200" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#27aae2' }}>
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Coming Soon</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Next Week
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
              Plan ahead with upcoming events for next week
            </p>
          </div>

          <div className="relative">
            <div ref={nextWeekRef} className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-6 pb-4">
                {nextWeekEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[280px]"
                  >
                    <EventCard
                      {...event}
                      onClick={onEventClick}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Arrows for Next Week */}
            <button
              onClick={() => scrollNextWeek('left')}
              className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10 ${showNextWeekLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button
              onClick={() => scrollNextWeek('right')}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
