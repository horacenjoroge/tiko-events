// src/app/categories/page.tsx - Category Browsing
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Music, 
  Mountain, 
  Mic2, 
  Laptop, 
  Utensils, 
  Calendar,
  TrendingUp,
  MapPin,
  Users,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { BottomNavigation } from '@/components/BottomNavigation';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  eventCount: number;
  popularTags: string[];
  featuredEvent?: Event;
  growth: number; // percentage growth
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

const categories: Category[] = [
  {
    id: 'music',
    name: 'Music & Concerts',
    description: 'Live music performances, concerts, and musical events across Kenya',
    icon: <Music className="w-6 h-6" />,
    color: 'bg-purple-500',
    eventCount: 45,
    popularTags: ['Live Band', 'Gospel', 'Afrobeat', 'Jazz', 'Traditional'],
    growth: 23,
    featuredEvent: {
      id: '1',
      title: 'Sauti Sol Live in Concert',
      description: 'Kenya\'s biggest music stars live',
      imageUrl: '/api/placeholder/300/200',
      date: '2025-09-15',
      time: '8:00 PM',
      venue: { name: 'KICC Nairobi', address: 'Nairobi' },
      category: { name: 'Music', color: 'badge-primary' },
      ticketTypes: [{ name: 'Regular', price: 2500, available: 150 }],
      attendeeCount: 1200,
      organizer: { name: 'Sol Generation' }
    }
  },
  {
    id: 'adventure',
    name: 'Adventure & Hiking',
    description: 'Outdoor adventures, hiking trips, and nature experiences',
    icon: <Mountain className="w-6 h-6" />,
    color: 'bg-green-500',
    eventCount: 28,
    popularTags: ['Mt. Kenya', 'Day Hikes', 'Camping', 'Rock Climbing', 'Safari'],
    growth: 45,
    featuredEvent: {
      id: '2',
      title: 'Mt. Kenya Hiking Adventure',
      description: 'Conquer Kenya\'s second highest peak',
      imageUrl: '/api/placeholder/300/200',
      date: '2025-09-20',
      time: '6:00 AM',
      venue: { name: 'Naro Moru Gate', address: 'Mt. Kenya' },
      category: { name: 'Adventure', color: 'badge-secondary' },
      ticketTypes: [{ name: 'Day Hike', price: 3500, available: 25 }],
      attendeeCount: 45,
      organizer: { name: 'Kenya Adventure Tours' }
    }
  },
  {
    id: 'comedy',
    name: 'Comedy Shows',
    description: 'Stand-up comedy, entertainment shows, and humor events',
    icon: <Mic2 className="w-6 h-6" />,
    color: 'bg-yellow-500',
    eventCount: 15,
    popularTags: ['Stand-up', 'Churchill Show', 'Improv', 'Local Comedy'],
    growth: 12,
    featuredEvent: {
      id: '3',
      title: 'Comedy Night with Churchill',
      description: 'Laugh the night away',
      imageUrl: '/api/placeholder/300/200',
      date: '2025-09-10',
      time: '7:30 PM',
      venue: { name: 'Carnivore Restaurant', address: 'Nairobi' },
      category: { name: 'Comedy', color: 'badge-warning' },
      ticketTypes: [{ name: 'Standard', price: 1500, available: 200 }],
      attendeeCount: 350,
      organizer: { name: 'Laugh Industry' }
    }
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Tech conferences, workshops, networking events, and innovation showcases',
    icon: <Laptop className="w-6 h-6" />,
    color: 'bg-blue-500',
    eventCount: 22,
    popularTags: ['Startups', 'AI/ML', 'Fintech', 'Mobile Apps', 'Blockchain'],
    growth: 67,
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    description: 'Food festivals, wine tastings, culinary events, and dining experiences',
    icon: <Utensils className="w-6 h-6" />,
    color: 'bg-orange-500',
    eventCount: 18,
    popularTags: ['Wine Tasting', 'Food Festival', 'Cooking Class', 'Local Cuisine'],
    growth: 34,
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    description: 'Sports events, marathons, fitness classes, and athletic competitions',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-red-500',
    eventCount: 35,
    popularTags: ['Marathon', 'Football', 'Basketball', 'Yoga', 'Fitness'],
    growth: 28,
  }
];

const popularLocations = [
  { name: 'Nairobi', eventCount: 89, icon: '🏙️' },
  { name: 'Mombasa', eventCount: 34, icon: '🏖️' },
  { name: 'Kisumu', eventCount: 22, icon: '🌊' },
  { name: 'Mt. Kenya', eventCount: 15, icon: '🏔️' },
  { name: 'Maasai Mara', eventCount: 12, icon: '🦁' },
  { name: 'Nakuru', eventCount: 8, icon: '🦩' }
];

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const CategoryCard = ({ category }: { category: Category }) => (
    <Link href={`/events?category=${category.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white`}>
            {category.icon}
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+{category.growth}%</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{category.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{category.eventCount} events</span>
          <ChevronRight className="w-4 h-4" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {category.popularTags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
              {tag}
            </span>
          ))}
          {category.popularTags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
              +{category.popularTags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  const FeaturedEventCard = ({ event }: { event: Event }) => (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="font-medium text-gray-900 mb-2">Featured Event</h4>
      <EventCard event={event} variant="compact" showDetails={false} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="minimal" title="Browse Categories" showNotifications={true} />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Discover Events by Category
            </h1>
            <p className="text-gray-600 text-lg">
              From music concerts to mountain adventures, find events that match your interests
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">6</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">47</div>
            <div className="text-sm text-gray-600">Venues</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">12K</div>
            <div className="text-sm text-gray-600">Attendees</div>
          </div>
        </div>

        {/* Categories Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <div key={category.id}>
                <CategoryCard category={category} />
                {category.featuredEvent && (
                  <FeaturedEventCard event={category.featuredEvent} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Popular Locations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Locations</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularLocations.map(location => (
                <Link
                  key={location.name}
                  href={`/events?location=${location.name.toLowerCase()}`}
                  className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="text-3xl mb-2">{location.icon}</div>
                  <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-500">{location.eventCount} events</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending This Week */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trending This Week</h2>
            <Link href="/events?sort=trending" className="text-purple-600 hover:text-purple-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map(category => (
              <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{category.eventCount} events</span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">+{category.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <div className="bg-purple-600 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Suggest a new category or event type. We're always looking to expand our offerings based on community interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/suggest-event" className="btn bg-white text-purple-600 hover:bg-gray-100">
                Suggest Event Type
              </Link>
              <Link href="/events/create" className="btn bg-purple-700 text-white hover:bg-purple-800">
                Create Your Event
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <BottomNavigation cartCount={0} />
      </div>
    </div>
  );
}