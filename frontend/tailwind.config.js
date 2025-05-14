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
        sans: ['Nunito', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px', // Mobil dokunmatik butonlar için minimum yükseklik
      },
      minWidth: {
        'touch': '48px', // Mobil dokunmatik butonlar için minimum genişlik
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.px-safe': {
          'padding-left': 'max(1rem, env(safe-area-inset-left))',
          'padding-right': 'max(1rem, env(safe-area-inset-right))',
        },
        '.pb-safe': {
          'padding-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        },
        '.pt-safe': {
          'padding-top': 'max(1rem, env(safe-area-inset-top))',
        },
        '.top-safe': {
          'top': 'env(safe-area-inset-top)',
        },
        '.left-safe': {
          'left': 'env(safe-area-inset-left)',
        },
        '.right-safe': {
          'right': 'env(safe-area-inset-right)',
        },
        '.bottom-safe': {
          'bottom': 'env(safe-area-inset-bottom)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}
