import { Zap, TrendingUp, Star } from 'lucide-react';
import { useState } from 'react';

export default function BoostEvent() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const events = [
    { id: '1', name: 'Summer Music Festival 2024' },
    { id: '2', name: 'Tech Conference Kenya' },
    { id: '3', name: 'Food & Wine Expo' },
    { id: '4', name: 'Art Exhibition 2024' }
  ];

  const boostTiers = [
    {
      id: 'cant-miss',
      name: "Can't Miss!",
      originalPrice: 1000,
      price: 400,
      duration: 'per day',
      description: 'Featured at the top of the homepage',
      features: [
        'Top homepage placement',
        'Priority in search results',
        'Highlighted in category listings',
        'Social media promotion',
        'Newsletter feature'
      ],
      badge: 'Most Popular',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'category-featured',
      name: 'Category Featured',
      originalPrice: 500,
      price: 200,
      duration: 'per day',
      description: 'Featured within your event category',
      features: [
        'Category page prominence',
        'Enhanced search visibility',
        'Category newsletter inclusion',
        'Social media mentions'
      ],
      badge: 'Best Value',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'homepage-banner',
      name: 'Homepage Banner',
      price: 50000,
      duration: 'per week',
      description: 'Exclusive homepage banner placement',
      features: [
        'Full-width banner on homepage',
        'Maximum visibility',
        'Priority support',
        'Dedicated account manager',
        'Custom creative design',
        'Performance analytics'
      ],
      badge: 'Premium',
      color: 'from-orange-600 to-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Boost Your Event</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Increase visibility and reach more attendees
        </p>
      </div>

      {/* Event Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Event to Boost
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
        >
          <option value="">Choose an event...</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Boost Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {boostTiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all ${
              selectedTier === tier.id ? 'ring-2 ring-[#27aae2]' : ''
            }`}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${tier.color} p-6 text-white relative`}>
              {tier.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    {tier.badge}
                  </span>
                </div>
              )}
              <Zap className="w-10 h-10 mb-3" />
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-white/90 text-sm">{tier.description}</p>
            </div>

            <div className="p-6">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  {tier.originalPrice && (
                    <span className="text-gray-400 line-through text-lg">
                      Ksh {tier.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    Ksh {tier.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {tier.duration}
                  </span>
                </div>
                {tier.originalPrice && (
                  <div className="mt-2">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                      Save {Math.round(((tier.originalPrice - tier.price) / tier.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Star className="w-5 h-5 text-[#27aae2] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                onClick={() => setSelectedTier(tier.id)}
                disabled={!selectedEvent}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  selectedTier === tier.id
                    ? 'bg-[#27aae2] text-white'
                    : selectedEvent
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      {selectedEvent && selectedTier && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Boost
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Selected Event</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {events.find(e => e.id === selectedEvent)?.name}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Boost Package</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {boostTiers.find(t => t.id === selectedTier)?.name}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <div className="text-right">
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-20 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-center"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {boostTiers.find(t => t.id === selectedTier)?.duration.split(' ')[1]}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-[#27aae2]">
                Ksh {boostTiers.find(t => t.id === selectedTier)?.price.toLocaleString()}
              </span>
            </div>

            <button className="w-full bg-[#27aae2] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1e8bc3] transition-all shadow-lg mt-4">
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Why boost your event?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Boosted events receive 3-5x more views and 2-3x more bookings on average.
              Stand out from the competition and maximize your event's potential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
