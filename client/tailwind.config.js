/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Corporate Clean System
                corp: {
                    primary: '#1a56db', // Classic Blue Header
                    secondary: '#1e40af', // Darker Blue
                    bg: '#f0f2f5',      // Light Gray App Background
                    border: '#d1d5db',  // Standard Border
                    text: '#333333',    // Dark Gray Text
                    muted: '#6b7280',   // Muted Text
                },
                // Chart colors (Standard Office Palette)
                chart: {
                    1: '#1a56db', // Blue
                    2: '#dc2626', // Red
                    3: '#f59e0b', // Amber
                    4: '#10b981', // Emerald
                    5: '#8b5cf6', // Violet
                }
            },
            fontFamily: {
                // Traditional System Sans
                sans: ['Arial', 'Helvetica', 'sans-serif'],
            },
            boxShadow: {
                'clean': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'paper': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            }
        },
    },
    plugins: [],
}
