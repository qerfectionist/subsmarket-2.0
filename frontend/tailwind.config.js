/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                foreground: "#ffffff",
            },
            fontFamily: {
                sans: ['SF Pro Display', 'SF Pro Text', 'Helvetica Neue', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Arial', 'sans-serif'],
            },
        },
    },
    darkMode: "class",
    plugins: []
}
