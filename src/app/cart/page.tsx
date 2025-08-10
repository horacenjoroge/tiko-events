// src/app/cart/page.tsx - Shopping Cart
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Clock,
  MapPin,
  Calendar,
  ArrowLeft,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';

interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketType: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  quantity: number;
  reservedUntil: string; // ISO date string
  eventImage: string;
}

// Mock cart data
const mockCartItems: CartItem[] = [
  {
    id: 'cart-1',
    eventId: '1',
    eventTitle: 'Sauti Sol Live in Concert',
    eventDate: '2025-09-15',
    eventTime: '8:00 PM',
    venue: 'KICC Nairobi',
    ticketType: {
      id: 'regular',
      name: 'Regular',
      description: 'Standard seating with great view',
      price: 2500
    },
    quantity: 2,
    reservedUntil: '2025-08-10T14:30:00Z',
    eventImage: '/api/placeholder/400/200'
  },
  {
    id: 'cart-2',
    eventId: '2',
    eventTitle: 'Mt. Kenya Hiking Adventure',
    eventDate: '2025-09-20',
    eventTime: '6:00 AM',
    venue: 'Naro Moru Gate',
    ticketType: {
      id: 'day-hike',
      name: 'Day Hike',
      description: 'Guided day hike with equipment',
      price: 3500
    },
    quantity: 1,
    reservedUntil: '2025-08-10T14:25:00Z',
    eventImage: '/api/placeholder/400/200'
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.ticketType.price * item.quantity), 0);
  const serviceFee = subtotal * 0.05; // 5% service fee
  const discount = (subtotal * promoDiscount) / 100;
  const total = subtotal + serviceFee - discount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const applyPromoCode = async () => {
    setIsApplyingPromo(true);
    
    // Mock promo code validation
    setTimeout(() => {
      if (promoCode.toLowerCase() === 'tiko10') {
        setPromoDiscount(10);
      } else if (promoCode.toLowerCase() === 'student') {
        setPromoDiscount(15);
      } else {
        setPromoDiscount(0);
        alert('Invalid promo code');
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const getTimeRemaining = (reservedUntil: string) => {
    const now = new Date();
    const expiry = new Date(reservedUntil);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} min${minutes !== 1 ? 's' : ''} left`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="minimal" title="Shopping Cart" showBackButton={true} />
        
        <div className="container py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any tickets to your cart yet.
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
      <Header variant="minimal" title="Shopping Cart" showBackButton={true} />

      <div className="container py-6">
        {/* Reservation Timer */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-900">Tickets Reserved</h3>
              <p className="text-sm text-orange-700">
                Complete your purchase before your reservation expires
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.eventImage}
                    alt={item.eventTitle}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.eventTitle}</h3>
                        <p className="text-sm text-gray-600">{item.ticketType.name}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.eventDate)} • {item.eventTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{item.venue}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">
                          {formatPrice(item.ticketType.price * item.quantity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPrice(item.ticketType.price)} each
                        </div>
                      </div>
                    </div>
                    
                    {/* Reservation Timer */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Reserved until:</span>
                        <span className="text-orange-600 font-medium">
                          {getTimeRemaining(item.reservedUntil)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoDiscount}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>
              
              {/* Promo Code */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Promo Code</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={isApplyingPromo || !promoCode}
                    className="btn btn-outline btn-sm"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-purple-600">{formatPrice(total)}</span>
                </div>
              </div>
              
              <Link href="/checkout" className="btn btn-primary w-full btn-lg mb-3">
                Proceed to Checkout
              </Link>
              
              <Link href="/events" className="btn btn-ghost w-full">
                Continue Shopping
              </Link>
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Secure Checkout</p>
                    <p>Your payment information is protected with industry-standard encryption.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-bold text-purple-600">{formatPrice(total)}</div>
          </div>
          <Link href="/checkout" className="btn btn-primary">
            Checkout
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden pb-20">
        <BottomNavigation cartCount={cartItems.length} />
      </div>
    </div>
  );
}