/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable strict TypeScript checking
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
