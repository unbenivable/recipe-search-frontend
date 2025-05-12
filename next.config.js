/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Comment this out when all TypeScript errors are resolved
    // ignoreBuildErrors: true,
  },
  // Improve ESLint configuration
  eslint: {
    // Warning rather than error is often more appropriate during development
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

module.exports = nextConfig 