const { Config } = require("tailwindcss");

module.exports = /** @type {Config} */ {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-600": "#008FE0",
        "telkom-blue": "#0383BF",
        "primary-500": "#05a0eb",
        "primary-100": "#d6e7ef",
        "light-blue": "#DBECF9",
        "sidebar-blue": "#02528B",
        "S/50": "#EBEFF3",
        "light-grey": "#F3F7FD",
        "primary-blue": "#008FE0",
        "secondary-blue": "#005E9B",
        "grey-1": "#F3F7FA",
        "dark-blue": "#3C5564",
        "flow-grey": "#E0E9EF",
        "border-grey": "#ACB4B9",
        "delete-red": "#FF5A64",
        "review-blue": "#F0F9FF",
        "review-border": "#CBE2EE",
        "dark-grey": "#353535",
        "hover-blue": "#0076BD",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        gordita: ["var(--font-gordita)"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};
