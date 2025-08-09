// src/components/TicketCard.tsx
import React from 'react';
import { QrCode, Calendar, MapPin, Clock, Users, Download, Share } from 'lucide-react';

interface TicketCardProps {
  ticket: {
    id: string;
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
    qrCode: string;
    status: 'active' | 'used' | 'expired' | 'cancelled';
    purchaseDate: string;
    orderNumber: string;
  };
  variant?: 'default' | 'compact' | 'digital';
  showActions?: boolean;
}

export function TicketCard({ 
  ticket, 
  variant = 'default',
  showActions = true 
}: TicketCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'used':
        return 'badge-primary';
      case 'expired':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-primary';
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

  if (variant === 'compact') {
    return (
      <div className={`ticket-card ${ticket.status === 'active' ? 'ticket-card-active' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{ticket.eventTitle}</h3>
            <div className="text-sm text-gray-500 mt-1">
              {formatDate(ticket.eventDate)} • {ticket.eventTime}
            </div>
            <div className="text-sm text-gray-500">
              {ticket.venue.name}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`badge ${getStatusColor(ticket.status)}`}>
              {getStatusText(ticket.status)}
            </span>
            <QrCode className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'digital') {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="font-semibold">TiKo</span>
            </div>
            <span className={`badge ${getStatusColor(ticket.status)} bg-white/20 text-white`}>
              {getStatusText(ticket.status)}
            </span>
          </div>
          
          <h2 className="text-xl font-bold mb-2">{ticket.eventTitle}</h2>
          <p className="text-purple-100">{ticket.ticketType}</p>
        </div>

        {/* Ticket Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </div>
              <div className="font-medium">{formatDate(ticket.eventDate)}</div>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4 mr-1" />
                Time
              </div>
              <div className="font-medium">{ticket.eventTime}</div>
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                Venue
              </div>
              <div className="font-medium">{ticket.venue.name}</div>
              <div className="text-sm text-gray-500">{ticket.venue.address}</div>
            </div>
            
            {ticket.seatInfo && (
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  Seat
                </div>
                <div className="font-medium">{ticket.seatInfo}</div>
              </div>
            )}
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Price</div>
              <div className="font-medium">{formatPrice(ticket.price)}</div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
                {/* In real implementation, this would be an actual QR code */}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Order Number</div>
              <div className="font-mono text-sm font-medium">{ticket.orderNumber}</div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-3 mt-6">
              <button className="btn btn-outline flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button className="btn btn-ghost flex-1">
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`ticket-card ${ticket.status === 'active' ? 'ticket-card-active' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{ticket.eventTitle}</h3>
          <p className="text-sm text-gray-500">{ticket.ticketType}</p>
        </div>
        <span className={`badge ${getStatusColor(ticket.status)}`}>
          {getStatusText(ticket.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-3 text-gray-400" />
          <span className="text-gray-600">
            {formatDate(ticket.eventDate)} at {ticket.eventTime}
          </span>
        </div>
        
        <div className="flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-3 text-gray-400" />
          <span className="text-gray-600">{ticket.venue.name}</span>
        </div>
        
        {ticket.seatInfo && (
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-gray-600">{ticket.seatInfo}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <div className="text-sm text-gray-500">Paid</div>
          <div className="font-semibold text-purple-600">{formatPrice(ticket.price)}</div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showActions && (
            <>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          <QrCode className="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
}