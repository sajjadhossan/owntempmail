import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true, // Enable Gzip / Brotli compression for maximum CDN transfer speed
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // 1-year immutable caching for static files and chunks (Cloudflare & Browser CDN)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 50k Domains search API: 24h CDN Edge Cache, 1h Browser Cache with Stale-While-Revalidate
        source: '/api/domains/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400',
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Real-time Inbound Mail & OTP APIs: STRICT NO-CACHE (Zero latency fresh delivery)
        source: '/api/inbox/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        // Developer API v1: No-store for inboxes
        source: '/api/v1/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        // Static assets and icons caching
        source: '/(favicon.ico|manifest.json|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
