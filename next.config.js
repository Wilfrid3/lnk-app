const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in both dev and production
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // SEO and Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  
  // Image optimization for SEO
  images: {
    formats: ['image/webp', 'image/avif'], // Modern formats for better performance
    domains: [
      'lh3.googleusercontent.com',
      'localhost',
      'res.cloudinary.com',
      's3.amazonaws.com',
      'localhost:3000',
      'localhost:3001',
      'yamohub.com',
      'v1.yamohub.com',
      'www.yamohub.com',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'yamohub.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v1.yamohub.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.yamohub.com',
        pathname: '/**',
      },
    ],
    // Image optimization settings for SEO
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for images
  },

  // Security and SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Adult content compliance
          {
            key: 'PICS-Label',
            value: '(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l gen true for "http://www.rsac.org/" r (s 4))',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/icons-material', 'lucide-react'],
  },

  // Webpack configuration for performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          enforce: true,
        },
      };
    }
    
    return config;
  },
};

// Export with PWA wrapper
module.exports = withPWA(nextConfig);