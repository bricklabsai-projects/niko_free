import React, { useState, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';

interface CalendarPageProps {
  onNavigate: (page: string) => void;
  onEventClick: (eventId: string) => void;
}

export default function CalendarPage({ onNavigate, onEventClick }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const eventsRef = useRef<HTMLDivElement>(null);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(selectedMonth);
    const startDay = startOfMonth(selectedMonth);

    // Add empty cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i));
    }

    return days;
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Smooth scroll to events section
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Sample events data
  const events = [
    {
      id: '1',
      title: 'Tech Conference',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 15, 2025',
      time: '9:00 AM',
      location: 'KICC, Nairobi',
      attendees: 500,
      category: 'Technology',
      price: 'KES 2,000'
    },
    {
      id: '2',
      title: 'Music Festival',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 15, 2025',
      time: '6:00 PM',
      location: 'Uhuru Park, Nairobi',
      attendees: 1000,
      category: 'Music',
      price: 'KES 1,500'
    },
    {
      id: '3',
      title: 'Fitness Bootcamp',
      image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 18, 2025',
      time: '7:00 AM',
      location: 'Karura Forest, Nairobi',
      attendees: 50,
      category: 'Sports & Fitness',
      price: 'KES 500'
    },
    {
      id: '4',
      title: 'Art Exhibition',
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 20, 2025',
      time: '10:00 AM',
      location: 'National Museum, Nairobi',
      attendees: 200,
      category: 'Arts & Culture',
      price: 'KES 300'
    },
    {
      id: '5',
      title: 'Startup Pitch Night',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 22, 2025',
      time: '5:00 PM',
      location: 'iHub, Nairobi',
      attendees: 150,
      category: 'Business',
      price: 'Free'
    },
    {
      id: '6',
      title: 'Food Festival',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 25, 2025',
      time: '12:00 PM',
      location: 'Two Rivers Mall, Nairobi',
      attendees: 800,
      category: 'Food & Drink',
      price: 'KES 1,000'
    },
  ];

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

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
        <Navbar onNavigate={onNavigate} currentPage="calendar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12" data-aos="fade-down">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#27aae2' }}>
            <CalendarIcon className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Event Calendar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            Browse Events by Date
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
            Find events on specific dates and plan your schedule
          </p>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-12 transition-colors duration-200" data-aos="zoom-in">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{formatDate(selectedMonth)}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2 transition-colors duration-200">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((date, index) => (
              <button
                key={index}
                onClick={() => date && handleDateClick(date)}
                className={`
                  aspect-square p-1 rounded-lg transition-all relative flex flex-col items-start
                  ${!date ? 'invisible' : ''}
                  ${date && isToday(date) ? 'text-white' : ''}
                  ${date && isSelectedDate(date) ? 'text-white' : ''}
                  ${date && !isToday(date) && !isSelectedDate(date) ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100' : ''}
                `}
                style={
                  date && (isToday(date) || isSelectedDate(date))
                    ? { backgroundColor: '#27aae2' }
                    : {}
                }
              >
                <span className="text-sm font-medium mb-0.5">{date?.getDate()}</span>
                {date && hasEvents(date) && (
                  <div className="w-full space-y-0.5 overflow-hidden">
                    {getEventsForDate(date).slice(0, 2).map((event, i) => (
                      <div
                        key={i}
                        className={`text-[8px] leading-tight truncate w-full px-0.5 py-0.5 rounded ${
                          isSelectedDate(date) || isToday(date)
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                        style={
                          !isSelectedDate(date) && !isToday(date)
                            ? { backgroundColor: '#e6f7ff', color: '#1a8ec4' }
                            : {}
                        }
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDate(date).length > 2 && (
                      <div
                        className={`text-[8px] text-center ${
                          isSelectedDate(date) || isToday(date) ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        +{getEventsForDate(date).length - 2}
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div ref={eventsRef} className="scroll-mt-24" data-aos="fade-up">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
            Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {selectedDateEvents.length > 0 && (
              <span className="ml-2" style={{ color: '#27aae2' }}>({selectedDateEvents.length})</span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedDateEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                onClick={onEventClick}
              />
            ))}
            {selectedDateEvents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-200">No events found on this date</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 transition-colors duration-200">Try selecting another date</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
