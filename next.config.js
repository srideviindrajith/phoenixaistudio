const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Development-only rewrites removed for production deployment
  // Previously included localhost:5173 Vite dev server rewrites
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@prisma/client': path.resolve(__dirname, 'node_modules/.prisma/client'),
    };

    if (isServer && Array.isArray(config.externals)) {
      config.externals = config.externals.map((external) => {
        if (typeof external !== 'function') {
          return external;
        }

        return (context, callback) => {
          const request = typeof context === 'string' ? context : context?.request;
          if (request === '@prisma/client') {
            return callback();
          }

          return external(context, callback);
        };
      });
    }

    return config;
  },
};

module.exports = nextConfig;
