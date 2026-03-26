import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: 'http://localhost:8000/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL
      },
    ];
  },
};

export default nextConfig;
