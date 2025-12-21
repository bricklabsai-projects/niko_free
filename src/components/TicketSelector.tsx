import { CheckCircle } from 'lucide-react';

interface TicketSelectorProps {
  ticketType: 'uniform' | 'class' | 'loyalty' | 'season' | 'timeslot';
  tickets: {
    class: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
      features: string[];
    }>;
    loyalty: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
      discount: string;
      deadline: string;
      features: string[];
    }>;
    season: Array<{
      id: string;
      name: string;
      price: number;
      date: string;
      available: number;
      discount?: string;
      popular?: boolean;
    }>;
    timeslot: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
    }>;
    uniform: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
    }>;
  };
  selectedTicketType: string;
  selectedTimeSlot: string;
  onSelectTicketType: (ticketId: string) => void;
  onSelectTimeSlot: (slotId: string) => void;
  isRSVPed: boolean;
  onBuyTicket: () => void;
}

export default function TicketSelector({
  ticketType,
  tickets,
  selectedTicketType,
  selectedTimeSlot,
  onSelectTicketType,
  onSelectTimeSlot,
  isRSVPed,
  onBuyTicket
}: TicketSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {ticketType === 'timeslot' ? 'Select Time Slot' : 'Select Ticket'}
      </h3>

      {/* Class Tickets (VVIP, VIP, Regular) */}
      {ticketType === 'class' && (
        <div className="space-y-3 mb-6">
          {tickets.class.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicketType(ticket.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedTicketType === ticket.id
                  ? 'border-[#27aae2] bg-[#27aae2]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ticket.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.available} tickets left</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#27aae2]">KES {ticket.price.toLocaleString()}</p>
                </div>
              </div>
              <ul className="space-y-1">
                {ticket.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-[#27aae2]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Loyalty Tickets (Die Hard, Early Bird, Advance, Gate) */}
      {ticketType === 'loyalty' && (
        <div className="space-y-3 mb-6">
          {tickets.loyalty.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicketType(ticket.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                selectedTicketType === ticket.id
                  ? 'border-[#27aae2] bg-[#27aae2]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
              }`}
            >
              {ticket.discount && ticket.discount !== 'Regular Price' && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {ticket.discount}
                </span>
              )}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ticket.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.deadline}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.available} left</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#27aae2]">KES {ticket.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Season Tickets (Daily vs Season Pass) */}
      {ticketType === 'season' && (
        <div className="space-y-3 mb-6">
          {tickets.season.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicketType(ticket.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                selectedTicketType === ticket.id
                  ? 'border-[#27aae2] bg-[#27aae2]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
              } ${ticket.popular ? 'border-[#27aae2]' : ''}`}
            >
              {ticket.popular && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ticket.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.date}</p>
                  {ticket.discount && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">{ticket.discount}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ticket.available} available</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#27aae2]">KES {ticket.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Time Slot Tickets */}
      {ticketType === 'timeslot' && (
        <div className="space-y-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            {tickets.timeslot.map((slot) => (
              <div
                key={slot.id}
                onClick={() => slot.available > 0 && onSelectTimeSlot(slot.id)}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all text-center ${
                  selectedTimeSlot === slot.id
                    ? 'border-[#27aae2] bg-[#27aae2]/5'
                    : slot.available > 0
                    ? 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
                    : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{slot.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {slot.available > 0 ? `${slot.available} slots left` : 'Fully booked'}
                </p>
                <p className="text-sm font-bold text-[#27aae2] mt-1">KES {slot.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uniform Ticket (Single Price) */}
      {ticketType === 'uniform' && tickets.uniform && tickets.uniform.length > 0 && (
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {tickets.uniform[0].price === 0 ? 'Free' : `KES ${tickets.uniform[0].price.toLocaleString()}`}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">per ticket</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tickets.uniform[0].available || 'Unlimited'} tickets available
          </p>
        </div>
      )}

      <button
        onClick={onBuyTicket}
        disabled={ticketType !== 'uniform' && !selectedTicketType && !selectedTimeSlot}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
          isRSVPed
            ? 'bg-green-600 text-white hover:bg-green-700'
            : ticketType !== 'uniform' && !selectedTicketType && !selectedTimeSlot
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white hover:shadow-xl'
        }`}
      >
        {isRSVPed ? 'Ticket Purchased!' : 'Buy Ticket'}
      </button>
    </div>
  );
}
