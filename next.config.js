/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable strict TypeScript checking
    ignoreBuildErrors: false,
  },
  eslint: {
    // Disable Next.js built-in ESLint during builds (use npm run lint instead)
    // Next.js 14 doesn't fully support ESLint v9 - upgrade to Next.js 15 for full support
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
