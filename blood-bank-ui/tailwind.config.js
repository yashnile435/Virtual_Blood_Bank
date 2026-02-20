/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#dc2626", // Red-600
                secondary: "#ffffff",
                accent: "#f3f4f6", // Gray-100
            },
            borderRadius: {
                '2xl': '1rem', // Ensure 2xl matches requirement
            }
        },
    },
    plugins: [],
}
