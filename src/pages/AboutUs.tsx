import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface AboutUsProps {
  onNavigate: (page: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 relative">
      {/* Light mode dot pattern overlay */}
      <div className="block dark:hidden fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Dark mode dot pattern overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} currentPage="about" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">About Niko Free</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Connecting communities through meaningful events and experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20" data-aos="fade-up">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              At Niko Free, we're passionate about bringing people together and creating lasting connections
              through events. Our platform makes it easy to discover, create, and join events that matter to you.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#27aae2] font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Community First</h3>
                  <p className="text-gray-600 dark:text-gray-300">Building stronger communities through shared experiences</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#27aae2] font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Accessibility</h3>
                  <p className="text-gray-600 dark:text-gray-300">Making events accessible to everyone, everywhere</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#27aae2] font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Innovation</h3>
                  <p className="text-gray-600 dark:text-gray-300">Continuously improving the event experience</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/7642001/pexels-photo-7642001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#27aae2]/10 dark:bg-gray-800 rounded-3xl p-8 md:p-12 mb-20" data-aos="zoom-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Sets Us Apart</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Discover why event organizers and attendees choose Niko Free</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Easy to Use</h3>
              <p className="text-gray-600 dark:text-gray-300">Simple and intuitive platform for both organizers and attendees</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">Built for and by the community, focusing on real connections</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Powerful Features</h3>
              <p className="text-gray-600 dark:text-gray-300">Advanced tools for event management and discovery</p>
            </div>
          </div>
        </div>

        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Ready to Get Started?</h2>
          <div className="flex justify-center">
            <button
              onClick={() => onNavigate('become-partner')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-[#27aae2] dark:text-[#27aae2] border-2 border-[#27aae2] dark:border-[#27aae2] rounded-xl font-bold hover:bg-[#27aae2]/10 dark:hover:bg-[#27aae2]/20 transform hover:scale-105 transition-all"
            >
              Become a Partner
            </button>
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
