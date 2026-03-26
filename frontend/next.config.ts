import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: 'http://localhost:8000/api/:path*',
        destination: 'https://hockeychart-api.vercel.app/api/:path*'
      },
    ];
  },
};

export default nextConfig;
