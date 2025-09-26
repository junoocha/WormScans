/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#1f1f1f", // Main background
        fg: "#ededed", // Foreground text
        accent: "#39ff14", // Neon green
        card: "#111111", // Card background
        cardHover: "#1a1a1a", // Card hover
      },
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 10px #39ff14", // Neon glow
        glowLg: "0 0 20px #39ff14",
      },
    },
  },
  plugins: [],
};
