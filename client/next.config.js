/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      "ipfs.io",
      "gateway.pinata.cloud",
      "res.cloudinary.com",
      "github.com",
    ],
  },
};

module.exports = nextConfig
