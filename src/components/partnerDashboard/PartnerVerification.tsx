import { Award, CheckCircle, Calendar, Users, Star, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPartnerVerification, claimVerificationBadge } from '../../services/partnerService';

export default function PartnerVerification() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getPartnerVerification();
      setVerificationData(data);
    } catch (err: any) {
      console.error('Error fetching verification data:', err);
      setError(err.message || 'Failed to load verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBadge = async () => {
    try {
      setIsClaiming(true);
      await claimVerificationBadge();
      // Refresh data
      await fetchVerificationData();
      alert('Congratulations! You are now NIKO VERIFIED! 🎉');
    } catch (err: any) {
      console.error('Error claiming badge:', err);
      alert(err.message || 'Failed to claim verification badge');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  if (error && !verificationData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Use real data from API
  const eventsHosted = verificationData?.verification?.events_hosted || 0;
  const totalBookings = verificationData?.verification?.total_bookings || 0;
  const eventsRequired = verificationData?.verification?.events_required || 10;
  const bookingsRequired = verificationData?.verification?.bookings_required || 500;
  const isEligible = verificationData?.verification?.is_eligible || false;
  const isVerified = verificationData?.verification?.is_verified || false;
  const partnerName = verificationData?.partner?.business_name || 'Partner';

  const eventsProgress = verificationData?.verification?.events_progress || 0;
  const bookingsProgress = verificationData?.verification?.bookings_progress || 0;

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Verified Badge',
      description: 'Display the NIKO VERIFIED badge on all your events'
    },
    {
      icon: TrendingUp,
      title: 'Priority Listing',
      description: 'Your events appear higher in search results'
    },
    {
      icon: Star,
      title: 'Enhanced Trust',
      description: 'Users are more likely to book verified events'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get faster response times from our support team'
    }
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">NIKO VERIFIED Badge</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Build trust and credibility with the verified badge
        </p>
        {partnerName && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Partner: <span className="font-semibold">{partnerName}</span>
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className={`rounded-xl shadow-md p-8 ${
        isEligible
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
          : 'bg-gradient-to-r from-[#27aae2] to-blue-600 text-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Award className="w-16 h-16" />
            <div>
              <h3 className="text-3xl font-bold">NIKO VERIFIED</h3>
              <p className="text-white/90 mt-1">
                {isEligible ? 'Congratulations! You\'re eligible!' : 'Keep going! You\'re making progress'}
              </p>
            </div>
          </div>
        </div>

        {isVerified ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8" />
              <p className="text-lg font-semibold">
                You are NIKO VERIFIED! 🎉
              </p>
            </div>
            <p className="text-sm text-white/90">
              Your verified badge is now active on all your events and profile.
            </p>
          </div>
        ) : isEligible ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-lg mb-4">
              You've met the requirements for NIKO VERIFIED status!
            </p>
            <button 
              onClick={handleClaimBadge}
              disabled={isClaiming}
              className={`bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all ${
                isClaiming ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isClaiming ? 'Claiming...' : 'Claim Your Badge'}
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm">
              Meet one of the criteria below to become NIKO VERIFIED
            </p>
          </div>
        )}
      </div>

      {/* Progress Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events Hosted */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-8 h-8 text-[#27aae2]" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Events Hosted
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete at least {eventsRequired} events
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {eventsHosted} / {eventsRequired}
              </span>
              <span className={`text-sm font-semibold ${
                eventsHosted >= eventsRequired
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {Math.min(Math.round(eventsProgress), 100)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  eventsHosted >= eventsRequired
                    ? 'bg-green-500'
                    : 'bg-[#27aae2]'
                }`}
                style={{ width: `${Math.min(eventsProgress, 100)}%` }}
              />
            </div>

            {eventsHosted >= eventsRequired && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Requirement Met!</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-[#27aae2]" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Bookings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reach {bookingsRequired} total bookings
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBookings} / {bookingsRequired}
              </span>
              <span className={`text-sm font-semibold ${
                totalBookings >= bookingsRequired
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {Math.min(Math.round(bookingsProgress), 100)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  totalBookings >= bookingsRequired
                    ? 'bg-green-500'
                    : 'bg-[#27aae2]'
                }`}
                style={{ width: `${Math.min(bookingsProgress, 100)}%` }}
              />
            </div>

            {totalBookings >= bookingsRequired && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Requirement Met!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Benefits of NIKO VERIFIED
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="p-2 bg-[#27aae2]/10 rounded-lg">
                <benefit.icon className="w-6 h-6 text-[#27aae2]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          How to Become NIKO VERIFIED
        </h4>
        <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <p>
            <strong>Option 1:</strong> Successfully host and complete {eventsRequired} events on our platform
          </p>
          <p className="text-center font-semibold">OR</p>
          <p>
            <strong>Option 2:</strong> Accumulate {bookingsRequired} total bookings across all your events
          </p>
          <p className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            Once you meet either requirement, you can claim your NIKO VERIFIED badge. This badge will appear on all your events and profile, helping build trust with potential attendees.
          </p>
        </div>
      </div>

      {/* Events & Bookings Summary */}
      {verificationData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Events List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#27aae2]" />
              <span>Your Events ({verificationData.events?.length || 0})</span>
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {verificationData.events && verificationData.events.length > 0 ? (
                verificationData.events.slice(0, 10).map((event: any) => (
                  <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(event.start_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })} • {event.attendee_count || 0} attendees
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No events yet</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#27aae2]" />
              <span>Recent Bookings ({totalBookings} total)</span>
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {verificationData.recent_bookings && verificationData.recent_bookings.length > 0 ? (
                verificationData.recent_bookings.map((booking: any) => (
                  <div key={booking.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {booking.user?.first_name} {booking.user?.last_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {booking.event?.title} • {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(booking.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No bookings yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
