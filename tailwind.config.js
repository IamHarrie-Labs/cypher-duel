export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: { '2xl': '1400px' }
		},
		extend: {
			fontFamily: {
				sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
				display: ['Space Grotesk', 'system-ui', 'sans-serif'],
				sketch: ['Caveat', 'cursive'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Neo brutalism palette
				lime: '#CCFF00',
				'lime-dim': '#99CC00',
				neon: '#00FFAA',
				brutal: {
					black: '#0A0A0A',
					white: '#F5F5F0',
					red: '#FF3B3B',
					yellow: '#FFE400',
					blue: '#3B82FF',
					purple: '#9B59FF',
				},
				// Legacy arena tokens (keep for compat)
				arena: {
					lime: 'hsl(var(--arena-lime))',
					'lime-dim': 'hsl(var(--arena-lime-dim))',
					dark: 'hsl(var(--arena-dark))',
					surface: 'hsl(var(--arena-surface))',
					'surface-hover': 'hsl(var(--arena-surface-hover))',
					amber: 'hsl(var(--arena-amber))',
					red: 'hsl(var(--arena-red))',
					blue: 'hsl(var(--arena-blue))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'brutal': '4px 4px 0px #0A0A0A',
				'brutal-lime': '4px 4px 0px #CCFF00',
				'brutal-red': '4px 4px 0px #FF3B3B',
				'brutal-yellow': '4px 4px 0px #FFE400',
				'brutal-blue': '4px 4px 0px #3B82FF',
				'brutal-sm': '2px 2px 0px #0A0A0A',
				'brutal-lg': '6px 6px 0px #0A0A0A',
				'brutal-lime-lg': '6px 6px 0px #CCFF00',
				'brutal-white': '4px 4px 0px #F5F5F0',
				'brutal-white-sm': '2px 2px 0px rgba(245,245,240,0.3)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'brutal-shake': {
					'0%, 100%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(2px, -2px)' },
					'60%': { transform: 'translate(-1px, 1px)' },
					'80%': { transform: 'translate(1px, -1px)' },
				},
				'brutal-press': {
					'0%': { transform: 'translate(0,0)', boxShadow: '4px 4px 0px #CCFF00' },
					'100%': { transform: 'translate(4px,4px)', boxShadow: '0px 0px 0px #CCFF00' },
				},
				'ticker-l': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' },
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'glitch': {
					'0%, 100%': { clipPath: 'inset(0 0 100% 0)', opacity: '1' },
					'25%': { clipPath: 'inset(10% 0 80% 0)', opacity: '0.8' },
					'50%': { clipPath: 'inset(50% 0 30% 0)', opacity: '0.9' },
					'75%': { clipPath: 'inset(80% 0 10% 0)', opacity: '0.7' },
				},
				'count-down': {
					from: { strokeDashoffset: '0' },
					to: { strokeDashoffset: '283' },
				},
				'card-flip': {
					'0%': { transform: 'rotateY(0deg)' },
					'50%': { transform: 'rotateY(90deg)' },
					'100%': { transform: 'rotateY(0deg)' },
				},
				'price-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'brutal-shake': 'brutal-shake 0.3s ease-in-out',
				'ticker-l': 'ticker-l 30s linear infinite',
				'slide-up': 'slide-up 0.4s ease-out',
				'price-pulse': 'price-pulse 1s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
