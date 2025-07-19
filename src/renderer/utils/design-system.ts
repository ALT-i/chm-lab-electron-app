/**
 * Premium Design System for CHM Lab
 * Consistent colors, typography, spacing, and component styles
 */

export const designSystem = {
  // Color Palette - Premium Green & Neutral Theme
  colors: {
    primary: {
      50: '#f0f9f4',
      100: '#dcf4e4',
      200: '#bbe8cc',
      300: '#88d6a9',
      400: '#4cbb7f',
      500: '#22a05e', // Main brand green
      600: '#16844a',
      700: '#146b3d',
      800: '#145533',
      900: '#11472c',
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
    },
    accent: {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      orange: '#f97316',
      red: '#ef4444',
      yellow: '#eab308',
    },
    background: {
      light: '#ffffff',
      soft: '#f8fafc',
      muted: '#f1f5f9',
      dark: '#0f172a',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
      light: '#94a3b8',
      white: '#ffffff',
    },
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Poppins', 'Inter', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },

  // Spacing System (consistent spacing scale)
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  // Shadow System
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Component Styles
  components: {
    // Premium Card Style
    card: {
      base: 'bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300',
      hover: 'hover:shadow-xl hover:border-gray-200 hover:-translate-y-1',
      interactive:
        'cursor-pointer transform transition-all duration-200 hover:scale-105',
    },

    // Premium Button Styles
    button: {
      primary:
        'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-0',
      secondary:
        'bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-gray-200',
      ghost:
        'bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200',
      icon: 'p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200',
    },

    // Navigation Styles
    nav: {
      item: 'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 cursor-pointer',
      active: 'bg-green-100 text-green-700 font-medium',
    },

    // Form Elements
    input: {
      base: 'w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-200',
    },

    // Layout Containers
    container: {
      page: 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100',
      content: 'max-w-7xl mx-auto px-4 py-8',
      section: 'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
    },

    // Status Indicators
    badge: {
      success:
        'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
      warning:
        'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium',
      error:
        'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium',
      info: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium',
    },
  },
}

// Utility functions for design system
export const ds = designSystem

// Helper functions
export const getColor = (path: string) => {
  const keys = path.split('.')
  let value: any = designSystem.colors
  for (const key of keys) {
    value = value[key]
  }
  return value
}

export const getSpacing = (size: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[size]
}

export const getShadow = (size: keyof typeof designSystem.shadows) => {
  return designSystem.shadows[size]
}
