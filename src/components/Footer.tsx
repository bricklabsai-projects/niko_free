import { Calendar, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Niko Free</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Discover amazing events and connect with your community. Join us in creating unforgettable experiences.
            </p>
            <div className="flex space-x-3">
              <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button className="hover:text-white transition-colors">Upcoming Events</button></li>
              <li><button className="hover:text-white transition-colors">This Weekend</button></li>
              <li><button className="hover:text-white transition-colors">Popular Events</button></li>
              <li><button className="hover:text-white transition-colors">Event Calendar</button></li>
              <li><button className="hover:text-white transition-colors">Browse Categories</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button className="hover:text-white transition-colors">Become a Partner</button></li>
              <li><button className="hover:text-white transition-colors">Create Event</button></li>
              <li><button className="hover:text-white transition-colors">Partner Resources</button></li>
              <li><button className="hover:text-white transition-colors">Community Guidelines</button></li>
              <li><button className="hover:text-white transition-colors">Help Center</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button className="hover:text-white transition-colors">About Us</button></li>
              <li><button className="hover:text-white transition-colors">Careers</button></li>
              <li><button className="hover:text-white transition-colors">Press & Media</button></li>
              <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>&copy; 2025 Niko Free. All rights reserved. Making connections, creating memories.</p>
        </div>
      </div>
    </footer>
  );
}
