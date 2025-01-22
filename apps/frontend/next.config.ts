import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/:path*`,
        },
      ];
    }

    // Production rewrites
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
