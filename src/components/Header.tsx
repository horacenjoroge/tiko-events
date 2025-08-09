// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  MapPin,
  Filter,
  User
} from 'lucide-react';

interface HeaderProps {
  variant?: 'default' | 'search' | 'minimal';
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showLocation?: boolean;
  notificationCount?: number;
  onSearchClick?: () => void;
  onLocationClick?: () => void;
  className?: string;
}

export function Header({
  variant = 'default',
  title,
  showBackButton = false,
  showSearch = true,
  showNotifications = true,
  showLocation = false,
  notificationCount = 0,
  onSearchClick,
  onLocationClick,
  className = ''
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (variant === 'minimal') {
    return (
      <header className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {showBackButton ? (
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <div></div>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
            
            <div className="flex items-center space-x-2">
              {showNotifications && (
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (variant === 'search') {
    return (
      <header className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="container">
          <div className="py-4">
            {/* Top row with logo and user actions */}
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">TiKo</h1>
              </Link>
              
              <div className="flex items-center space-x-2">
                {showLocation && (
                  <button 
                    onClick={onLocationClick}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Nairobi</span>
                  </button>
                )}
                
                {showNotifications && (
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                )}
                
                <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>
            
            {/* Search bar */}
            {showSearch && (
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, venues, or categories..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    onClick={onSearchClick}
                  />
                </div>
                <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Default header
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TiKo</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="nav-link">
              Events
            </Link>
            <Link href="/categories" className="nav-link">
              Categories
            </Link>
            <Link href="/venues" className="nav-link">
              Venues
            </Link>
            <Link href="/help" className="nav-link">
              Help
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {showLocation && (
              <button 
                onClick={onLocationClick}
                className="hidden sm:flex items-center space-x-1 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Nairobi</span>
              </button>
            )}
            
            {showSearch && (
              <button 
                onClick={onSearchClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {showNotifications && (
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}
            
            <Link href="/profile" className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </Link>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/events" className="nav-link py-2">
                Events
              </Link>
              <Link href="/categories" className="nav-link py-2">
                Categories
              </Link>
              <Link href="/venues" className="nav-link py-2">
                Venues
              </Link>
              <Link href="/profile" className="nav-link py-2">
                Profile
              </Link>
              <Link href="/help" className="nav-link py-2">
                Help
              </Link>
              {showLocation && (
                <button 
                  onClick={onLocationClick}
                  className="flex items-center space-x-2 py-2 text-left"
                >
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Change Location</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}