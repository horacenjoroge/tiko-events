// src/app/offline/page.tsx - Offline Fallback Page
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  WifiOff, 
  RefreshCw, 
  Ticket, 
  Calendar, 
  User,
  Search,
  Database,
  Clock
} from 'lucide-react';
import { offlineStorage } from '@/lib/offline-storage';
import { backgroundSync } from '@/lib/background-sync';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [cachedData, setCachedData] = useState({
    events: 0,
    tickets: 0,
    orders: 0
  });
  const [syncStatus, setSyncStatus] = useState({
    queueLength: 0,
    syncInProgress: false
  });

  useEffect(() => {
    checkOnlineStatus();
    loadCachedData();
    updateSyncStatus();

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home after a brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOnlineStatus = () => {
    setIsOnline(navigator.onLine);
  };

  const loadCachedData = async () => {
    try {
      const [events, tickets, orders] = await Promise.all([
        offlineStorage.getCachedEvents(),
        offlineStorage.getCachedTickets(),
        offlineStorage.getCachedOrders()
      ]);

      setCachedData({
        events: events.length,
        tickets: tickets.length,
        orders: orders.length
      });
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  };

  const updateSyncStatus = () => {
    const status = backgroundSync.getSyncStatus();
    setSyncStatus({
      queueLength: status.queueLength,
      syncInProgress: status.syncInProgress
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Back Online!</h1>
          <p className="text-gray-600 mb-6">
            Great! Your connection is restored. Redirecting you back to TiKo...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TiKo</h1>
            <span className="badge bg-orange-100 text-orange-800">Offline</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Offline</h1>
          <p className="text-gray-600 text-lg mb-8">
            No internet connection detected. Don't worry - you can still access your cached content and TiKo will sync your data when you're back online.
          </p>

          <button
            onClick={handleRetry}
            className="btn btn-primary mb-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>

        {/* Cached Content Stats */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Offline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{cachedData.events}</div>
                <div className="text-sm text-gray-600">Cached Events</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Ticket className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{cachedData.tickets}</div>
                <div className="text-sm text-gray-600">Your Tickets</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Database className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{cachedData.orders}</div>
                <div className="text-sm text-gray-600">Order History</div>
              </div>
            </div>
          </div>

          {/* Pending Sync Operations */}
          {syncStatus.queueLength > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Sync</h2>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {syncStatus.queueLength} operation{syncStatus.queueLength !== 1 ? 's' : ''} waiting to sync
                  </p>
                  <p className="text-sm text-gray-600">
                    Your changes will be synchronized automatically when you're back online.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Offline Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What You Can Do Offline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <Ticket className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">View Your Tickets</h3>
                  <p className="text-sm text-gray-600">Access your purchased tickets and QR codes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Browse Cached Events</h3>
                  <p className="text-sm text-gray-600">View events you've previously loaded</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <User className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Check Order History</h3>
                  <p className="text-sm text-gray-600">Review your past orders and bookings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                <Search className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Search Cached Content</h3>
                  <p className="text-sm text-gray-600">Find events and tickets in your offline data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/tickets" className="btn btn-outline text-center">
              <Ticket className="w-4 h-4 mx-auto mb-2" />
              My Tickets
            </Link>
            
            <Link href="/orders" className="btn btn-outline text-center">
              <Database className="w-4 h-4 mx-auto mb-2" />
              Order History
            </Link>
            
            <Link href="/events" className="btn btn-outline text-center">
              <Calendar className="w-4 h-4 mx-auto mb-2" />
              Cached Events
            </Link>
            
            <Link href="/profile" className="btn btn-outline text-center">
              <User className="w-4 h-4 mx-auto mb-2" />
              Profile
            </Link>
          </div>

          {/* Tips for Kenya Users */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Offline Tips for Kenya</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Your tickets work offline - no internet needed for QR codes</li>
              <li>• Save data by browsing cached events instead of refreshing</li>
              <li>• M-Pesa payments will be processed when you're back online</li>
              <li>• Enable notifications to get updates when connection returns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}