
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#3713ec",
                "background-light": "#F2F4F7",
                "background-dark": "#13151A",
                "card-light": "#ffffff",
                "card-dark": "#1C1F26",
                "border-light": "#e2e8f0",
                "border-dark": "#2D3139",
            },
            fontFamily: {
                "sans": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
