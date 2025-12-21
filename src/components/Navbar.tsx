import { Menu, X, LogIn, Moon, Sun, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import logo from '../images/Niko Free Logo.png';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getUser } from '../services/authService';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function Navbar({ onNavigate, currentPage = 'landing' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Update user when isAuthenticated changes
    if (isAuthenticated) {
      const userData = getUser();
      setUser(userData);
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      currentPage === 'landing' 
        ? 'bg-transparent backdrop-blur-sm' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-11 sm:h-12 md:h-14 lg:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2"
            >
              <img 
                src={logo} 
                alt="Niko Free Logo" 
                className="h-6 sm:h-7 md:h-8 lg:h-10 w-auto transform hover:scale-105 transition-transform"
              />
            </button>

            <div className="hidden md:flex space-x-0.5 lg:space-x-1">
              <button
                onClick={() => onNavigate('landing')}
                className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-xs md:text-sm lg:text-base font-medium transition-colors ${
                  currentPage === 'landing' 
                    ? 'text-white border-b-2'
                    : currentPage === 'event-detail'
                    ? 'text-gray-700 dark:text-gray-300 border-b-2'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                style={currentPage === 'landing' ? { color: '#ffffff', borderColor: '#27aae2' } : currentPage === 'event-detail' ? { color: '#27aae2', borderColor: '#27aae2' } : {}}
                onMouseEnter={(e) => { 
                  if (currentPage !== 'landing' && currentPage !== 'event-detail') { 
                    e.currentTarget.style.color = '#27aae2'; 
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (currentPage !== 'landing' && currentPage !== 'event-detail') { 
                    e.currentTarget.style.color = ''; 
                  } 
                }}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-xs md:text-sm lg:text-base font-medium transition-colors ${
                  currentPage === 'landing' 
                    ? 'text-white/90'
                    : currentPage === 'about'
                    ? 'text-gray-700 dark:text-gray-300 border-b-2'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                style={currentPage === 'about' ? { color: '#27aae2', borderColor: '#27aae2' } : {}}
                onMouseEnter={(e) => { 
                  if (currentPage !== 'about') { 
                    e.currentTarget.style.color = '#27aae2'; 
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (currentPage !== 'about') { 
                    e.currentTarget.style.color = ''; 
                  } 
                }}
              >
                About Us
              </button>
              <button
                onClick={() => onNavigate('this-weekend')}
                className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-xs md:text-sm lg:text-base font-medium transition-colors ${
                  currentPage === 'landing' 
                    ? 'text-white/90'
                    : currentPage === 'this-weekend'
                    ? 'text-gray-700 dark:text-gray-300 border-b-2'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                style={currentPage === 'this-weekend' ? { color: '#27aae2', borderColor: '#27aae2' } : {}}
                onMouseEnter={(e) => { 
                  if (currentPage !== 'this-weekend') { 
                    e.currentTarget.style.color = '#27aae2'; 
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (currentPage !== 'this-weekend') { 
                    e.currentTarget.style.color = ''; 
                  } 
                }}
              >
                This Weekend
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-xs md:text-sm lg:text-base font-medium transition-colors ${
                  currentPage === 'landing' 
                    ? 'text-white/90'
                    : currentPage === 'calendar'
                    ? 'text-gray-700 dark:text-gray-300 border-b-2'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                style={currentPage === 'calendar' ? { color: '#27aae2', borderColor: '#27aae2' } : {}}
                onMouseEnter={(e) => { 
                  if (currentPage !== 'calendar') { 
                    e.currentTarget.style.color = '#27aae2'; 
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (currentPage !== 'calendar') { 
                    e.currentTarget.style.color = ''; 
                  } 
                }}
              >
                Calendar
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 md:space-x-2 lg:space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-1 md:p-1.5 lg:p-2 rounded-lg font-medium transition-colors ${
                currentPage === 'landing' ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" style={{ color: '#27aae2' }} />
              ) : (
                <Moon className={`w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 ${
                  currentPage === 'landing' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`} />
              )}
            </button>
            <button
              onClick={() => onNavigate('become-partner')}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-lg text-[10px] md:text-xs lg:text-sm font-medium transition-colors ${
                currentPage === 'landing' 
                  ? 'text-white hover:bg-white/10' 
                  : 'dark:hover:bg-gray-800'
              }`}
              style={currentPage === 'landing' ? {} : { color: '#27aae2' }}
              onMouseEnter={(e) => { 
                if (currentPage !== 'landing') {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#e6f7ff';
                }
              }}
              onMouseLeave={(e) => { 
                if (currentPage !== 'landing') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="hidden lg:inline">Become a Partner</span>
              <span className="lg:hidden">Partner</span>
            </button>
            {isAuthenticated && user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-lg font-medium transition-all"
                  style={{ 
                    background: currentPage === 'landing' ? 'rgba(255, 255, 255, 0.2)' : '#e6f7ff',
                    color: currentPage === 'landing' ? '#ffffff' : '#27aae2'
                  }}
                >
                  <User className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden lg:inline text-xs md:text-sm">
                    {user.first_name || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 user-menu-container">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('user-dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center space-x-1 md:space-x-1.5 lg:space-x-2 px-2 md:px-3 lg:px-6 py-1 md:py-1.5 lg:py-2.5 text-[10px] md:text-xs lg:text-sm text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
            >
              <LogIn className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
              <span>Sign In</span>
            </button>
            )}
          </div>

          <button
            className="md:hidden p-0.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`w-5 h-5 ${currentPage === 'landing' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${currentPage === 'landing' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 shadow-lg z-50">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                (currentPage === 'landing' || currentPage === 'event-detail')
                  ? 'font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              style={(currentPage === 'landing' || currentPage === 'event-detail') ? { backgroundColor: isDarkMode ? '#1f2937' : '#e6f7ff', color: '#27aae2' } : {}}
              onMouseEnter={(e) => { if (currentPage !== 'landing' && currentPage !== 'event-detail') e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#e6f7ff'; }}
              onMouseLeave={(e) => { if (currentPage !== 'landing' && currentPage !== 'event-detail') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'about' 
                  ? 'font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              style={currentPage === 'about' ? { backgroundColor: isDarkMode ? '#1f2937' : '#e6f7ff', color: '#27aae2' } : {}}
              onMouseEnter={(e) => { if (currentPage !== 'about') e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#e6f7ff'; }}
              onMouseLeave={(e) => { if (currentPage !== 'about') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              About Us
            </button>
            <button
              onClick={() => { onNavigate('this-weekend'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'this-weekend' 
                  ? 'font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              style={currentPage === 'this-weekend' ? { backgroundColor: isDarkMode ? '#1f2937' : '#e6f7ff', color: '#27aae2' } : {}}
              onMouseEnter={(e) => { if (currentPage !== 'this-weekend') e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#e6f7ff'; }}
              onMouseLeave={(e) => { if (currentPage !== 'this-weekend') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              This Weekend
            </button>
            <button
              onClick={() => { onNavigate('calendar'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'calendar' 
                  ? 'font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              style={currentPage === 'calendar' ? { backgroundColor: isDarkMode ? '#1f2937' : '#e6f7ff', color: '#27aae2' } : {}}
              onMouseEnter={(e) => { if (currentPage !== 'calendar') e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#e6f7ff'; }}
              onMouseLeave={(e) => { if (currentPage !== 'calendar') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Calendar
            </button>
            <button
              onClick={toggleTheme}
              className="w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium flex items-center space-x-2 transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-5 h-5" style={{ color: '#27aae2' }} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => { onNavigate('become-partner'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-lg font-medium dark:hover:bg-gray-800 transition-colors"
              style={{ color: '#27aae2' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#e6f7ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Become a Partner
            </button>
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onNavigate('user-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2.5 text-red-600 dark:text-red-400 rounded-lg font-medium text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
            <button
              onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
              className="block w-full px-4 py-2.5 text-white rounded-lg font-medium"
              style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
            >
              Sign In
            </button>
            )}
          </div>
        </div>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
