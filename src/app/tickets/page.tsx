// src/app/tickets/page.tsx - Digital Ticket Wallet
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Ticket, 
  QrCode, 
  Calendar, 
  MapPin, 
  Clock,
  Download,
  Share,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { TicketCard } from '@/components/TicketCard';

interface DigitalTicket {
  id: string;
  orderNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: {
    name: string;
    address: string;
  };
  ticketType: string;
  seatInfo?: string;
  price: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  qrCode: string;
  purchaseDate: string;
  eventImage: string;
  checkInTime?: string;
  refundable: boolean;
  transferable: boolean;
}

// Mock tickets data
const mockTickets: DigitalTicket[] = [
  {
    id: 'ticket-1',
    orderNumber: 'TK-2025-001',
    eventId: '1',
    eventTitle: 'Sauti Sol Live in Concert',
    eventDate: '2025-09-15',
    eventTime: '8:00 PM',
    venue: {
      name: 'KICC Nairobi',
      address: 'Kenyatta International Convention Centre, Nairobi'
    },
    ticketType: 'VIP',
    seatInfo: 'Section A, Row 3, Seat 15-16',
    price: 5000,
    status: 'active',
    qrCode: 'QR123456789',
    purchaseDate: '2025-08-05',
    eventImage: '/api/placeholder/400/200',
    refundable: true,
    transferable: true
  },
  {
    id: 'ticket-2',
    orderNumber: 'TK-2025-002',
    eventId: '2',
    eventTitle: 'Mt. Kenya Hiking Adventure',
    eventDate: '2025-09-20',
    eventTime: '6:00 AM',
    venue: {
      name: 'Naro Moru Gate',
      address: 'Mt. Kenya National Park'
    },
    ticketType: 'Day Hike',
    price: 3500,
    status: 'active',
    qrCode: 'QR987654321',
    purchaseDate: '2025-08-07',
    eventImage: '/api/placeholder/400/200',
    refundable: false,
    transferable: false
  },
  {
    id: 'ticket-3',
    orderNumber: 'TK-2025-003',
    eventId: '3',
    eventTitle: 'Comedy Night with Churchill',
    eventDate: '2025-07-20',
    eventTime: '7:30 PM',
    venue: {
      name: 'Carnivore Restaurant',
      address: 'Langata Road, Nairobi'
    },
    ticketType: 'Standard',
    price: 1500,
    status: 'used',
    qrCode: 'QR456789123',
    purchaseDate: '2025-07-15',
    eventImage: '/api/placeholder/400/200',
    checkInTime: '2025-07-20T19:45:00Z',
    refundable: false,
    transferable: false
  }
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<DigitalTicket[]>(mockTickets);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<DigitalTicket | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'used':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Valid';
      case 'used':
        return 'Used';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.venue.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const activeTicketsCount = tickets.filter(t => t.status === 'active').length;

  const handleTicketAction = (action: string, ticket: DigitalTicket) => {
    switch (action) {
      case 'download':
        // In real app, generate PDF ticket
        console.log('Downloading ticket:', ticket.id);
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: ticket.eventTitle,
            text: `Check out my ticket for ${ticket.eventTitle}`,
            url: `${window.location.origin}/tickets/${ticket.id}`
          });
        }
        break;
      case 'transfer':
        // Open transfer modal
        console.log('Transfer ticket:', ticket.id);
        break;
      case 'refund':
        // Open refund flow
        console.log('Refund ticket:', ticket.id);
        break;
    }
  };

  const TicketDetailModal = () => {
    if (!selectedTicket) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
          <TicketCard 
            ticket={selectedTicket} 
            variant="digital" 
            showActions={true}
          />
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {selectedTicket.transferable && selectedTicket.status === 'active' && (
                <button 
                  onClick={() => handleTicketAction('transfer', selectedTicket)}
                  className="btn btn-outline"
                >
                  Transfer
                </button>
              )}
              {selectedTicket.refundable && selectedTicket.status === 'active' && (
                <button 
                  onClick={() => handleTicketAction('refund', selectedTicket)}
                  className="btn btn-outline text-red-600"
                >
                  Request Refund
                </button>
              )}
            </div>
            <button 
              onClick={() => setSelectedTicket(null)}
              className="btn btn-ghost w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="minimal" title="My Tickets" showNotifications={true} />
        
        <div className="container py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No tickets yet</h2>
            <p className="text-gray-600 mb-8">
              Your purchased tickets will appear here. Start by browsing events!
            </p>
            <Link href="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="minimal" title="My Tickets" showNotifications={true} />

      <div className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{activeTicketsCount}</div>
            <div className="text-sm text-gray-600">Active Tickets</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {tickets.filter(t => t.status === 'used').length}
            </div>
            <div className="text-sm text-gray-600">Used Tickets</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatPrice(tickets.reduce((sum, t) => sum + t.price, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{tickets.length}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex space-x-2">
              {['all', 'active', 'used', 'expired'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={ticket.eventImage}
                      alt={ticket.eventTitle}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.eventTitle}</h3>
                      <p className="text-sm text-gray-600 mb-2">{ticket.ticketType}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(ticket.eventDate)} • {ticket.eventTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{ticket.venue.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm font-medium">{getStatusText(ticket.status)}</span>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {ticket.seatInfo && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Seat: {ticket.seatInfo}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Paid</div>
                    <div className="font-semibold text-purple-600">{formatPrice(ticket.price)}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTicketAction('download', ticket)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTicketAction('share', ticket)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Share"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                      title="View QR Code"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {ticket.checkInTime && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Checked in at {new Date(ticket.checkInTime).toLocaleString('en-KE')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/events" className="btn btn-outline text-center">
              Browse More Events
            </Link>
            <Link href="/orders" className="btn btn-outline text-center">
              Order History
            </Link>
            <button className="btn btn-outline">
              Download All Tickets
            </button>
            <Link href="/help" className="btn btn-outline text-center">
              Need Help?
            </Link>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal />

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <BottomNavigation cartCount={0} />
      </div>
    </div>
  );
}