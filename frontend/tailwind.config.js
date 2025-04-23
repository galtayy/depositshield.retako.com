/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // CSS class kontrolü ile karanlık mod
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F4B860',
        background: '#F6F6F6',
        landlord: '#3B82F6', // Mavi - Ev Sahibi
        tenant: '#F59E0B',   // Sarı/Turuncu - Kiracı
        other: '#6B7280',    // Gri - Diğer
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px', // Mobil dokunmatik butonlar için minimum yükseklik
      },
      minWidth: {
        'touch': '48px', // Mobil dokunmatik butonlar için minimum genişlik
      },
    },
  },
  plugins: [],
}
