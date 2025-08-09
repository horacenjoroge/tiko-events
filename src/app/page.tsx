// src/app/page.tsx - Replace the default page
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg"></div>
            <h1 className="text-2xl font-bold text-gradient">TiKo</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/events" className="text-gray-600 hover:text-primary-600 transition-colors">
              Events
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </Link>
            <button className="btn-primary">
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Amazing{' '}
            <span className="text-gradient">Events</span>{' '}
            in Kenya
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From concerts in Nairobi to hiking adventures on Mt. Kenya, 
            find and book the best events across the country.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="btn-primary text-lg px-8 py-3">
              Browse Events
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Create Event
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="event-card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Music & Concerts</h3>
              <p className="text-gray-600">
                From gospel concerts to live band performances across Kenya
              </p>
            </div>

            <div className="event-card p-6 text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Outdoor Adventures</h3>
              <p className="text-gray-600">
                Hiking, camping, and adventure tours with GPS tracking
              </p>
            </div>

            <div className="event-card p-6 text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎪</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Festivals & Shows</h3>
              <p className="text-gray-600">
                Comedy shows, cultural festivals, and entertainment events
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-16 p-8 bg-white rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-6">Pay Your Way</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded"></div>
                <span className="font-medium">M-Pesa</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded"></div>
                <span className="font-medium">Pesapal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded"></div>
                <span className="font-medium">Airtel Money</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded"></div>
                <span className="font-medium">Cards</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 TiKo. Made with ❤️ in Kenya.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary-600 transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-primary-600 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}