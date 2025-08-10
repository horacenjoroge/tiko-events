// src/app/layout.tsx - Updated with PWA Integration
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PWAProvider } from '@/components/PWAProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification';
import { PWAStatus } from '@/components/PWAStatus';
import { NotificationHandler } from '@/components/PWAProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TiKo - Event Ticketing for Kenya",
  description: "Discover and book amazing events across Kenya - from concerts to hiking adventures",
  keywords: "events, tickets, Kenya, concerts, hiking, entertainment, Nairobi, Mombasa",
  authors: [{ name: "TiKo Team" }],
  creator: "TiKo",
  publisher: "TiKo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TiKo",
  },
  applicationName: "TiKo",
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'TiKo',
    'msapplication-TileColor': '#8b5cf6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#8b5cf6',
  },
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="background-color" content="#ffffff" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://api.tiko.co.ke" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for external services */}
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//api.pesapal.com" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/icons/icon-192x192.png" as="image" />
        <link rel="preload" href="/manifest.json" as="fetch" crossOrigin="anonymous" />
      </head>
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PWAProvider>
              {/* Main App Content */}
              <div id="app-root" className="min-h-screen">
                {children}
              </div>
              
              {/* PWA Components */}
              <PWAInstallBanner />
              <PWAUpdateNotification />
              <NotificationHandler />
              
              {/* PWA Status - Only show in development or for debugging */}
              {process.env.NODE_ENV === 'development' && <PWAStatus />}
              
              {/* React Query DevTools - Development only */}
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
            </PWAProvider>
          </AuthProvider>
        </QueryClientProvider>
        
        {/* Loading script for immediate PWA initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate PWA setup
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // Track last activity for data sync optimization
              function updateLastActivity() {
                localStorage.setItem('lastActivity', Date.now().toString());
              }
              
              // Update on various user interactions
              ['click', 'touchstart', 'keydown', 'scroll'].forEach(event => {
                document.addEventListener(event, updateLastActivity, { passive: true });
              });
              
              // Initial activity
              updateLastActivity();
            `
          }}
        />
      </body>
    </html>
  );
}