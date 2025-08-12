/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas']
  },
  webpack: (config) => {
    config.externals.push({
      canvas: 'canvas'
    });
    return config;
  }
};

module.exports = nextConfig; 