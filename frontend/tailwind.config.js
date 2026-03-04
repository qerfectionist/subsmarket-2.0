/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/theme");

module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                foreground: "#ffffff",
            },
            fontFamily: {
                // ui-rounded = SF Pro Rounded на iOS/macOS
                // Nunito Variable = visibly rounded, RU + KZ Cyrillic support
                sans: ['ui-rounded', 'Nunito Variable', 'Nunito', 'system-ui', 'sans-serif'],
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()]
}
