// src/app/page.tsx - Updated with new components
import Link from 'next/link'
import { Header } from '@/components/Header'
import { BottomNavigation } from '@/components/BottomNavigation'
import { EventCard } from '@/components/EventCard'
import { Search, MapPin, Calendar, TrendingUp, Users } from 'lucide-react'

// Mock data - replace with API calls later
const featuredEvents = [
  {
    id: '1',
    title: 'Sauti Sol Live in Concert',
    description: 'Join Kenya\'s biggest music stars for an unforgettable night of live music and entertainment.',
    imageUrl: '/api/placeholder/400/200',
    date: '2025-09-15',
    time: '8:00 PM',
    venue: {
      name: 'KICC Nairobi',
      address: 'Kenyatta International Convention Centre, Nairobi'
    },
    category: {
      name: 'Music',
      color: 'badge-primary'
    },
    ticketTypes: [
      { name: 'Regular', price: 2500, available: 150 },
      { name: 'VIP', price: 5000, available: 50 }
    ],
    attendeeCount: 1200,
    organizer: {
      name: 'Sol Generation'
    }
  },
  {
    id: '2',
    title: 'Mt. Kenya Hiking Adventure',
    description: 'Experience the beauty of Kenya\'s second highest mountain with professional guides and safety equipment.',
    imageUrl: '/api/placeholder/400/200',
    date: '2025-09-20',
    time: '6:00 AM',
    venue: {
      name: 'Naro Moru Gate',
      address: 'Mt. Kenya National Park'
    },
    category: {
      name: 'Adventure',
      color: 'badge-secondary'
    },
    ticketTypes: [
      { name: 'Day Hike', price: 3500, available: 25 },
      { name: '2-Day Trek', price: 8500, available: 15 }
    ],
    attendeeCount: 45,
    organizer: {
      name: 'Kenya Adventure Tours'
    }
  }
];

const upcomingEvents = [
  {
    id: '3',
    title: 'Comedy Night with Churchill',
    description: 'Laugh the night away with Kenya\'s funniest comedians.',
    imageUrl: '/api/placeholder/400/200',
    date: '2025-09-10',
    time: '7:30 PM',
    venue: {
      name: 'Carnivore Restaurant',
      address: 'Langata Road, Nairobi'
    },
    category: {
      name: 'Comedy',
      color: 'badge-warning'
    },
    ticketTypes: [
      { name: 'Standard', price: 1500, available: 200 }
    ],
    attendeeCount: 350,
    organizer: {
      name: 'Laugh Industry'
    }
  },
  {
    id: '4',
    title: 'Nairobi Tech Conference 2025',
    description: 'Connect with tech leaders and innovators shaping Kenya\'s digital future.',
    imageUrl: '/api/placeholder/400/200',
    date: '2025-09-25',
    time: '9:00 AM',
    venue: {
      name: 'Strathmore University',
      address: 'Madaraka Estate, Nairobi'
    },
    category: {
      name: 'Technology',
      color: 'badge-info'
    },
    ticketTypes: [
      { name: 'Student', price: 1000, available: 100 },
      { name: 'Professional', price: 3000, available: 150 }
    ],
    attendeeCount: 500,
    organizer: {
      name: 'TechNairobi'
    }
  }
];

const categories = [
  { name: 'Music & Concerts', icon: '🎵', count: 45, color: 'bg-purple-100 text-purple-800' },
  { name: 'Adventure & Hiking', icon: '🏔️', count: 28, color: 'bg-green-100 text-green-800' },
  { name: 'Comedy Shows', icon: '🎭', count: 15, color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Technology', icon: '💻', count: 22, color: 'bg-blue-100 text-blue-800' },
  { name: 'Sports', icon: '⚽', count: 35, color: 'bg-orange-100 text-orange-800' },
  { name: 'Food & Drinks', icon: '🍽️', count: 18, color: 'bg-red-100 text-red-800' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        variant="search"
        showLocation={true}
        showNotifications={true}
        notificationCount={3}
      />

      {/* Main Content */}
      <main className="container py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-500">Events</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">47</div>
                <div className="text-sm text-gray-500">Venues</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">12K</div>
                <div className="text-sm text-gray-500">Members</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">89%</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
            <Link href="/events" className="text-purple-600 hover:text-purple-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-6">
            {featuredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                variant="default"
              />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.name}
                href={`/events?category=${category.name.toLowerCase().replace(/ /g, '-')}`}
                className="card-hover p-4 text-center group"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                  {category.count} events
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            <Link href="/events" className="text-purple-600 hover:text-purple-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
              />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/events/create" className="btn btn-outline text-center">
                Create Event
              </Link>
              <Link href="/venues" className="btn btn-outline text-center">
                Find Venues
              </Link>
              <Link href="/tickets" className="btn btn-outline text-center">
                My Tickets
              </Link>
              <Link href="/help" className="btn btn-outline text-center">
                Get Help
              </Link>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Pay Your Way</h3>
            <p className="text-gray-600 mb-8">
              Choose from multiple payment options designed for Kenya
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div className="font-semibold text-gray-900">M-Pesa</div>
                <div className="text-sm text-gray-600">Mobile Money</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <div className="font-semibold text-gray-900">Pesapal</div>
                <div className="text-sm text-gray-600">Cards & Banking</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="font-semibold text-gray-900">Airtel Money</div>
                <div className="text-sm text-gray-600">Mobile Money</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white">💳</span>
                </div>
                <div className="font-semibold text-gray-900">Credit Cards</div>
                <div className="text-sm text-gray-600">Visa & Mastercard</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation - Only show on mobile */}
      <div className="md:hidden">
        <BottomNavigation cartCount={2} />
      </div>
    </div>
  )
}