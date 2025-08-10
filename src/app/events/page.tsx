// src/app/events/page.tsx - Event Discovery & Search
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { BottomNavigation } from '@/components/BottomNavigation';

interface EventFilters {
  category: string;
  location: string;
  dateRange: string;
  priceRange: string;
  sortBy: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  venue: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
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
}

// Mock data - replace with API calls
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sauti Sol Live in Concert',
    description: 'Join Kenya\'s biggest music stars for an unforgettable night of live music and entertainment.',
    imageUrl: '/api/placeholder/400/300',
    date: '2025-09-15',
    time: '8:00 PM',
    venue: {
      name: 'KICC Nairobi',
      address: 'Kenyatta International Convention Centre, Nairobi',
      coordinates: { lat: -1.2921, lng: 36.8219 }
    },
    category: { name: 'Music', color: 'badge-primary' },
    ticketTypes: [
      { name: 'Regular', price: 2500, available: 150 },
      { name: 'VIP', price: 5000, available: 50 }
    ],
    attendeeCount: 1200,
    organizer: { name: 'Sol Generation' }
  },
  {
    id: '2',
    title: 'Mt. Kenya Hiking Adventure',
    description: 'Experience the beauty of Kenya\'s second highest mountain with professional guides.',
    imageUrl: '/api/placeholder/400/300',
    date: '2025-09-20',
    time: '6:00 AM',
    venue: {
      name: 'Naro Moru Gate',
      address: 'Mt. Kenya National Park',
      coordinates: { lat: -0.1591, lng: 37.1857 }
    },
    category: { name: 'Adventure', color: 'badge-secondary' },
    ticketTypes: [
      { name: 'Day Hike', price: 3500, available: 25 }
    ],
    attendeeCount: 45,
    organizer: { name: 'Kenya Adventure Tours' }
  },
  {
    id: '3',
    title: 'Comedy Night with Churchill',
    description: 'Laugh the night away with Kenya\'s funniest comedians.',
    imageUrl: '/api/placeholder/400/300',
    date: '2025-09-10',
    time: '7:30 PM',
    venue: {
      name: 'Carnivore Restaurant',
      address: 'Langata Road, Nairobi',
      coordinates: { lat: -1.3644, lng: 36.7073 }
    },
    category: { name: 'Comedy', color: 'badge-warning' },
    ticketTypes: [
      { name: 'Standard', price: 1500, available: 200 }
    ],
    attendeeCount: 350,
    organizer: { name: 'Laugh Industry' }
  },
  {
    id: '4',
    title: 'Nairobi Tech Conference 2025',
    description: 'Connect with tech leaders and innovators shaping Kenya\'s digital future.',
    imageUrl: '/api/placeholder/400/300',
    date: '2025-09-25',
    time: '9:00 AM',
    venue: {
      name: 'Strathmore University',
      address: 'Madaraka Estate, Nairobi',
      coordinates: { lat: -1.3089, lng: 36.8404 }
    },
    category: { name: 'Technology', color: 'badge-info' },
    ticketTypes: [
      { name: 'Student', price: 1000, available: 100 },
      { name: 'Professional', price: 3000, available: 150 }
    ],
    attendeeCount: 500,
    organizer: { name: 'TechNairobi' }
  }
];

const categories = [
  { id: 'all', name: 'All Events', count: 156 },
  { id: 'music', name: 'Music & Concerts', count: 45 },
  { id: 'adventure', name: 'Adventure & Hiking', count: 28 },
  { id: 'comedy', name: 'Comedy Shows', count: 15 },
  { id: 'technology', name: 'Technology', count: 22 },
  { id: 'sports', name: 'Sports', count: 35 },
  { id: 'food', name: 'Food & Drinks', count: 18 }
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<EventFilters>({
    category: 'all',
    location: 'all',
    dateRange: 'all',
    priceRange: 'all',
    sortBy: 'date'
  });

  useEffect(() => {
    filterEvents();
  }, [searchQuery, filters]);

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(event =>
        event.category.name.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (filters.dateRange) {
          case 'today':
            return eventDate.toDateString() === now.toDateString();
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'this_week':
            const weekEnd = new Date(now);
            weekEnd.setDate(now.getDate() + 7);
            return eventDate >= now && eventDate <= weekEnd;
          case 'this_month':
            return eventDate.getMonth() === now.getMonth() && 
                   eventDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(event => {
        const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
        switch (filters.priceRange) {
          case 'free':
            return minPrice === 0;
          case 'under_1000':
            return minPrice < 1000;
          case '1000_3000':
            return minPrice >= 1000 && minPrice <= 3000;
          case 'over_3000':
            return minPrice > 3000;
          default:
            return true;
        }
      });
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price_low':
          const aMinPrice = Math.min(...a.ticketTypes.map(t => t.price));
          const bMinPrice = Math.min(...b.ticketTypes.map(t => t.price));
          return aMinPrice - bMinPrice;
        case 'price_high':
          const aMaxPrice = Math.max(...a.ticketTypes.map(t => t.price));
          const bMaxPrice = Math.max(...b.ticketTypes.map(t => t.price));
          return bMaxPrice - aMaxPrice;
        case 'popularity':
          return (b.attendeeCount || 0) - (a.attendeeCount || 0);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const FilterPanel = () => (
    <div className={`bg-white border-t border-gray-200 p-4 ${showFilters ? 'block' : 'hidden'}`}>
      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="form-input"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">When</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="form-input"
          >
            <option value="all">Any time</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="form-input"
          >
            <option value="all">Any price</option>
            <option value="free">Free</option>
            <option value="under_1000">Under KES 1,000</option>
            <option value="1000_3000">KES 1,000 - 3,000</option>
            <option value="over_3000">Over KES 3,000</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="form-input"
          >
            <option value="date">Date (earliest first)</option>
            <option value="price_low">Price (low to high)</option>
            <option value="price_high">Price (high to low)</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="minimal" title="Discover Events" showNotifications={true} />

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, venues, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-colors ${
                showFilters ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel />

      {/* Quick Category Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleFilterChange('category', category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.category === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Events'}
            </h1>
            <p className="text-gray-600">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      <div className="container pb-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all events.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  category: 'all',
                  location: 'all',
                  dateRange: 'all',
                  priceRange: 'all',
                  sortBy: 'date'
                });
              }}
              className="btn btn-primary"
            >
              View All Events
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <BottomNavigation cartCount={0} />
      </div>
    </div>
  );
}