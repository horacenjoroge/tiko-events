// src/components/BottomNavigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  ShoppingCart, 
  User,
  Search,
  Ticket
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface BottomNavigationProps {
  cartCount?: number;
  className?: string;
}

export function BottomNavigation({ cartCount = 0, className = '' }: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      href: '/events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      href: '/search',
      label: 'Search',
      icon: <Search className="w-5 h-5" />
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: cartCount
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 ${className}`}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1
              transition-colors duration-200 relative
              ${isActive(item.href) 
                ? 'text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium truncate w-full text-center">
              {item.label}
            </span>
            {isActive(item.href) && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-purple-600 rounded-b" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Alternative floating navigation for premium feel
export function FloatingBottomNavigation({ cartCount = 0, className = '' }: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      href: '/events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      href: '/tickets',
      label: 'Tickets',
      icon: <Ticket className="w-5 h-5" />
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: cartCount
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={`fixed bottom-6 left-4 right-4 z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 backdrop-blur-lg bg-white/95">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1
                transition-all duration-200 relative rounded-xl
                ${isActive(item.href) 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}