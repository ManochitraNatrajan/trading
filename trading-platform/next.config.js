/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
