import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/varta-2f722.firebasestorage.app/o/**'
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/varta-2f722.appspot.com/o/**'
      },
      {
        protocol: 'https',
        hostname: 'varta-2f722.firebasestorage.app',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
