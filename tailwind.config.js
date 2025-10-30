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
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
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
        'xs': {'max': '480px'},
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
