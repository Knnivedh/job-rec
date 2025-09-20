/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized for Render deployment
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: true // For static export compatibility
  },
  // Environment variables for build
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable webpack 5 features
  webpack: (config, { isServer }) => {
    // Existing canvas config
    config.resolve.alias.canvas = false;
    
    // Handle node modules that might cause issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig