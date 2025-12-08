/** @type {import('tailwindcss').Config} */

// tailwind.config.js
export default {
  content: {
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  theme: {
    extend: {
      colors: {
        "": "#2E0086",
        "": "#127801",
      },
      backgroundImage: {
        "auth-bike": "url('/src/assets/auth-image.png')",
      },
      //   animation: {
      //     fadeIn: "fadeIn 0.5s ease-in-out forwards",
      //   },
    },
  },
  //   plugins: [
  //     require("tailwind-scrollbar"),
  //     require("tailwindcss-animate"),
  //     // other plugins...
  //   ]
};