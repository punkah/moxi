/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig 