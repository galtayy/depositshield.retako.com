const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'apidepositshield.retako.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://apidepositshield.retako.com/api/:path*', // API URL'yi canlı ortama göre ayarla
      },
    ]
  },
})
