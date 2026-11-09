import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Abaikan error TypeScript saat compile
  },
  eslint: {
    ignoreDuringBuilds: true, // Abaikan error ESLint
  },
  // MEMATIKAN FITUR CACHE YANG BENTROK DENGAN SUPABASE CLIENT DI NEXT.JS 16
  cacheComponents: false, 
};

export default nextConfig;
