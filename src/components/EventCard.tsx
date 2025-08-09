// src/components/EventCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    date: string;
    time: string;
    venue: {
      name: string;
      address: string;
    };
    category: {
      name: string;
      color: string;
    };
    ticketTypes: Array<{
      name: string;
      price: number;
      available: number;
    }>;
    attendeeCount?: number;
    organizer: {
      name: string;
    };
  };
  variant?: 'default' | 'featured' | 'compact';
  showDetails?: boolean;
}

export function EventCard({ 
  event, 
  variant = 'default',
  showDetails = true 
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      month: 'short',
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

  const getLowestPrice = () => {
    if (!event.ticketTypes.length) return 0;
    return Math.min(...event.ticketTypes.map(ticket => ticket.price));
  };

  const getAvailableTickets = () => {
    return event.ticketTypes.reduce((total, ticket) => total + ticket.available, 0);
  };

  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.id}`} className="block">
        <div className="event-card">
          <div className="flex p-4 space-x-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {event.venue.name}
              </div>
              <div className="text-sm font-medium text-purple-600 mt-2">
                From {formatPrice(getLowestPrice())}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/events/${event.id}`} className="block">
        <div className="event-card bg-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative p-8">
            <div className="flex items-start justify-between mb-6">
              <span className="badge bg-white/20 text-white border-white/30">
                {event.category.name}
              </span>
              {getAvailableTickets() < 50 && (
                <span className="badge bg-orange-500 text-white">
                  Few tickets left
                </span>
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-white/90">
                <Calendar className="w-5 h-5 mr-3" />
                {formatDate(event.date)} • {event.time}
              </div>
              <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-3" />
                {event.venue.name}
              </div>
              {event.attendeeCount && (
                <div className="flex items-center text-white/90">
                  <Users className="w-5 h-5 mr-3" />
                  {event.attendeeCount} attending
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm">From</div>
                <div className="text-2xl font-bold">{formatPrice(getLowestPrice())}</div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">By</div>
                <div className="font-medium">{event.organizer.name}</div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="event-card">
        <div className="relative">
          <Image
            src={event.imageUrl}
            alt={event.title}
            width={400}
            height={200}
            className="event-card-image"
          />
          <div className="absolute top-4 left-4">
            <span className={`badge ${event.category.color}`}>
              {event.category.name}
            </span>
          </div>
          {getAvailableTickets() < 50 && (
            <div className="absolute top-4 right-4">
              <span className="badge badge-warning">
                Few tickets left
              </span>
            </div>
          )}
        </div>
        
        <div className="event-card-content">
          <h3 className="event-card-title">{event.title}</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(event.date)}
              <Clock className="w-4 h-4 ml-4 mr-2" />
              {event.time}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              {event.venue.name}
            </div>
            
            {event.attendeeCount && (
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                {event.attendeeCount} attending
              </div>
            )}
          </div>

          {showDetails && (
            <p className="event-card-description">{event.description}</p>
          )}
          
          <div className="event-card-footer">
            <div>
              <div className="text-sm text-gray-500">From</div>
              <div className="text-lg font-semibold text-purple-600">
                {formatPrice(getLowestPrice())}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">By</div>
              <div className="text-sm font-medium text-gray-900">
                {event.organizer.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}