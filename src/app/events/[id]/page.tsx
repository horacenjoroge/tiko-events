// src/app/events/[id]/page.tsx - Event Detail Page
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share, 
  Heart,
  ArrowLeft,
  Navigation,
  Phone,
  Mail,
  ExternalLink,
  Ticket,
  Star
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';

interface EventDetailProps {
  params: {
    id: string;
  };
}

// Mock event data - replace with API call
const mockEvent = {
  id: '1',
  title: 'Sauti Sol Live in Concert',
  description: 'Join Kenya\'s biggest music stars for an unforgettable night of live music and entertainment. Experience the magic of Sauti Sol as they perform their greatest hits and new songs from their latest album. This is a night you won\'t want to miss!',
  longDescription: `Get ready for an incredible night with Sauti Sol, Kenya's most celebrated music group. This concert promises to be an extraordinary experience featuring:

• Live performances of all their hit songs
• Special guest appearances
• State-of-the-art sound and lighting
• VIP meet and greet opportunities
• Exclusive merchandise

The venue offers excellent acoustics and comfortable seating for all attendees. Food and beverages will be available for purchase throughout the event.

Please note: This is an all-ages event. Children under 12 must be accompanied by an adult.`,
  images: [
    '/api/placeholder/800/400',
    '/api/placeholder/800/400',
    '/api/placeholder/800/400'
  ],
  date: '2025-09-15',
  time: '8:00 PM',
  endTime: '11:00 PM',
  venue: {
    name: 'KICC Nairobi',
    address: 'Kenyatta International Convention Centre, Harambee Avenue, Nairobi',
    phone: '+254 20 2274000',
    email: 'info@kicc.co.ke',
    website: 'https://kicc.co.ke',
    coordinates: {
      lat: -1.2921,
      lng: 36.8219
    },
    capacity: 5000,
    facilities: ['Parking', 'Accessibility', 'Food Court', 'Wi-Fi']
  },
  category: {
    name: 'Music',
    color: 'badge-primary'
  },
  ticketTypes: [
    {
      id: 'regular',
      name: 'Regular',
      description: 'Standard seating with great view of the stage',
      price: 2500,
      available: 150,
      total: 200,
      benefits: ['Concert access', 'Standard seating']
    },
    {
      id: 'vip',
      name: 'VIP',
      description: 'Premium seating with complimentary drinks',
      price: 5000,
      available: 25,
      total: 50,
      benefits: ['Front row seating', 'Complimentary drinks', 'VIP lounge access', 'Meet & greet opportunity']
    },
    {
      id: 'platinum',
      name: 'Platinum',
      description: 'Ultimate experience with backstage access',
      price: 10000,
      available: 5,
      total: 10,
      benefits: ['Premium seating', 'Backstage access', 'Signed merchandise', 'Photo opportunity', 'Exclusive after-party']
    }
  ],
  attendeeCount: 1200,
  organizer: {
    name: 'Sol Generation',
    description: 'Leading entertainment company in East Africa',
    contact: {
      email: 'events@solgeneration.com',
      phone: '+254 700 123456'
    },
    verified: true,
    rating: 4.8,
    eventsOrganized: 25
  },
  tags: ['Live Music', 'Kenyan Artists', 'Concert', 'Entertainment'],
  socialMedia: {
    facebook: 'https://facebook.com/sautisol',
    twitter: 'https://twitter.com/sautisol',
    instagram: 'https://instagram.com/sautisol'
  },
  policies: {
    refund: 'Refunds available up to 48 hours before the event',
    ageRestriction: 'All ages welcome. Children under 12 must be accompanied by an adult',
    dress: 'Smart casual recommended',
    prohibited: ['Outside food and drinks', 'Professional cameras', 'Recording devices']
  }
};

export default function EventDetailPage({ params }: EventDetailProps) {
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

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

  const getTotalPrice = () => {
    const ticket = mockEvent.ticketTypes.find(t => t.id === selectedTicket);
    return ticket ? ticket.price * quantity : 0;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: mockEvent.title,
          text: mockEvent.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleGetDirections = () => {
    const { lat, lng } = mockEvent.venue.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="minimal" showBackButton={true} />

      {/* Image Gallery */}
      <div className="relative h-64 md:h-96">
        <Image
          src={mockEvent.images[currentImageIndex]}
          alt={mockEvent.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Image Navigation */}
        {mockEvent.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {mockEvent.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full backdrop-blur-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>

        {/* Event Badge */}
        <div className="absolute top-4 left-4">
          <span className={`badge ${mockEvent.category.color} bg-white/20 text-white border-white/30`}>
            {mockEvent.category.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {/* Event Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{mockEvent.title}</h1>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">{formatDate(mockEvent.date)}</div>
                <div className="text-sm text-gray-500">
                  {mockEvent.time} - {mockEvent.endTime}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">{mockEvent.venue.name}</div>
                <div className="text-sm text-gray-500">{mockEvent.venue.address}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">{mockEvent.attendeeCount} attending</div>
                <div className="text-sm text-gray-500">Capacity: {mockEvent.venue.capacity}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">By {mockEvent.organizer.name}</div>
                <div className="text-sm text-gray-500">
                  {mockEvent.organizer.rating}★ • {mockEvent.organizer.eventsOrganized} events
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {mockEvent.tags.map(tag => (
                <span key={tag} className="badge badge-primary">
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={handleGetDirections}
              className="btn btn-outline"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'details', label: 'Details' },
              { id: 'tickets', label: 'Tickets' },
              { id: 'venue', label: 'Venue' },
              { id: 'organizer', label: 'Organizer' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                  <p className="text-gray-600 mb-4">{mockEvent.description}</p>
                  <div className="prose prose-sm text-gray-600">
                    {mockEvent.longDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Event Policies</h3>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-gray-900">Refund Policy:</strong>
                      <p className="text-gray-600">{mockEvent.policies.refund}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Age Restriction:</strong>
                      <p className="text-gray-600">{mockEvent.policies.ageRestriction}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Dress Code:</strong>
                      <p className="text-gray-600">{mockEvent.policies.dress}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Prohibited Items:</strong>
                      <ul className="text-gray-600 list-disc list-inside">
                        {mockEvent.policies.prohibited.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Choose Your Ticket</h3>
                
                <div className="space-y-4">
                  {mockEvent.ticketTypes.map(ticket => (
                    <div
                      key={ticket.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTicket === ticket.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                          <div className="text-2xl font-bold text-purple-600">
                            {formatPrice(ticket.price)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {ticket.available} of {ticket.total} available
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(ticket.available / ticket.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <strong className="text-sm text-gray-700">Includes:</strong>
                        <ul className="text-sm text-gray-600">
                          {ticket.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTicket && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-lg font-semibold mb-4">
                      <span>Total:</span>
                      <span className="text-purple-600">{formatPrice(getTotalPrice())}</span>
                    </div>
                    
                    <Link href={`/checkout?event=${mockEvent.id}&ticket=${selectedTicket}&quantity=${quantity}`}>
                      <button className="btn btn-primary w-full btn-lg">
                        <Ticket className="w-5 h-5 mr-2" />
                        Buy Tickets
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'venue' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">{mockEvent.venue.name}</h3>
                  <p className="text-gray-600 mb-4">{mockEvent.venue.address}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${mockEvent.venue.phone}`} className="text-purple-600 hover:text-purple-700">
                        {mockEvent.venue.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${mockEvent.venue.email}`} className="text-purple-600 hover:text-purple-700">
                        {mockEvent.venue.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                      <a href={mockEvent.venue.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                        Visit Website
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span>Capacity: {mockEvent.venue.capacity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Facilities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {mockEvent.venue.facilities.map(facility => (
                      <div key={facility} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-600">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Location</h4>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive map would load here</p>
                      <button
                        onClick={handleGetDirections}
                        className="btn btn-primary mt-3"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'organizer' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xl">
                      {mockEvent.organizer.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{mockEvent.organizer.name}</h3>
                      {mockEvent.organizer.verified && (
                        <span className="badge badge-success">Verified</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{mockEvent.organizer.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <div className="font-medium">{mockEvent.organizer.rating}★</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Events Organized:</span>
                        <div className="font-medium">{mockEvent.organizer.eventsOrganized}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Contact Organizer</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${mockEvent.organizer.contact.email}`} className="text-purple-600 hover:text-purple-700">
                        {mockEvent.organizer.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${mockEvent.organizer.contact.phone}`} className="text-purple-600 hover:text-purple-700">
                        {mockEvent.organizer.contact.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Follow on Social Media</h4>
                  <div className="flex space-x-3">
                    <a href={mockEvent.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      Facebook
                    </a>
                    <a href={mockEvent.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      Twitter
                    </a>
                    <a href={mockEvent.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm text-gray-500">Starting from</div>
            <div className="text-xl font-bold text-purple-600">
              {formatPrice(Math.min(...mockEvent.ticketTypes.map(t => t.price)))}
            </div>
          </div>
          <Link href="#tickets" className="btn btn-primary">
            Buy Tickets
          </Link>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden pb-20">
        <BottomNavigation cartCount={0} />
      </div>
    </div>
  );
}