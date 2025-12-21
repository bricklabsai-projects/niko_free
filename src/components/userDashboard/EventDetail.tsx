import { Calendar, MapPin, Clock, Users, Share2, Heart, Download, ArrowLeft, Ticket as TicketIcon, Star, Plus, MessageSquare, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addToBucketlist, removeFromBucketlist, getBucketlist, getEventReviews, addEventReview, updateEventReview, deleteEventReview } from '../../services/userService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../services/authService';

interface EventDetailProps {
  event: {
    id: number | string;
    title: string;
    image: string;
    date: string;
    time?: string;
    location: string;
    price?: string;
    ticketId?: string;
    description?: string;
    category?: string;
    attendees?: number;
    rating?: number;
    organizer?: {
      name: string;
      avatar: string;
    };
  };
  onBack: () => void;
}

export default function EventDetail({ event, onBack }: EventDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [eventData, setEventData] = useState(event);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    checkBucketlistStatus();
    fetchEventDetails();
    fetchReviews();
  }, [event.id]);

  const checkBucketlistStatus = async () => {
    try {
      const response = await getBucketlist();
      const isInBucketlist = response.events?.some((e: any) => e.id === Number(event.id));
      setIsLiked(isInBucketlist);
    } catch (err) {
      console.error('Error checking bucketlist:', err);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const eventId = Number(event.id);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.events.detail(eventId)}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok && data.event) {
        const evt = data.event;
        setEventData({
          ...event,
          title: evt.title || event.title,
          description: evt.description || event.description,
          image: evt.poster_image ? `${API_BASE_URL}/uploads/${evt.poster_image}` : event.image,
          category: evt.category?.name || event.category,
          attendees: evt.attendee_count || event.attendees,
          organizer: evt.partner ? {
            name: evt.partner.business_name || 'Event Organizer',
            avatar: evt.partner.logo ? `${API_BASE_URL}/uploads/${evt.partner.logo}` : ''
          } : event.organizer
        });
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const eventId = Number(event.id);
      const response = await getEventReviews(eventId);
      setReviews(response.reviews || []);
      setAverageRating(response.average_rating || 0);
      
      // Check if user has a review
      const token = localStorage.getItem('niko_free_token');
      if (token) {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: getAuthHeaders()
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const userRev = response.reviews?.find((r: any) => r.user?.id === userData.id);
            if (userRev) {
              setUserReview(userRev);
              setReviewRating(userRev.rating);
              setReviewComment(userRev.comment || '');
            }
          }
        } catch (err) {
          // User not logged in or error
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleToggleLike = async () => {
    try {
      const eventId = Number(event.id);
      if (isLiked) {
        await removeFromBucketlist(eventId);
        setIsLiked(false);
      } else {
        await addToBucketlist(eventId);
        setIsLiked(true);
      }
    } catch (err: any) {
      console.error('Error toggling bucketlist:', err);
      alert(err.message || 'Failed to update bucketlist');
    }
  };

  const handleAddToCalendar = () => {
    // Create calendar event
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(eventData.description || '')}&location=${encodeURIComponent(eventData.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleShare = (platform: string) => {
    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const shareText = `Check out this event: ${eventData.title}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${eventUrl}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(eventUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      alert('Please select a rating');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const eventId = Number(event.id);
      
      if (userReview) {
        // Update existing review
        await updateEventReview(eventId, userReview.id, reviewRating, reviewComment);
      } else {
        // Create new review
        await addEventReview(eventId, reviewRating, reviewComment);
      }
      
      setShowReviewModal(false);
      await fetchReviews();
      setReviewComment('');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const eventId = Number(event.id);
      await deleteEventReview(eventId, userReview.id);
      setUserReview(null);
      setReviewComment('');
      await fetchReviews();
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base font-semibold">Back to Events</span>
      </button>

      {/* Event Header Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden">
        <img
          src={eventData.image}
          alt={eventData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#27aae2] text-white text-xs sm:text-sm font-semibold rounded-full">
            {eventData.category || 'General'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleToggleLike}
            className="p-2 sm:p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 sm:p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share on WhatsApp
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Event Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            {eventData.title}
          </h1>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{eventData.attendees || 0} attending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Event Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Date & Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">When & Where</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#27aae2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#27aae2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Time</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.time || 'TBA'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#27aae2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.location}</p>
                </div>
              </div>
              <button
                onClick={handleAddToCalendar}
                className="w-full mt-4 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Calendar</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {eventData.description || 'Join us for an amazing event experience! This is a great opportunity to connect with like-minded individuals and enjoy a memorable time together.'}
            </p>
          </div>

          {/* Organizer */}
          {eventData.organizer && (
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Organized By</h2>
              <div className="flex items-center gap-4">
                <img
                  src={eventData.organizer.avatar}
                  alt={eventData.organizer.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.organizer.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Event Organizer</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-[#27aae2] text-white rounded-lg text-sm font-semibold hover:bg-[#1e8bb8] transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{userReview ? 'Edit Review' : 'Add Review'}</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#27aae2]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#27aae2] font-bold">
                          {review.user?.first_name?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {review.user?.first_name} {review.user?.last_name}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Ticket Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-24">
            {eventData.ticketId ? (
              <>
                {/* Booked Ticket */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-4">
                    <TicketIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">Ticket Booked</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ticket ID</p>
                  <p className="text-sm sm:text-base font-mono font-bold text-gray-900 dark:text-white">{eventData.ticketId}</p>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-2.5 sm:py-3 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors flex items-center justify-center gap-2">
                    <TicketIcon className="w-4 h-4" />
                    <span>View Ticket</span>
                  </button>
                  <button className="w-full py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Available Ticket */}
                <div className="mb-6">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {eventData.price || 'Free'}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Free</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-[#27aae2]">{eventData.price || 'Free'}</span>
                  </div>
                </div>

                <button className="w-full py-3 sm:py-3.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors text-sm sm:text-base">
                  Book Ticket
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{userReview ? 'Edit Review' : 'Add Review'}</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className={`p-2 rounded-lg transition-colors ${
                        rating <= reviewRating
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#27aae2] focus:border-transparent resize-none"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-2">
                {userReview && (
                  <button
                    onClick={handleDeleteReview}
                    className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-2 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
