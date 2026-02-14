/** @type {import('tailwindcss').Config} */
module.exports = {
        content: [
                "./src/**/*.{js,jsx,ts,tsx}",
                "./public/index.html",
        ],
        theme: {
                extend: {
                        fontFamily: {
                                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                        },
                        colors: {
                                primary: {
                                        50: '#eef2ff',
                                        100: '#e0e7ff',
                                        200: '#c7d2fe',
                                        300: '#a5b4fc',
                                        400: '#818cf8',
                                        500: '#6366f1',
                                        600: '#4f46e5',
                                        700: '#4338ca',
                                        800: '#3730a3',
                                        900: '#312e81',
                                },
                                accent: {
                                        400: '#a78bfa',
                                        500: '#8b5cf6',
                                        600: '#7c3aed',
                                },
                                success: '#10b981',
                                warning: '#f59e0b',
                                danger: '#ef4444',
                        },
                        animation: {
                                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                'bounce-slow': 'bounce 2s infinite',
                                'float': 'float 6s ease-in-out infinite',
                                'float-delayed': 'float 6s ease-in-out 3s infinite',
                                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                                'shimmer': 'shimmer 2s linear infinite',
                                'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                'fade-in': 'fadeIn 0.5s ease-out',
                                'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                'blob': 'blob 7s infinite',
                        },
                        keyframes: {
                                float: {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-20px)' },
                                },
                                glowPulse: {
                                        '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(139,92,246,0.2)' },
                                        '50%': { boxShadow: '0 0 30px rgba(99,102,241,0.6), 0 0 80px rgba(139,92,246,0.4)' },
                                },
                                shimmer: {
                                        '0%': { backgroundPosition: '-200% 0' },
                                        '100%': { backgroundPosition: '200% 0' },
                                },
                                slideUp: {
                                        '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
                                        '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                                },
                                fadeIn: {
                                        '0%': { opacity: '0' },
                                        '100%': { opacity: '1' },
                                },
                                scaleIn: {
                                        '0%': { opacity: '0', transform: 'scale(0.9)' },
                                        '100%': { opacity: '1', transform: 'scale(1)' },
                                },
                                blob: {
                                        '0%': { transform: 'translate(0px, 0px) scale(1)' },
                                        '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                                        '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                                        '100%': { transform: 'translate(0px, 0px) scale(1)' },
                                },
                        },
                        boxShadow: {
                                'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
                                'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
                                'glass-hover': '0 20px 60px rgba(0, 0, 0, 0.15)',
                                'glow': '0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(139,92,246,0.2)',
                                'glow-lg': '0 0 30px rgba(99,102,241,0.5), 0 0 80px rgba(139,92,246,0.3)',
                                'product': '0 4px 24px rgba(0, 0, 0, 0.06)',
                                'product-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
                        },
                        borderRadius: {
                                '4xl': '2rem',
                        },
                },
        },
        plugins: [],
}
