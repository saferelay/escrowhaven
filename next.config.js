/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // serverActions is now stable in Next.js 15, no need to enable
  }
}

module.exports = nextConfig
