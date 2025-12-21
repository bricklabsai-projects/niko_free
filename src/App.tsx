import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventDetailPage from './pages/EventDetailPage';
import UserDashboard from './pages/UserDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BecomePartner from './pages/BecomePartner';
import AboutUs from './pages/AboutUs';
import ThisWeekend from './pages/ThisWeekend';
import CalendarPage from './pages/CalendarPage';
import AOS from 'aos';
import 'aos/dist/aos.css';

function AppContent() {
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string>('1');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }, []);

  const navigateToEventDetail = (eventId: string) => {
    setSelectedEventId(eventId);
    navigate('/event-detail');
  };

  const navigateTo = (page: string) => {
    navigate(`/${page === 'landing' ? '' : page}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage
              onNavigate={navigateTo}
              onEventClick={navigateToEventDetail}
            />
          } 
        />
        <Route 
          path="/event-detail" 
          element={
            <EventDetailPage
              eventId={selectedEventId}
              onNavigate={navigateTo}
            />
          } 
        />
        <Route 
          path="/user-dashboard" 
          element={<UserDashboard onNavigate={navigateTo} />} 
        />
        <Route 
          path="/partner-dashboard" 
          element={<PartnerDashboard onNavigate={navigateTo} />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={<AdminDashboard onNavigate={navigateTo} />} 
        />
        <Route 
          path="/become-partner" 
          element={<BecomePartner onNavigate={navigateTo} />} 
        />
        <Route 
          path="/about" 
          element={<AboutUs onNavigate={navigateTo} />} 
        />
        <Route 
          path="/this-weekend" 
          element={
            <ThisWeekend 
              onNavigate={navigateTo} 
              onEventClick={navigateToEventDetail} 
            />
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <CalendarPage 
              onNavigate={navigateTo} 
              onEventClick={navigateToEventDetail} 
            />
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
