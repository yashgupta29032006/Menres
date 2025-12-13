/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB', // Blue 600
                    hover: '#1D4ED8',   // Blue 700
                    light: '#3B82F6',   // Blue 500
                },
                slate: {
                    50: '#F8FAFC', // App Background
                    100: '#F1F5F9', // Panel Background
                    200: '#E2E8F0', // Hover States (No borders)
                    300: '#CBD5E1', // Icon Colors
                    800: '#0F172A', // Text Primary (High Contrast)
                    500: '#64748B', // Text Secondary
                },
                // Chart colors
                chart: {
                    1: '#2563EB',
                    2: '#10B981',
                    3: '#F59E0B',
                    4: '#EC4899',
                    5: '#8B5CF6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.02)', // Panel separation
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)', // Subtle card definition
                'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Canvas elevation
                'glow': '0 0 0 2px rgba(37, 99, 235, 0.1)', // Focus rings
            },
            borderRadius: {
                'xl': '12px',
                'lg': '8px',
                'full': '9999px',
            }
        },
    },
    plugins: [],
}
