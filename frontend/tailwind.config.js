/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sleek dark-mode theme color palette
        dark: {
          bg: '#0F172A',       // Deep navy background
          card: '#1E293B',     // Card background
          border: '#334155',   // Sleek border color
          text: '#F8FAFC'      // Soft white
        }
      }
    },
  },
  plugins: [],
}
