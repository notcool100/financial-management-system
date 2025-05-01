/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,
  
  // Configure async/await in the Edge Runtime
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/api-docs',
        destination: '/api/docs',
        permanent: true,
      },
    ];
  },
  
  // Configure rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;