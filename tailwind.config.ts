import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Sukoon brand colors
                sukoon: {
                    primary: '#2D5A87',
                    secondary: '#F7F3E9',
                    accent: '#D4AF37',
                    text: '#1A1A1A',
                    muted: '#6B7280'
                },
                // Mood colors as specified in requirements
                mood: {
                    happy: '#F59E0B', // amber
                    sad: '#3B82F6',   // blue
                    angry: '#EF4444', // red
                    anxious: '#8B5CF6', // violet
                    depressed: '#64748B', // slate
                    grateful: '#10B981' // green
                }
            },
            fontFamily: {
                // Arabic fonts for Qur'an text
                arabic: ['Amiri', 'Scheherazade New', 'serif'],
                // Latin fonts
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Georgia', 'serif']
            },
            fontSize: {
                // Mobile-optimized Arabic text sizes
                'arabic-sm': ['1.25rem', { lineHeight: '1.8' }],
                'arabic-base': ['1.5rem', { lineHeight: '1.8' }],
                'arabic-lg': ['1.875rem', { lineHeight: '1.8' }],
                'arabic-xl': ['2.25rem', { lineHeight: '1.8' }]
            },
            animation: {
                'jar-lid': 'jar-lid 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                'slip-rise': 'slip-rise 250ms ease-out',
                'card-unfold': 'card-unfold 150ms ease-out'
            },
            keyframes: {
                'jar-lid': {
                    '0%': { transform: 'rotate(0deg) translateY(0px)' },
                    '100%': { transform: 'rotate(15deg) translateY(-6px)' }
                },
                'slip-rise': {
                    '0%': { transform: 'translateY(0px) scale(1)' },
                    '100%': { transform: 'translateY(-40px) scale(1.06)' }
                },
                'card-unfold': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                }
            },
            screens: {
                'xs': '390px', // Mobile-first as specified in requirements
            }
        },
    },
    plugins: [],
}
export default config