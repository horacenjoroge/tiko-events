// next.config.js - PWA Configuration
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  manifestPath: '/manifest.json',
  sw: 'sw.js',
  fallbacks: {
    // Failed page requests fallback to this
    document: '/offline',
  },
  cacheStartUrl: true,
  dynamicStartUrl: false,
  reloadOnOnline: true,
});

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => [
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/manifest+json',
        },
      ],
    },
  ],
};