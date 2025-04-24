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
};

module.exports = nextConfig;