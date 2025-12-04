/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Expose environment variables to the server runtime
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize cheerio to avoid bundling issues
      config.externals = config.externals || [];
      if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      config.externals.push({
        cheerio: 'commonjs cheerio',
      });
    }
    return config;
  },
}

module.exports = nextConfig