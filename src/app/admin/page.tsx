// src/app/admin/page.tsx - Admin Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth, usePermissions } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockAlerts: number;
  conversionRate: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  eventTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface EventSummary {
  id: string;
  title: string;
  date: string;
  venue: string;
  ticketsSold: number;
  revenue: number;
  status: string;
  attendees: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { canManageUsers, canAccessAnalytics, canCreateEvents } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (canAccessAnalytics) {
      fetchDashboardData();
    }
  }, [canAccessAnalytics]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch analytics data
      const [analyticsData, ordersData, eventsData] = await Promise.all([
        api.orders.getMyOrders(), // For now, use available endpoints
        api.orders.getMyOrders(),
        api.events.getAll()
      ]);

      // Mock dashboard stats based on available data
      const mockStats: DashboardStats = {
        totalEvents: 156,
        activeEvents: 89,
        totalTicketsSold: 12450,
        totalRevenue: 2850000,
        totalUsers: 8920,
        pendingOrders: 23,
        lowStockAlerts: 5,
        conversionRate: 68.5
      };

      const mockRecentOrders: RecentOrder[] = [
        {
          id: '1',
          orderNumber: 'TK-2025-001',
          customerName: 'John Doe',
          eventTitle: 'Sauti Sol Live Concert',
          amount: 5000,
          status: 'confirmed',
          createdAt: '2025-08-10T10:30:00Z'
        },
        {
          id: '2',
          orderNumber: 'TK-2025-002',
          customerName: 'Jane Smith',
          eventTitle: 'Mt. Kenya Hiking',
          amount: 3500,
          status: 'pending',
          createdAt: '2025-08-10T09:15:00Z'
        }
      ];

      const mockEvents: EventSummary[] = [
        {
          id: '1',
          title: 'Sauti Sol Live Concert',
          date: '2025-09-15',
          venue: 'KICC Nairobi',
          ticketsSold: 850,
          revenue: 2125000,
          status: 'active',
          attendees: 850
        },
        {
          id: '2',
          title: 'Mt. Kenya Hiking Adventure',
          date: '2025-09-20',
          venue: 'Naro Moru Gate',
          ticketsSold: 45,
          revenue: 157500,
          status: 'active',
          attendees: 45
        }
      ];

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setEvents(mockEvents);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check permissions
  if (!canAccessAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="minimal" title="Access Denied" />
        <div className="container py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">
              You don't have permission to access the admin dashboard.
            </p>
            <Link href="/" className="btn btn-primary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="minimal" title="Admin Dashboard" />
        <div className="container py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-green-600 text-sm font-medium">+12%</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalEvents}</div>
        <div className="text-sm text-gray-600">Total Events</div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-green-600 text-sm font-medium">+8%</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalUsers.toLocaleString()}</div>
        <div className="text-sm text-gray-600">Total Users</div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-green-600 text-sm font-medium">+23%</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalTicketsSold.toLocaleString()}</div>
        <div className="text-sm text-gray-600">Tickets Sold</div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-green-600 text-sm font-medium">+15%</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{formatPrice(stats?.totalRevenue || 0)}</div>
        <div className="text-sm text-gray-600">Total Revenue</div>
      </div>
    </div>
  );

  const AlertsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">Low Stock Alert</p>
            <p className="text-xs text-yellow-700">{stats?.lowStockAlerts} events have tickets running low</p>
          </div>
          <Link href="/admin/alerts" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
            View All
          </Link>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Pending Orders</p>
            <p className="text-xs text-blue-700">{stats?.pendingOrders} orders awaiting confirmation</p>
          </div>
          <Link href="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Review
          </Link>
        </div>
      </div>
    </div>
  );

  const RecentOrdersTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <Link href="/admin/orders" className="text-purple-600 hover:text-purple-700 font-medium">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Event</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{order.orderNumber}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-600">{order.customerName}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-600">{order.eventTitle}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-purple-600">{formatPrice(order.amount)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-600">{formatDate(order.createdAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EventsTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Events Overview</h3>
        <div className="flex space-x-2">
          {canCreateEvents && (
            <Link href="/admin/events/create" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          )}
          <Link href="/admin/events" className="btn btn-outline">
            View All
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Event</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Venue</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Sold</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{event.title}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-600">{formatDate(event.date)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-600">{event.venue}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-900">{event.ticketsSold}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-purple-600">{formatPrice(event.revenue)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'active' ? 'bg-green-100 text-green-800' :
                    event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link href={`/events/${event.id}`} className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`} className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="minimal" title="Admin Dashboard" showNotifications={true} />

      <div className="container py-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your events platform today.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Alerts */}
        <AlertsSection />

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'Recent Orders' },
            { id: 'events', label: 'Events' },
            { id: 'analytics', label: 'Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <RecentOrdersTable />
            </div>
            <div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {canCreateEvents && (
                    <Link href="/admin/events/create" className="btn btn-primary text-center">
                      Create Event
                    </Link>
                  )}
                  <Link href="/admin/venues" className="btn btn-outline text-center">
                    Manage Venues
                  </Link>
                  <Link href="/admin/users" className="btn btn-outline text-center">
                    View Users
                  </Link>
                  <Link href="/admin/reports" className="btn btn-outline text-center">
                    <Download className="w-4 h-4 mr-2" />
                    Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <RecentOrdersTable />}
        {activeTab === 'events' && <EventsTable />}
        
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats?.conversionRate}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats?.activeEvents}</div>
                <div className="text-sm text-gray-600">Active Events</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats ? Math.round(stats.totalTicketsSold / stats.totalEvents) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Tickets/Event</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}