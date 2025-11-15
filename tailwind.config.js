/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff6e8',
          100: '#ffecd1',
          200: '#ffd8a3',
          300: '#ffc374',
          400: '#ffad46',
          500: '#ff9102', // couleur principale
          600: '#e67f00',
          700: '#b36200',
          800: '#7f4600',
          900: '#4c2900',
          950: '#261400',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          500: '#22c55e',
        },
        warning: {
          500: '#eab308',
        },
        error: {
          500: '#ef4444',
        },
        info: {
          500: '#3b82f6'
        }
      },
      screens: {
        'xs': { 'max': '480px' },
      },
    },
  },
  plugins: [],
  // Ensure these classes are generated
  safelist: [
    'bg-primary-500',
    'text-primary-500',
    'border-primary-500',
    'ring-primary-500',
    'focus:ring-primary-500',
    'focus:border-primary-500',
    'hover:bg-primary-600',
    'bg-success-500',
    'text-success-500',
    'bg-warning-500',
    'text-warning-500',
    'bg-error-500',
    'text-error-500',
    'text-primary-200'
  ]
}
