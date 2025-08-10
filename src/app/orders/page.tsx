// src/app/orders/page.tsx - Order History & Management
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { api, Order, SagaStatus } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sagaStatuses, setSagaStatuses] = useState<Record<string, SagaStatus>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const fetchedOrders = await api.orders.getMyOrders();
      setOrders(fetchedOrders);
      
      // Fetch saga statuses for orders that have them
      const ordersWithSagas = fetchedOrders.filter(order => order.sagaId);
      await fetchSagaStatuses(ordersWithSagas);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSagaStatuses = async (ordersWithSagas: Order[]) => {
    const statusPromises = ordersWithSagas.map(async (order) => {
      if (order.sagaId) {
        try {
          const status = await api.orders.getSagaStatus(order.sagaId);
          return { orderId: order.id, status };
        } catch (error) {
          console.error(`Failed to fetch saga status for order ${order.id}:`, error);
          return null;
        }
      }
      return null;
    });

    const results = await Promise.all(statusPromises);
    const statusMap = results.reduce((acc, result) => {
      if (result) {
        acc[result.orderId] = result.status;
      }
      return acc;
    }, {} as Record<string, SagaStatus>);

    setSagaStatuses(statusMap);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.ticketType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ticketType.event?.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      case 'refunded':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.orders.cancel(orderId);
      await fetchOrders(); // Refresh the orders
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const sagaStatus = order.sagaId ? sagaStatuses[order.id] : null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Order #{order.orderNumber}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="text-sm font-medium">{getStatusText(order.status)}</span>
            </div>
            <button
              onClick={() => setSelectedOrder(order)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.ticketType.event?.title || 'Event'}</h4>
                <p className="text-sm text-gray-600">{item.ticketType.name}</p>
                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-purple-600">{formatPrice(item.totalPrice)}</div>
                <div className="text-xs text-gray-500">{formatPrice(item.pricePerTicket)} each</div>
              </div>
            </div>
          ))}
        </div>

        {/* Saga Status */}
        {sagaStatus && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900">Processing Status</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                sagaStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                sagaStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {sagaStatus.status}
              </span>
            </div>
            <div className="space-y-1">
              {sagaStatus.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : step.status === 'failed' ? (
                    <XCircle className="w-3 h-3 text-red-600" />
                  ) : (
                    <Clock className="w-3 h-3 text-yellow-600" />
                  )}
                  <span className="text-gray-700">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {order.payments.length > 0 ? order.payments[0].provider : 'Payment Pending'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">{formatPrice(order.totalAmount)}</div>
            {order.discount > 0 && (
              <div className="text-xs text-green-600">-{formatPrice(order.discount)} discount</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/orders/${order.id}`} className="btn btn-outline btn-sm">
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Link>
            {order.status === 'confirmed' && (
              <Link href={`/tickets?order=${order.id}`} className="btn btn-outline btn-sm">
                View Tickets
              </Link>
            )}
          </div>
          
          {order.status === 'pending' && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="btn btn-ghost btn-sm text-red-600"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    );
  };

  const OrderStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {orders.length}
        </div>
        <div className="text-sm text-gray-600">Total Orders</div>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">
          {orders.filter(o => o.status === 'confirmed').length}
        </div>
        <div className="text-sm text-gray-600">Confirmed</div>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
        <div className="text-2xl font-bold text-yellow-600 mb-1">
          {orders.filter(o => o.status === 'pending').length}
        </div>
        <div className="text-sm text-gray-600">Pending</div>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {formatPrice(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
        </div>
        <div className="text-sm text-gray-600">Total Spent</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="minimal" title="My Orders" showNotifications={true} />
        <div className="container py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="minimal" title="My Orders" showNotifications={true} />
        
        <div className="container py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              Your order history will appear here once you make your first purchase.
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
      <Header variant="minimal" title="My Orders" showNotifications={true} />

      <div className="container py-6">
        <OrderStatsCards />

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex space-x-2">
              {['all', 'pending', 'confirmed', 'cancelled'].map(filter => (
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

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/events" className="btn btn-outline text-center">
              Browse Events
            </Link>
            <Link href="/tickets" className="btn btn-outline text-center">
              My Tickets
            </Link>
            <button 
              onClick={fetchOrders}
              className="btn btn-outline text-center"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link href="/help" className="btn btn-outline text-center">
              Need Help?
            </Link>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onRefresh={fetchOrders}
        />
      )}

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <BottomNavigation cartCount={0} />
      </div>
    </div>
  );
}

// Order Detail Modal Component
interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onRefresh: () => void;
}

function OrderDetailModal({ order, onClose, onRefresh }: OrderDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      // In real implementation, generate and download PDF receipt
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      console.log('Downloaded receipt for order:', order.id);
    } catch (error) {
      console.error('Failed to download receipt:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to request a refund for this order?')) return;

    setIsRefunding(true);
    try {
      // In real implementation, initiate refund process
      if (order.payments.length > 0) {
        await api.payments.refund(order.payments[0].id, {
          reason: 'Customer requested refund'
        });
        await onRefresh();
        onClose();
      }
    } catch (error) {
      console.error('Failed to request refund:', error);
      alert('Failed to request refund. Please contact support.');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">#{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    order.status === 'confirmed' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} tickets</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
              {order.payments.length > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span>{order.payments[0].provider.charAt(0).toUpperCase() + order.payments[0].provider.slice(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      order.payments[0].status === 'completed' ? 'text-green-600' :
                      order.payments[0].status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.payments[0].status.charAt(0).toUpperCase() + order.payments[0].status.slice(1)}
                    </span>
                  </div>
                  {order.payments[0].transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{order.payments[0].transactionId}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No payment information available</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.ticketType.event?.title || 'Event'}</h4>
                    <p className="text-sm text-gray-600">{item.ticketType.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    {item.tickets.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {item.tickets.length} ticket{item.tickets.length !== 1 ? 's' : ''} generated
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">{formatPrice(item.totalPrice)}</div>
                    <div className="text-xs text-gray-500">{formatPrice(item.pricePerTicket)} each</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatPrice(order.totalAmount - order.serviceFee + order.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee:</span>
                <span>{formatPrice(order.serviceFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-purple-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              className="btn btn-outline flex-1"
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Receipt
            </button>
            
            {order.status === 'confirmed' && (
              <Link 
                href={`/tickets?order=${order.id}`} 
                className="btn btn-primary flex-1 text-center"
              >
                View Tickets
              </Link>
            )}
            
            {(order.status === 'confirmed' || order.status === 'pending') && (
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="btn btn-ghost text-red-600 flex-1"
              >
                {isRefunding ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Request Refund'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}