/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'menti-blue': '#005CFF', // The specific brand color
                'menti-blue-dark': '#0046c2',
                'menti-bg': '#F4F5F7',   // Light Gray SaaS background
                'menti-dark-text': '#191919',
                'menti-light-text': '#505050',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Close to Menti Sans
            },
            boxShadow: {
                'menti-card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'menti-hover': '0 4px 12px rgba(0, 92, 255, 0.15)',
            }
        },
    },
    plugins: [],
}
