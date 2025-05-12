/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    GOOGLE_APPLICATION_CREDENTIALS_JSON: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '',
    // Use local API route to avoid CORS issues in production
    NEXT_PUBLIC_BACKEND_URL: '/api/search'
  }
};

export default nextConfig;
