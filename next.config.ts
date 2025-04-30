import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "fabulous-iguana-786.convex.cloud", protocol: "https" },
      { hostname: "beaming-kingfisher-974.convex.cloud", protocol: "https" },
      { hostname: "img.clerk.com", protocol: "https" },
    ],
  },
};

export default nextConfig;
