const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.depositshield.retako.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.depositshield.retako.com/api/:path*', // Düzeltilmiş API URL
      },
    ]
  },
})
