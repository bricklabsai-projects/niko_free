import { X, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { register, login, forgotPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function LoginModal({ isOpen, onClose, onNavigate }: LoginModalProps) {
  const { setAuthData } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between sign up and log in
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  if (!isOpen) return null;

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Handle social login logic here
    onClose();
    onNavigate('user-dashboard');
  };

  const handleEmailLogin = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up validation
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
        
        // Prepare registration data
        const registrationData = {
          email: email.trim().toLowerCase(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        };
        
        console.log('Sending registration data:', {
          email: registrationData.email,
          first_name: registrationData.first_name,
          last_name: registrationData.last_name,
        });
        
        // Call register API
        const registerResponse = await register(registrationData);
        
        // Update AuthContext
        if (registerResponse.access_token && registerResponse.user) {
          setAuthData(registerResponse.user, registerResponse.access_token);
        }
        
        console.log('Registration successful');
      } else {
        // Call login API
        const loginResponse = await login({
          email: email.trim().toLowerCase(),
          password,
        });
        
        // Update AuthContext
        if (loginResponse.access_token && loginResponse.user) {
          setAuthData(loginResponse.user, loginResponse.access_token);
        }
        
        console.log('Login successful');
      }
      
      // Close modal and navigate to user dashboard
      setShowEmailModal(false);
      onClose();
      // Trigger a custom event to notify navbar
      window.dispatchEvent(new Event('storage'));
      onNavigate('user-dashboard');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(forgotPasswordEmail.trim().toLowerCase());
      setResetEmailSent(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setError('');
    setResetEmailSent(false);
    setIsLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {!showEmailModal && (
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          {/* Center modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">Quick Sign In</h2>
              
              {/* Subtitle */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Join events, get recommendations based on your interest. Find where your friends are going.
              </p>

              {/* Social login buttons */}
              <div className="space-y-3 mb-6">
                {/* Facebook */}
                <button 
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Facebook</span>
                </button>

                {/* Apple */}
                <button 
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Apple</span>
                </button>

                {/* Google */}
                <button 
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
                </button>

                {/* Email */}
                <button 
                  onClick={handleEmailLogin}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Email</span>
                </button>
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
                By Signing In, I agree to AllEvents's{' '}
                <button 
                  className="font-medium transition-colors"
                  style={{ color: '#27aae2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a8ec4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#27aae2'}
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button 
                  className="font-medium transition-colors"
                  style={{ color: '#27aae2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a8ec4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#27aae2'}
                >
                  Terms of Service
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Form Modal - Unified Sign Up / Log In */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80 backdrop-blur-sm"
              onClick={handleCloseEmailModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
              {/* Close button */}
              <button
                onClick={handleCloseEmailModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {/* Toggle Sign Up / Log In */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                      }}
                      className={`px-6 py-2 rounded-md font-medium transition-all ${
                        isSignUp
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      style={isSignUp ? { background: 'linear-gradient(to right, #27aae2, #1a8ec4)' } : {}}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                      }}
                      className={`px-6 py-2 rounded-md font-medium transition-all ${
                        !isSignUp
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      style={!isSignUp ? { background: 'linear-gradient(to right, #27aae2, #1a8ec4)' } : {}}
                    >
                      Log In
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                
                {/* Subtitle */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  {isSignUp ? 'Sign up to get started' : 'Log in to continue'}
                </p>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3 flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#27aae2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* First Name and Last Name - Only for Sign Up */}
                  {isSignUp && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  )}

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                      required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#27aae2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Forgot Password Link - Only for Log In */}
                    {!isSignUp && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setShowEmailModal(false);
                          }}
                          className="text-sm font-medium transition-colors"
                          style={{ color: '#27aae2' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password - Only for Sign Up */}
                  {isSignUp && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27aae2';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                    <button
                      type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                    <button
                      type="submit"
                    disabled={isLoading}
                    className={`w-full px-4 py-3.5 text-white rounded-xl font-medium transition-all mt-6 flex items-center justify-center space-x-2 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                    }`}
                      style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                    >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{isSignUp ? 'Signing up...' : 'Logging in...'}</span>
                      </>
                    ) : (
                      <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
                    )}
                    </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80 backdrop-blur-sm"
              onClick={handleCloseForgotPassword}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
              {/* Close button */}
              <button
                onClick={handleCloseForgotPassword}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {!resetEmailSent ? (
                  <>
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                      Forgot Password?
                    </h2>
                    
                    {/* Subtitle */}
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      Enter your email and we'll send you a reset link
                    </p>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3 flex items-start space-x-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="forgotEmail"
                          name="forgotEmail"
                          autoComplete="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27aae2';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCloseForgotPassword}
                          disabled={isLoading}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                          }`}
                          style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Send Reset Link</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Check Your Email
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We've sent a password reset link to
                        <br />
                        <strong>{forgotPasswordEmail}</strong>
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          The link will expire in 1 hour. If you don't see the email, check your spam folder.
                        </p>
                      </div>
                      <button
                        onClick={handleCloseForgotPassword}
                        className="w-full px-4 py-3 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                        style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
