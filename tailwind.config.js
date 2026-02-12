module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Couleur bleue personnalisée
        secondary: '#FBBF24', // Couleur jaune personnalisée
        background: '#F3F4F6', // Couleur de fond personnalisée
        customGreen: '#32CD32', // Une couleur verte personnalisée
      },
    },
  },
  plugins: [],
}
