import { Calendar, MapPin, Heart, Share2 } from 'lucide-react';
import { useState } from 'react';

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  price: string;
  isSoldOut?: boolean;
  onClick: (id: string) => void;
}

export default function EventCard({
  id,
  title,
  image,
  date,
  time,
  location,
  attendees,
  category,
  price,
  isSoldOut = false,
  onClick
}: EventCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 relative"
      onClick={() => onClick(id)}
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
        <div className="absolute top-1 sm:top-1.5 md:top-2 lg:top-3 right-1 sm:right-1.5 md:right-2 lg:right-3 flex flex-col space-y-1 sm:space-y-1.5 md:space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
          </button>
        </div>
        <div className="absolute top-1 sm:top-1.5 md:top-2 lg:top-3 left-1 sm:left-1.5 md:left-2 lg:left-3">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 lg:px-3 lg:py-1 backdrop-blur-sm text-white text-[9px] sm:text-[10px] md:text-xs font-semibold rounded-full" style={{ backgroundColor: 'rgba(39, 170, 226, 0.9)' }}>
            {category}
          </span>
        </div>
        {isSoldOut ? (
          <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 lg:bottom-3 left-1 sm:left-1.5 md:left-2 lg:left-3">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 lg:px-3 lg:py-1 bg-red-500/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] md:text-xs font-bold rounded-full shadow-lg">
              SOLD OUT
            </span>
          </div>
        ) : price === 'Free' ? (
          <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 lg:bottom-3 left-1 sm:left-1.5 md:left-2 lg:left-3">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 lg:px-3 lg:py-1 bg-green-500/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] md:text-xs font-bold rounded-full shadow-lg">
              FREE
            </span>
          </div>
        ) : (
          <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 lg:bottom-3 left-1 sm:left-1.5 md:left-2 lg:left-3">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 lg:px-3 lg:py-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-[9px] sm:text-[10px] md:text-xs font-bold rounded-full shadow-lg">
              {price}
            </span>
          </div>
        )}
      </div>

      <div className="p-2 sm:p-2.5 md:p-3 lg:p-5">
        <h3 className="font-bold text-[7px] sm:text-sm md:text-base lg:text-lg text-gray-900 dark:text-white mb-1 sm:mb-1.5 md:mb-2 lg:mb-3 truncate transition-colors" style={{ color: '' }} onMouseEnter={(e) => e.currentTarget.style.color = '#27aae2'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
          {title}
        </h3>

        <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" style={{ color: '#27aae2' }} />
            <span className="font-medium truncate text-[8px] sm:text-xs md:text-sm">{date} • {time}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" style={{ color: '#27aae2' }} />
            <span className="line-clamp-1 text-[8px] sm:text-xs md:text-sm">{location}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
            <div className="flex -space-x-1 sm:-space-x-1.5 md:-space-x-2">
              <img
                src={`https://i.pravatar.cc/150?img=${(parseInt(id) * 3) % 70}`}
                alt="Attendee"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border border-white dark:border-gray-800"
              />
              <img
                src={`https://i.pravatar.cc/150?img=${(parseInt(id) * 3 + 1) % 70}`}
                alt="Attendee"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border border-white dark:border-gray-800"
              />
              <img
                src={`https://i.pravatar.cc/150?img=${(parseInt(id) * 3 + 2) % 70}`}
                alt="Attendee"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border border-white dark:border-gray-800"
              />
            </div>
            <span className="text-[8px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">+{attendees - 3} attending</span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          // Share functionality
          if (navigator.share) {
            navigator.share({
              title: title,
              text: `Check out this event: ${title}`,
              url: window.location.href
            });
          }
        }}
        className="absolute bottom-2 sm:bottom-2.5 md:bottom-3 lg:bottom-5 right-2 sm:right-2.5 md:right-3 lg:right-5 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10"
        style={{ backgroundColor: '#27aae2' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a8ec4'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27aae2'}
      >
        <Share2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
      </button>
    </div>
  );
}
