/**
 * Theme configuration for Buena Property Management System
 * Provides a consistent design system for the application
 */

export const theme = {
  colors: {
    primary: {
      50: 'rgb(250 250 250)',
      100: 'rgb(244 244 245)',
      200: 'rgb(228 228 231)',
      300: 'rgb(212 212 216)',
      400: 'rgb(161 161 170)',
      500: 'rgb(113 113 122)',
      600: 'rgb(82 82 91)',
      700: 'rgb(63 63 70)',
      800: 'rgb(39 39 42)',
      900: 'rgb(24 24 27)',
      950: 'rgb(9 9 11)',
    },
    secondary: {
      50: 'rgb(250 250 249)',
      100: 'rgb(245 245 244)',
      200: 'rgb(231 229 228)',
      300: 'rgb(214 211 209)',
      400: 'rgb(168 162 158)',
      500: 'rgb(120 113 108)',
      600: 'rgb(87 83 78)',
      700: 'rgb(68 64 60)',
      800: 'rgb(41 37 36)',
      900: 'rgb(28 25 23)',
      950: 'rgb(12 10 9)',
    },
    accent: {
      50: 'rgb(253 253 248)',
      100: 'rgb(254 248 232)',
      200: 'rgb(254 240 199)',
      300: 'rgb(253 230 138)',
      400: 'rgb(252 211 77)',
      500: 'rgb(245 158 11)',
      600: 'rgb(217 119 6)',
      700: 'rgb(180 83 9)',
      800: 'rgb(146 64 14)',
      900: 'rgb(120 53 15)',
      950: 'rgb(69 26 3)',
    },
    success: {
      light: 'rgb(168 230 163)',
      DEFAULT: 'rgb(74 222 128)',
      dark: 'rgb(22 101 52)',
    },
    warning: {
      light: 'rgb(252 211 77)',
      DEFAULT: 'rgb(245 158 11)',
      dark: 'rgb(146 64 14)',
    },
    error: {
      light: 'rgb(252 165 165)',
      DEFAULT: 'rgb(220 38 38)',
      dark: 'rgb(69 10 10)',
    },
    info: {
      light: 'rgb(203 213 225)',
      DEFAULT: 'rgb(100 116 139)',
      dark: 'rgb(15 23 42)',
    },
  },
  typography: {
    fonts: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, Inconsolata, "Fira Code", "Courier New", monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
} as const

/**
 * Semantic color tokens for consistent UI elements
 */
export const semanticColors = {
  text: {
    primary: theme.colors.primary[950],
    secondary: theme.colors.primary[700],
    tertiary: theme.colors.primary[500],
    muted: theme.colors.primary[400],
    inverse: 'rgb(255 255 255)',
  },
  background: {
    primary: 'rgb(255 255 255)',
    secondary: theme.colors.secondary[50],
    tertiary: theme.colors.secondary[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  border: {
    DEFAULT: theme.colors.secondary[200],
    light: theme.colors.secondary[100],
    dark: theme.colors.secondary[300],
  },
  button: {
    primary: {
      bg: theme.colors.primary[900],
      hover: theme.colors.primary[950],
      active: 'rgb(0 0 0)',
      text: 'rgb(255 255 255)',
    },
    secondary: {
      bg: theme.colors.secondary[100],
      hover: theme.colors.secondary[200],
      active: theme.colors.secondary[300],
      text: theme.colors.secondary[900],
    },
    outline: {
      bg: 'transparent',
      hover: theme.colors.primary[50],
      active: theme.colors.primary[100],
      text: theme.colors.primary[900],
      border: theme.colors.primary[300],
    },
    ghost: {
      bg: 'transparent',
      hover: theme.colors.primary[100],
      active: theme.colors.primary[200],
      text: theme.colors.primary[700],
    },
    destructive: {
      bg: theme.colors.error.DEFAULT,
      hover: theme.colors.error.dark,
      active: theme.colors.error.dark,
      text: 'rgb(255 255 255)',
    },
  },
  input: {
    bg: 'rgb(255 255 255)',
    border: theme.colors.primary[300],
    borderFocus: theme.colors.primary[900],
    text: theme.colors.primary[900],
    placeholder: theme.colors.primary[400],
    error: theme.colors.error.DEFAULT,
    disabled: theme.colors.primary[100],
  },
  card: {
    bg: 'rgb(255 255 255)',
    border: theme.colors.primary[200],
    shadow: theme.shadows.sm,
  },
  badge: {
    primary: {
      bg: theme.colors.primary[100],
      text: theme.colors.primary[900],
    },
    secondary: {
      bg: theme.colors.secondary[100],
      text: theme.colors.secondary[900],
    },
    success: {
      bg: 'rgb(220 252 231)',
      text: 'rgb(22 101 52)',
    },
    warning: {
      bg: 'rgb(254 243 199)',
      text: 'rgb(146 64 14)',
    },
    error: {
      bg: 'rgb(254 226 226)',
      text: 'rgb(153 27 27)',
    },
  },
} as const

/**
 * Typography presets for consistent text styling
 */
export const typography = {
  heading1: {
    fontSize: theme.typography.sizes['5xl'],
    fontWeight: theme.typography.weights.bold,
    lineHeight: theme.typography.lineHeights.tight,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  heading2: {
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.semibold,
    lineHeight: theme.typography.lineHeights.tight,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  heading3: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.semibold,
    lineHeight: theme.typography.lineHeights.snug,
  },
  heading4: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.semibold,
    lineHeight: theme.typography.lineHeights.snug,
  },
  heading5: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.medium,
    lineHeight: theme.typography.lineHeights.normal,
  },
  heading6: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    lineHeight: theme.typography.lineHeights.normal,
  },
  bodyLarge: {
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  body: {
    fontSize: theme.typography.sizes.base,
    lineHeight: theme.typography.lineHeights.normal,
  },
  bodySmall: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.normal,
  },
  labelLarge: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  labelSmall: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: theme.typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.normal,
    color: semanticColors.text.tertiary,
  },
  code: {
    fontFamily: theme.typography.fonts.mono,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.normal,
  },
} as const

/**
 * Animation presets
 */
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

export default theme