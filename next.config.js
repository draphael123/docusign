/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle pdfjs-dist dependencies
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Ignore specific node modules that aren't needed in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
