/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v4 uses automatic content detection, but we can still specify content paths
  // if needed for compatibility or explicit control
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx}',
    './src/renderer/index.html',
  ],
};
