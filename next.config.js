/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  publicRuntimeConfig: {
    contractName: 'blackdragonchest.testnet', // Replace with your contract name
  },
  images: {
    unoptimized: true, // If you use next/image and want to support static export
  },
};

module.exports = nextConfig;
