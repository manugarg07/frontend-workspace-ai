/**
 * CodeStrategists Shared Iconography & Design System Constants
 * 
 * Consistent rules for all icons, SVGs, and visual marks across the platform.
 */

export const ICON_SYSTEM = {
  strokeWidth: {
    thin: 1.5,
    normal: 2,
    thick: 2.5,
  },
  cornerRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },
  grid: {
    size: 24,
    padding: 2,
  },
  sizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  animation: {
    hover: "transition-all duration-200 ease-out hover:scale-105 active:scale-95",
    pulse: "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
  }
} as const;
