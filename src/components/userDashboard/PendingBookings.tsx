import { Clock, X, CreditCard, AlertCircle, Calendar, MapPin, DollarSign, CheckCircle, Timer } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserBookings, getUserProfile } from '../../services/userService';
import { API_BASE_URL, getImageUrl } from '../../config/api';
import { getToken } from '../../services/authService';
import { initiatePayment, checkPaymentStatus } from '../../services/paymentService';

interface PendingBooking {
  id: number;
  booking_number: string;
  quantity: number;
  total_amount: number;
  created_at: string;
  reserved_until?: string | null;
  event: {
    id: number;
    title: string;
    poster_image?: string;
    start_date: string;
    venue_name?: string;
    venue_address?: string;
    is_free: boolean;
  };
}

export default function PendingBookings() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: number]: number }>({});
  const [userPhone, setUserPhone] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<{ [key: number]: { paymentId?: number; status?: string; message?: string } }>({});
  const processedExpiredRef = useRef<Set<number>>(new Set());
  const lastReleaseCallRef = useRef<number>(0);
  const lastFetchRef = useRef<number>(0);
  const pendingBookingsRef = useRef<PendingBooking[]>([]);
  const timeRemainingRef = useRef<{ [key: number]: number }>({});

  useEffect(() => {
    fetchPendingBookings();
    fetchUserPhone();
  }, []);

  const fetchUserPhone = async () => {
    try {
      const profile = await getUserProfile();
      if (profile.phone_number) {
        setUserPhone(profile.phone_number);
      }
    } catch (err) {
      console.error('Error fetching user phone:', err);
    }
  };

  // Update refs when bookings or time remaining change
  useEffect(() => {
    pendingBookingsRef.current = pendingBookings;
  }, [pendingBookings]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  // Countdown timer effect - runs independently of bookings changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimeRemaining: { [key: number]: number } = {};
      const expiredBookings: number[] = [];
      const currentBookings = pendingBookingsRef.current;

      currentBookings.forEach((booking) => {
        if (!booking.event.is_free) {
          if (booking.reserved_until) {
            // Use actual reserved_until time
            try {
              const reservedUntil = new Date(booking.reserved_until).getTime();
              if (!isNaN(reservedUntil) && reservedUntil > 0) {
                const remaining = Math.floor((reservedUntil - now) / 1000);
                newTimeRemaining[booking.id] = Math.max(0, remaining);
                
                // Track expired bookings that haven't been processed yet
                if (remaining <= 0 && !processedExpiredRef.current.has(booking.id)) {
                  expiredBookings.push(booking.id);
                  processedExpiredRef.current.add(booking.id);
                }
              } else {
                // Invalid date - use countdown from current (use ref for current value)
                const current = timeRemainingRef.current[booking.id];
                if (current !== undefined && current > 0) {
                  newTimeRemaining[booking.id] = Math.max(0, current - 1);
                } else {
                  newTimeRemaining[booking.id] = 300; // Start at 5 minutes
                }
              }
            } catch (e) {
              console.error(`Error calculating timer for booking ${booking.id}:`, e);
              // Fallback: countdown from current time (use ref for current value)
              const current = timeRemainingRef.current[booking.id];
              if (current !== undefined && current > 0) {
                newTimeRemaining[booking.id] = Math.max(0, current - 1);
              } else {
                newTimeRemaining[booking.id] = 300; // Start at 5 minutes
              }
            }
          } else {
            // No reserved_until - countdown from current time remaining (use ref for current value)
            const current = timeRemainingRef.current[booking.id];
            if (current !== undefined && current > 0) {
              newTimeRemaining[booking.id] = Math.max(0, current - 1);
            } else {
              // Initialize to 5 minutes if not set
              newTimeRemaining[booking.id] = 300;
            }
          }
        }
      });

      setTimeRemaining(newTimeRemaining);

      // Only call release API if we have newly expired bookings and haven't called recently (debounce)
      const timeSinceLastCall = now - lastReleaseCallRef.current;
      const timeSinceLastFetch = now - lastFetchRef.current;
      
      if (expiredBookings.length > 0 && timeSinceLastCall > 10000 && timeSinceLastFetch > 5000) {
        lastReleaseCallRef.current = now;
        releaseExpiredBookings().then(() => {
          // Refresh list after a delay, but only if enough time has passed
          if (now - lastFetchRef.current > 5000) {
            lastFetchRef.current = now;
            setTimeout(() => {
              fetchPendingBookings();
            }, 2000);
          }
        }).catch(() => {
          // Silently fail - we'll retry on next expiration
        });
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once

  const releaseExpiredBookings = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/tickets/release-expired`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Don't throw on 429 (rate limited) - just log
      if (response.status === 429) {
        console.log('Rate limited on release-expired, will retry later');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to release expired bookings');
      }
    } catch (err) {
      // Silently handle errors - we'll retry later
      console.error('Error releasing expired bookings:', err);
    }
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getUserBookings('pending');
      const allBookings = response.bookings || [];
      
      // Show all pending bookings (including past events)
      // Users should be able to see and cancel past pending bookings
      // The "Pay Now" button will be disabled for past events anyway
      setPendingBookings(allBookings);
      
      // Initialize time remaining for all bookings
      // If reserved_until is missing, set it to 5 minutes from now for display purposes
      const now = new Date().getTime();
      const initialTimeRemaining: { [key: number]: number } = {};
      
      allBookings.forEach((booking: PendingBooking) => {
        if (!booking.event.is_free) {
          if (booking.reserved_until) {
            // Use the actual reserved_until time
            try {
              const reservedUntil = new Date(booking.reserved_until).getTime();
              if (!isNaN(reservedUntil) && reservedUntil > 0) {
                const remaining = Math.floor((reservedUntil - now) / 1000);
                if (remaining > 0) {
                  initialTimeRemaining[booking.id] = remaining;
                } else {
                  // Already expired - start fresh 5 minute timer for display
                  initialTimeRemaining[booking.id] = 300; // 5 minutes
                }
              }
            } catch (e) {
              console.error(`Error parsing reserved_until for booking ${booking.id}:`, e);
              // Fallback to 5 minutes if parsing fails
              initialTimeRemaining[booking.id] = 300; // 5 minutes
            }
          } else {
            // No reserved_until set - set to 5 minutes from now for display
            // This handles old bookings created before reserved_until was added
            initialTimeRemaining[booking.id] = 300; // 5 minutes in seconds
          }
        }
      });
      
      console.log('Timer initialized:', initialTimeRemaining);
      setTimeRemaining(initialTimeRemaining);
    } catch (err: any) {
      console.error('Error fetching pending bookings:', err);
      const errorMessage = err.message || 'Failed to load pending bookings';
      
      // If rate limited, show a more helpful message
      if (errorMessage.includes('Too many requests')) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (booking: PendingBooking) => {
    if (booking.event.is_free) {
      // Free events shouldn't have pending bookings, but handle it gracefully
      alert('This is a free event. No payment required.');
      return;
    }

    // Get phone number - use saved or prompt user
    let phoneNumber = userPhone;
    
    if (!phoneNumber) {
      const input = prompt('Enter your M-Pesa phone number (e.g., 254712345678):');
      if (!input) {
        return; // User cancelled
      }
      phoneNumber = input.trim();
      
      // Format phone number (remove spaces, ensure it starts with 254)
      phoneNumber = phoneNumber.replace(/\s+/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('254')) {
        phoneNumber = '254' + phoneNumber;
      }
    }

    try {
      setProcessingPayment(booking.id);
      setPaymentStatus(prev => ({ ...prev, [booking.id]: { status: 'initiating', message: 'Initiating payment...' } }));
      
      // Initiate payment
      const result = await initiatePayment({
        booking_id: booking.id,
        phone_number: phoneNumber,
      });

      if (result.payment_id) {
        setPaymentStatus(prev => ({ 
          ...prev, 
          [booking.id]: { 
            paymentId: result.payment_id, 
            status: 'pending', 
            message: 'Payment request sent! Please check your phone and enter your M-Pesa PIN.' 
          } 
        }));

        // Start polling for payment status
        pollPaymentStatus(result.payment_id, booking.id);
      } else {
        throw new Error(result.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      setPaymentStatus(prev => ({ 
        ...prev, 
        [booking.id]: { 
          status: 'error', 
          message: err.message || 'Failed to initiate payment. Please try again.' 
        } 
      }));
    } finally {
      setProcessingPayment(null);
    }
  };

  const pollPaymentStatus = async (paymentId: number, bookingId: number) => {
    const maxAttempts = 60; // Poll for up to 60 seconds
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.payment?.status === 'completed' || result.payment?.status === 'paid') {
          setPaymentStatus(prev => ({ 
            ...prev, 
            [bookingId]: { 
              paymentId, 
              status: 'success', 
              message: 'Payment successful! Your booking is confirmed.' 
            } 
          }));
          
          // Refresh bookings after a short delay
          setTimeout(() => {
            fetchPendingBookings();
          }, 2000);
          
          return;
        } else if (result.payment?.status === 'failed') {
          setPaymentStatus(prev => ({ 
            ...prev, 
            [bookingId]: { 
              paymentId, 
              status: 'failed', 
              message: 'Payment failed. Please try again.' 
            } 
          }));
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        } else {
          setPaymentStatus(prev => ({ 
            ...prev, 
            [bookingId]: { 
              paymentId, 
              status: 'timeout', 
              message: 'Payment is still processing. Please check your M-Pesa messages.' 
            } 
          }));
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        }
      }
    };

    // Start polling after 3 seconds
    setTimeout(checkStatus, 3000);
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingBooking(bookingId);
      
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to cancel a booking');
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/cancel/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Send empty JSON body
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific error messages
        const errorMsg = data.msg || data.error || 'Failed to cancel booking';
        if (errorMsg.includes('past events') || errorMsg.includes('already started')) {
          throw new Error('Cannot cancel booking for events that have already passed');
        }
        throw new Error(errorMsg);
      }

      // Remove from list
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      alert('Booking cancelled successfully');
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking: ' + (err.message || 'Unknown error'));
    } finally {
      setCancellingBooking(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isEventPast = (dateString: string): boolean => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const now = new Date();
    // Compare dates, accounting for timezone - only consider event past if it's clearly in the past
    // Add a small buffer (1 minute) to account for timing differences
    return eventDate.getTime() < (now.getTime() - 60000); // 1 minute buffer
  };

  const formatCountdown = (seconds: number | undefined): string => {
    if (seconds === undefined || seconds <= 0) return 'Expired';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')} mins remaining`;
    }
    return `${secs} secs remaining`;
  };

  const getCountdownColor = (seconds: number): string => {
    if (seconds <= 0) return 'text-red-600 dark:text-red-400';
    if (seconds <= 60) return 'text-red-600 dark:text-red-400'; // Less than 1 minute - red
    if (seconds <= 180) return 'text-orange-600 dark:text-orange-400'; // Less than 3 minutes - orange
    return 'text-yellow-600 dark:text-yellow-400'; // More than 3 minutes - yellow
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (pendingBookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Bookings</h3>
        <p className="text-gray-500 dark:text-gray-400">You have no pending bookings that require payment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              Action Required: Complete Your Bookings
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              You have {pendingBookings.length} pending booking{pendingBookings.length > 1 ? 's' : ''} that require payment. 
              Complete payment to secure your tickets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white dark:bg-gray-800 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all p-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Event Image */}
              <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <img
                  src={getImageUrl(booking.event.poster_image)}
                  alt={booking.event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              </div>

              {/* Booking Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {booking.event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2 flex-wrap">
                      <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        PENDING PAYMENT
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-xs">#{booking.booking_number}</span>
                      {!booking.event.is_free && (
                        <>
                          <span className="text-gray-400">•</span>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 ${getCountdownColor(timeRemaining[booking.id] ?? 300)}`}>
                            <Timer className="w-3 h-3" />
                            <span className="text-xs font-bold">
                              {timeRemaining[booking.id] !== undefined && timeRemaining[booking.id]! > 0
                                ? formatCountdown(timeRemaining[booking.id])
                                : '5:00 mins remaining'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span>{formatDate(booking.event.start_date)} at {formatTime(booking.event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span>{booking.event.venue_name || booking.event.venue_address || 'Location TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                  {!booking.event.is_free && (
                    <div className={`flex items-center gap-2 ${getCountdownColor(timeRemaining[booking.id] ?? 300)}`}>
                      <Timer className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">
                        {timeRemaining[booking.id] !== undefined && timeRemaining[booking.id]! > 0 ? (
                          `Complete payment in ${formatCountdown(timeRemaining[booking.id]!)} to secure your tickets`
                        ) : (
                          'Complete payment within 5 minutes to secure your tickets'
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} • KES {parseFloat(booking.total_amount.toString()).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Status Message */}
                {paymentStatus[booking.id] && (
                  <div className={`mb-3 p-3 rounded-lg ${
                    paymentStatus[booking.id].status === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : paymentStatus[booking.id].status === 'error' || paymentStatus[booking.id].status === 'failed'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className={`text-sm font-medium ${
                      paymentStatus[booking.id].status === 'success'
                        ? 'text-green-700 dark:text-green-400'
                        : paymentStatus[booking.id].status === 'error' || paymentStatus[booking.id].status === 'failed'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-blue-700 dark:text-blue-400'
                    }`}>
                      {paymentStatus[booking.id].message}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {!booking.event.is_free && (
                    <button
                      onClick={() => handlePayNow(booking)}
                      disabled={processingPayment === booking.id || paymentStatus[booking.id]?.status === 'success'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-4 h-4" />
                      {processingPayment === booking.id 
                        ? 'Initiating Payment...' 
                        : paymentStatus[booking.id]?.status === 'success'
                        ? 'Payment Successful ✓'
                        : paymentStatus[booking.id]?.status === 'pending'
                        ? 'Waiting for Payment...'
                        : 'Pay Now'}
                    </button>
                  )}
                  {(() => {
                    const eventIsPast = isEventPast(booking.event.start_date);
                    return (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingBooking === booking.id || eventIsPast}
                        title={eventIsPast ? 'Cannot cancel booking for events that have already passed' : ''}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

