/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        whatsappbg: "#00a783",
        whatsappbg2: "#212121",
        whatsappbg3: "#3f4040",
        chattextbg: "#006666"
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}

