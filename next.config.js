/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Handle pdfjs-dist worker
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
}

module.exports = nextConfig
