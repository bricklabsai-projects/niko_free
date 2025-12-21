import { Camera, MapPin, Calendar, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, uploadProfilePicture, getUserBookings, getBucketlist } from '../../services/userService';
import { API_BASE_URL } from '../../config/api';

export default function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinDate: '',
    avatar: ''
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getUserProfile();
      
      const user = data.user || data;
      setProfile({
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        email: user.email || '',
        phone: user.phone_number || '',
        location: user.location || '',
        bio: user.bio || '',
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
        avatar: user.profile_picture ? `${API_BASE_URL}/uploads/${user.profile_picture}` : ''
      });
      setEditedProfile({
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        email: user.email || '',
        phone: user.phone_number || '',
        location: user.location || '',
        bio: user.bio || '',
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
        avatar: user.profile_picture ? `${API_BASE_URL}/uploads/${user.profile_picture}` : ''
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const [firstName, ...lastNameParts] = editedProfile.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: editedProfile.phone,
        location: editedProfile.location
      });
      
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const response = await uploadProfilePicture(file);
      const newAvatar = response.profile_picture ? `${API_BASE_URL}/uploads/${response.profile_picture}` : profile.avatar;
      
      setProfile({ ...profile, avatar: newAvatar });
      setEditedProfile({ ...editedProfile, avatar: newAvatar });
    } catch (err: any) {
      console.error('Error uploading image:', err);
      alert(err.message || 'Failed to upload image');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats from bookings
  const [stats, setStats] = useState({
    eventsAttended: 0,
    upcomingEvents: 0,
    ticketsPurchased: 0,
    savedEvents: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch past bookings (events attended)
      const pastBookings = await getUserBookings('past');
      const eventsAttended = pastBookings.bookings?.length || 0;

      // Fetch upcoming bookings
      const upcomingBookings = await getUserBookings('upcoming');
      const upcomingEvents = upcomingBookings.bookings?.length || 0;

      // Total tickets purchased (all bookings)
      const allBookings = await getUserBookings();
      const ticketsPurchased = allBookings.bookings?.reduce((sum: number, booking: any) => sum + (booking.quantity || 0), 0) || 0;

      // Fetch bucketlist (saved events)
      const bucketlist = await getBucketlist();
      const savedEvents = bucketlist.events?.length || 0;

      setStats({
        eventsAttended,
        upcomingEvents,
        ticketsPurchased,
        savedEvents
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] relative">
          {isEditing && (
            <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
              <Camera className="w-4 h-4 text-gray-700" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="relative inline-block">
              <img
                src={isEditing ? editedProfile.avatar : profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-2 right-2 p-2 bg-[#27aae2] text-white rounded-full hover:bg-[#1e8bb8] transition-colors shadow-lg cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {profile.joinDate}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 dark:text-white text-lg font-semibold">{profile.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <p className="text-gray-700 dark:text-gray-300">{profile.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{profile.location || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-[#27aae2] mb-1">{stats.eventsAttended}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Events Attended</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-green-500 mb-1">{stats.upcomingEvents}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-purple-500 mb-1">{stats.ticketsPurchased}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tickets Purchased</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-orange-500 mb-1">{stats.savedEvents}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Saved Events</div>
        </div>
      </div>
    </div>
  );
}
