/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth profile images
  },
  // Enable static exports for deployment
  output: 'standalone',
  // Add any other necessary configurations here
};

module.exports = nextConfig;
