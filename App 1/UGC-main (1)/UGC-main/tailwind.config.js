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
                    DEFAULT: '#8b5cf6', // Violet 500
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#27272a', // Zinc 800
                    foreground: '#fafafa',
                },
                accent: {
                    DEFAULT: '#d946ef', // Fuchsia 500
                    foreground: '#ffffff',
                },
                background: '#09090b', // Zinc 950
                foreground: '#fafafa', // Zinc 50
                card: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    foreground: '#fafafa',
                },
                popover: {
                    DEFAULT: '#09090b',
                    foreground: '#fafafa',
                },
                muted: {
                    DEFAULT: '#27272a',
                    foreground: '#a1a1aa',
                },
                destructive: {
                    DEFAULT: '#7f1d1d',
                    foreground: '#fafafa',
                },
                border: '#27272a',
                input: '#27272a',
                ring: '#d4d4d8',
            },
            fontFamily: {
                sans: ['"Space Grotesk"', 'sans-serif'],
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [],
}
