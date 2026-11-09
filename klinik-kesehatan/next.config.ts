import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Mengabaikan error tipe data TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true, // Mengabaikan error linter ESLint
  },
};

export default nextConfig;
