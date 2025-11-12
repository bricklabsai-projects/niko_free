import { Search, Send, MoreVertical, Phone, Video, Paperclip, Smile, Image as ImageIcon, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Sarah Kim',
      avatar: 'https://i.pravatar.cc/150?img=45',
      lastMessage: 'See you at the tech summit tomorrow!',
      time: '2m ago',
      unread: 2,
      online: true,
      messages: [
        { id: '1', text: 'Hey! Are you going to the Nairobi Tech Summit?', time: '10:30 AM', sent: false },
        { id: '2', text: 'Yes! I already got my VIP pass 🎉', time: '10:32 AM', sent: true },
        { id: '3', text: 'Awesome! We should meet up there', time: '10:33 AM', sent: false },
        { id: '4', text: 'Definitely! Let\'s grab coffee during the break', time: '10:35 AM', sent: true },
        { id: '5', text: 'See you at the tech summit tomorrow!', time: '10:36 AM', sent: false }
      ]
    },
    {
      id: '2',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=12',
      lastMessage: 'Thanks for the event recommendation',
      time: '1h ago',
      unread: 0,
      online: true,
      messages: [
        { id: '1', text: 'Hey, do you know any good networking events?', time: '9:15 AM', sent: false },
        { id: '2', text: 'Check out the Startup Networking Mixer at iHub', time: '9:20 AM', sent: true },
        { id: '3', text: 'Thanks for the event recommendation', time: '9:25 AM', sent: false }
      ]
    },
    {
      id: '3',
      name: 'Event Organizers',
      avatar: 'https://i.pravatar.cc/150?img=25',
      lastMessage: 'Your ticket has been confirmed',
      time: '3h ago',
      unread: 1,
      online: false,
      messages: [
        { id: '1', text: 'Your ticket has been confirmed', time: '8:00 AM', sent: false },
        { id: '2', text: 'Check your email for the QR code', time: '8:01 AM', sent: false }
      ]
    },
    {
      id: '4',
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?img=33',
      lastMessage: 'Want to join our group for the festival?',
      time: '5h ago',
      unread: 0,
      online: false,
      messages: [
        { id: '1', text: 'Hey! Going to the Sunset Music Festival?', time: 'Yesterday', sent: false },
        { id: '2', text: 'Thinking about it! Is it good?', time: 'Yesterday', sent: true },
        { id: '3', text: 'Want to join our group for the festival?', time: 'Yesterday', sent: false }
      ]
    },
    {
      id: '5',
      name: 'Yoga Group',
      avatar: 'https://i.pravatar.cc/150?img=48',
      lastMessage: 'Don\'t forget your mat tomorrow!',
      time: '1d ago',
      unread: 0,
      online: true,
      messages: [
        { id: '1', text: 'Morning! Reminder about tomorrow\'s session', time: '2 days ago', sent: false },
        { id: '2', text: 'Thanks! What time again?', time: '2 days ago', sent: true },
        { id: '3', text: '6:00 AM at Karura Forest', time: '2 days ago', sent: false },
        { id: '4', text: 'Don\'t forget your mat tomorrow!', time: '1 day ago', sent: false }
      ]
    }
  ]);

  const activeConversation = conversations.find(c => c.id === selectedConversation);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeConversation?.messages.length]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      time: 'Just now',
      sent: true
    };

    setConversations(conversations.map(conv => 
      conv.id === selectedConversation
        ? { ...conv, messages: [...conv.messages, newMessage], lastMessage: messageText, time: 'Just now' }
        : conv
    ));

    setMessageText('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">Messages</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Chat with event organizers and attendees</p>
      </div>

      {/* Messages Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[600px] sm:h-[650px]">
          {/* Conversations List */}
          <div className={`lg:col-span-4 border-r border-gray-200 dark:border-gray-700 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    selectedConversation === conversation.id ? 'bg-[#27aae2]/10 dark:bg-[#27aae2]/20' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-[#27aae2] text-white text-xs font-bold rounded-full flex-shrink-0">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-8 flex flex-col relative h-full min-h-[400px]`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      ←
                    </button>
                    <div className="relative">
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      {activeConversation.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {activeConversation.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeConversation.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 mb-[62px] space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900/50">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                        className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] sm:max-w-[70%] break-words ${message.sent ? 'order-2' : 'order-1'}`}>
                        <div
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl whitespace-pre-line break-words ${
                              message.sent
                                ? 'bg-[#27aae2] text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                            }`}
                        >
                            <p className="text-xs sm:text-sm break-words whitespace-pre-line">{message.text}</p>
                        </div>
                        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.sent ? 'text-right' : 'text-left'}`}>{message.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input - fixed at bottom */}
                <div className="absolute left-0 right-0 bottom-0 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-end gap-2">
                    <div className="hidden sm:flex items-center gap-1">
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="w-full bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                      />
                    </div>
                    <button className="hidden sm:block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="p-2 sm:p-2.5 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">No conversation selected</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
