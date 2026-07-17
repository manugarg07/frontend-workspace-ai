import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles,
  Code,
  Share2,
  Eye,
  Cpu,
  ArrowLeftRight,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ResultPanel } from '@/components/ui/ResultPanel'
import { ToolLayout } from '@/components/common/ToolLayout'
import type { OptionTab } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined CSS Sample templates
const SAMPLES = {
  card: {
    title: 'Product Card CSS',
    data: `/* Card Container */
.product-card {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 20;
  width: 100%;
  max-width: 380px;
  padding: 24px;
  margin: 16px auto;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

/* Title typography */
.product-card h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  color: #1a1a1a;
  margin-bottom: 8px;
  text-transform: capitalize;
}

/* Banner image */
.card-banner {
  height: 200px;
  background-image: url('banner.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 8px;
}`
  },
  flexbox: {
    title: 'Flexbox Layout CSS',
    data: `.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.flex-item {
  flex: 1 1 0%;
  text-align: center;
  font-weight: 500;
  color: #4b5563;
}`
  },
  typography: {
    title: 'Text & Typography CSS',
    data: `.article-title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  color: #111827;
  text-align: center;
  margin-bottom: 12px;
  opacity: 0.9;
}`
  }
}

// Spacing Converter: Maps px/rem values to standard Tailwind or arbitrary brackets
function convertSpacingValue(val: string): string {
  const clean = val.trim().toLowerCase()
  if (clean === '0') return '0'
  if (clean === 'auto') return 'auto'
  
  // Try matching standard spacing px scales
  const pxMatch = clean.match(/^([\d.]+)\s*px$/)
  if (pxMatch) {
    const px = parseFloat(pxMatch[1])
    const mappings: { [key: number]: string } = {
      1: 'px', 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3', 
      14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 
      40: '10', 44: '11', 48: '12', 56: '14', 64: '16', 80: '20', 96: '24',
      112: '28', 128: '32', 144: '36', 160: '40', 176: '44', 192: '48',
      208: '52', 224: '56', 240: '60', 256: '64', 288: '72', 320: '80',
      384: '96'
    }
    if (mappings[px] !== undefined) return mappings[px]
  }

  // Try matching standard spacing rem scales
  const remMatch = clean.match(/^([\d.]+)\s*rem$/)
  if (remMatch) {
    const rem = parseFloat(remMatch[1])
    const mappings: { [key: number]: string } = {
      0.25: '1', 0.5: '2', 0.75: '3', 1: '4', 1.25: '5', 1.5: '6', 
      1.75: '7', 2: '8', 2.25: '9', 2.5: '10', 3: '12', 3.5: '14', 
      4: '16', 5: '20', 6: '24', 7: '28', 8: '32', 9: '36', 10: '40',
      11: '44', 12: '48', 13: '52', 14: '56', 15: '60', 16: '64',
      18: '72', 20: '80', 24: '96'
    }
    if (mappings[rem] !== undefined) return mappings[rem]
  }

  // Fallback to Tailwind arbitrary bracket value
  return `[${clean.replace(/\s+/g, '_')}]`
}

// Spacing shorthand split helper: e.g., '10px 20px' -> { top, right, bottom, left }
function splitSpacingShorthand(val: string): { top: string; right: string; bottom: string; left: string } {
  const parts = val.trim().split(/\s+/)
  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  }
  if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  }
  if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  }
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
}

// Hex/RGB/HSL Color mapping helper
function cleanColorVal(val: string): string {
  const clean = val.trim().toLowerCase()
  if (clean === 'white' || clean === '#ffffff' || clean === '#fff') return 'white'
  if (clean === 'black' || clean === '#000000' || clean === '#000') return 'black'
  if (clean === 'transparent') return 'transparent'
  // Return arbitrary color syntax
  return `[${clean.replace(/\s+/g, '')}]`
}

interface ConversionResult {
  success: boolean
  classes?: string[]
  reason?: string
}

// Master declaration translator
function convertDeclaration(prop: string, val: string): ConversionResult {
  const p = prop.trim().toLowerCase()
  const v = val.trim()
  const vLower = v.toLowerCase()

  switch (p) {
    // ------------------------------------------------
    // Layout
    // ------------------------------------------------
    case 'display': {
      const displays: { [key: string]: string } = {
        block: 'block',
        'inline-block': 'inline-block',
        inline: 'inline',
        flex: 'flex',
        'inline-flex': 'inline-flex',
        grid: 'grid',
        'inline-grid': 'inline-grid',
        none: 'hidden',
        hidden: 'hidden'
      }
      if (displays[vLower]) return { success: true, classes: [displays[vLower]] }
      return { success: false, reason: 'Unsupported display layout property value' }
    }
    case 'position': {
      if (['static', 'relative', 'absolute', 'fixed', 'sticky'].includes(vLower)) {
        return { success: true, classes: [vLower] }
      }
      return { success: false, reason: 'Unsupported position value' }
    }
    case 'z-index': {
      if (vLower === 'auto') return { success: true, classes: ['z-auto'] }
      const num = parseInt(v, 10)
      if (!isNaN(num)) {
        if ([0, 10, 20, 30, 40, 50].includes(num)) return { success: true, classes: [`z-${num}`] }
        return { success: true, classes: [`z-[${num}]`] }
      }
      return { success: false, reason: 'z-index must be numerical or auto' }
    }
    case 'top':
    case 'right':
    case 'bottom':
    case 'left': {
      const spacingVal = convertSpacingValue(v)
      return { success: true, classes: [`${p}-${spacingVal}`] }
    }

    // ------------------------------------------------
    // Spacing
    // ------------------------------------------------
    case 'margin': {
      const sh = splitSpacingShorthand(v)
      if (sh.top === sh.right && sh.top === sh.bottom && sh.top === sh.left) {
        return { success: true, classes: [`m-${convertSpacingValue(sh.top)}`] }
      }
      if (sh.top === sh.bottom && sh.right === sh.left) {
        return { success: true, classes: [
          `my-${convertSpacingValue(sh.top)}`,
          `mx-${convertSpacingValue(sh.right)}`
        ] }
      }
      return { success: true, classes: [
        `mt-${convertSpacingValue(sh.top)}`,
        `mr-${convertSpacingValue(sh.right)}`,
        `mb-${convertSpacingValue(sh.bottom)}`,
        `ml-${convertSpacingValue(sh.left)}`
      ] }
    }
    case 'margin-top': return { success: true, classes: [`mt-${convertSpacingValue(v)}`] }
    case 'margin-right': return { success: true, classes: [`mr-${convertSpacingValue(v)}`] }
    case 'margin-bottom': return { success: true, classes: [`mb-${convertSpacingValue(v)}`] }
    case 'margin-left': return { success: true, classes: [`ml-${convertSpacingValue(v)}`] }
    case 'margin-inline': return { success: true, classes: [`mx-${convertSpacingValue(v)}`] }
    case 'margin-block': return { success: true, classes: [`my-${convertSpacingValue(v)}`] }

    case 'padding': {
      const sh = splitSpacingShorthand(v)
      if (sh.top === sh.right && sh.top === sh.bottom && sh.top === sh.left) {
        return { success: true, classes: [`p-${convertSpacingValue(sh.top)}`] }
      }
      if (sh.top === sh.bottom && sh.right === sh.left) {
        return { success: true, classes: [
          `py-${convertSpacingValue(sh.top)}`,
          `px-${convertSpacingValue(sh.right)}`
        ] }
      }
      return { success: true, classes: [
        `pt-${convertSpacingValue(sh.top)}`,
        `pr-${convertSpacingValue(sh.right)}`,
        `pb-${convertSpacingValue(sh.bottom)}`,
        `pl-${convertSpacingValue(sh.left)}`
      ] }
    }
    case 'padding-top': return { success: true, classes: [`pt-${convertSpacingValue(v)}`] }
    case 'padding-right': return { success: true, classes: [`pr-${convertSpacingValue(v)}`] }
    case 'padding-bottom': return { success: true, classes: [`pb-${convertSpacingValue(v)}`] }
    case 'padding-left': return { success: true, classes: [`pl-${convertSpacingValue(v)}`] }
    case 'padding-inline': return { success: true, classes: [`px-${convertSpacingValue(v)}`] }
    case 'padding-block': return { success: true, classes: [`py-${convertSpacingValue(v)}`] }

    case 'gap': {
      const parts = v.trim().split(/\s+/)
      if (parts.length === 1) {
        return { success: true, classes: [`gap-${convertSpacingValue(parts[0])}`] }
      }
      return { success: true, classes: [
        `gap-y-${convertSpacingValue(parts[0])}`,
        `gap-x-${convertSpacingValue(parts[1])}`
      ] }
    }
    case 'row-gap': return { success: true, classes: [`gap-y-${convertSpacingValue(v)}`] }
    case 'column-gap': return { success: true, classes: [`gap-x-${convertSpacingValue(v)}`] }

    // ------------------------------------------------
    // Flexbox
    // ------------------------------------------------
    case 'flex-direction': {
      const dirs: { [key: string]: string } = {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        column: 'flex-col',
        'column-reverse': 'flex-col-reverse'
      }
      if (dirs[vLower]) return { success: true, classes: [dirs[vLower]] }
      return { success: false, reason: 'Invalid flex-direction layout structure' }
    }
    case 'flex-wrap': {
      const wraps: { [key: string]: string } = {
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
        nowrap: 'flex-nowrap'
      }
      if (wraps[vLower]) return { success: true, classes: [wraps[vLower]] }
      return { success: false, reason: 'Invalid flex-wrap property' }
    }
    case 'justify-content': {
      const justifies: { [key: string]: string } = {
        'flex-start': 'justify-start',
        start: 'justify-start',
        'flex-end': 'justify-end',
        end: 'justify-end',
        center: 'justify-center',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly'
      }
      if (justifies[vLower]) return { success: true, classes: [justifies[vLower]] }
      return { success: false, reason: 'Unsupported justify-content alignment' }
    }
    case 'align-items': {
      const aligns: { [key: string]: string } = {
        'flex-start': 'items-start',
        start: 'items-start',
        'flex-end': 'items-end',
        end: 'items-end',
        center: 'items-center',
        baseline: 'items-baseline',
        stretch: 'items-stretch'
      }
      if (aligns[vLower]) return { success: true, classes: [aligns[vLower]] }
      return { success: false, reason: 'Unsupported align-items alignment' }
    }
    case 'align-self': {
      const selfs: { [key: string]: string } = {
        auto: 'self-auto',
        'flex-start': 'self-start',
        start: 'self-start',
        'flex-end': 'self-end',
        end: 'self-end',
        center: 'self-center',
        stretch: 'self-stretch',
        baseline: 'self-baseline'
      }
      if (selfs[vLower]) return { success: true, classes: [selfs[vLower]] }
      return { success: false, reason: 'Unsupported align-self alignment' }
    }
    case 'flex': {
      const flexes: { [key: string]: string } = {
        '1 1 0%': 'flex-1',
        '1': 'flex-1',
        '1 1 auto': 'flex-auto',
        'auto': 'flex-auto',
        '0 1 auto': 'flex-initial',
        'initial': 'flex-initial',
        'none': 'flex-none',
        '0 0 auto': 'flex-none'
      }
      if (flexes[vLower]) return { success: true, classes: [flexes[vLower]] }
      return { success: true, classes: [`flex-[${vLower.replace(/\s+/g, '_')}]`] }
    }

    // ------------------------------------------------
    // Grid
    // ------------------------------------------------
    case 'grid-template-columns': {
      const repMatch = vLower.match(/^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/)
      if (repMatch) return { success: true, classes: [`grid-cols-${repMatch[1]}`] }
      return { success: true, classes: [`grid-cols-[${v.replace(/\s+/g, '_')}]`] }
    }
    case 'grid-template-rows': {
      const repMatch = vLower.match(/^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/)
      if (repMatch) return { success: true, classes: [`grid-rows-${repMatch[1]}`] }
      return { success: true, classes: [`grid-rows-[${v.replace(/\s+/g, '_')}]`] }
    }
    case 'place-items': {
      if (['center', 'start', 'end', 'stretch'].includes(vLower)) {
        return { success: true, classes: [`place-items-${vLower}`] }
      }
      return { success: false, reason: 'Unsupported place-items alignment' }
    }

    // ------------------------------------------------
    // Typography
    // ------------------------------------------------
    case 'font-size': {
      const sizes: { [key: string]: string } = {
        '12px': 'text-xs', '0.75rem': 'text-xs',
        '14px': 'text-sm', '0.875rem': 'text-sm',
        '16px': 'text-base', '1rem': 'text-base',
        '18px': 'text-lg', '1.125rem': 'text-lg',
        '20px': 'text-xl', '1.25rem': 'text-xl',
        '24px': 'text-2xl', '1.5rem': 'text-2xl',
        '30px': 'text-3xl', '1.875rem': 'text-3xl',
        '36px': 'text-4xl', '2.25rem': 'text-4xl',
        '48px': 'text-5xl', '3rem': 'text-5xl',
        '60px': 'text-6xl', '3.75rem': 'text-6xl',
        '72px': 'text-7xl', '4.5rem': 'text-7xl',
        '96px': 'text-8xl', '6rem': 'text-8xl'
      }
      if (sizes[vLower]) return { success: true, classes: [sizes[vLower]] }
      return { success: true, classes: [`text-[${vLower}]`] }
    }
    case 'font-weight': {
      const weights: { [key: string]: string } = {
        '100': 'font-thin', thin: 'font-thin',
        '200': 'font-extralight', extralight: 'font-extralight',
        '300': 'font-light', light: 'font-light',
        '400': 'font-normal', normal: 'font-normal', regular: 'font-normal',
        '500': 'font-medium', medium: 'font-medium',
        '600': 'font-semibold', semibold: 'font-semibold',
        '700': 'font-bold', bold: 'font-bold',
        '800': 'font-extrabold', extrabold: 'font-extrabold',
        '900': 'font-black', black: 'font-black'
      }
      if (weights[vLower]) return { success: true, classes: [weights[vLower]] }
      return { success: true, classes: [`font-[${vLower}]`] }
    }
    case 'line-height': {
      const leadings: { [key: string]: string } = {
        '1': 'leading-none',
        '1.25': 'leading-tight',
        '1.375': 'leading-snug',
        '1.5': 'leading-normal',
        '1.625': 'leading-relaxed',
        '2': 'leading-loose'
      }
      if (leadings[vLower]) return { success: true, classes: [leadings[vLower]] }
      return { success: true, classes: [`leading-[${vLower.replace(/\s+/g, '_')}]`] }
    }
    case 'text-align': {
      if (['left', 'center', 'right', 'justify', 'start', 'end'].includes(vLower)) {
        return { success: true, classes: [`text-${vLower}`] }
      }
      return { success: false, reason: 'Unsupported text-align value' }
    }
    case 'letter-spacing': {
      const trackings: { [key: string]: string } = {
        '-0.05em': 'tracking-tighter',
        '-0.025em': 'tracking-tight',
        '0': 'tracking-normal', normal: 'tracking-normal',
        '0.025em': 'tracking-wide',
        '0.05em': 'tracking-wider',
        '0.1em': 'tracking-widest'
      }
      if (trackings[vLower]) return { success: true, classes: [trackings[vLower]] }
      return { success: true, classes: [`tracking-[${vLower}]`] }
    }
    case 'text-transform': {
      if (['uppercase', 'lowercase', 'capitalize'].includes(vLower)) return { success: true, classes: [vLower] }
      if (vLower === 'none') return { success: true, classes: ['normal-case'] }
      return { success: false, reason: 'Unsupported text-transform value' }
    }

    // ------------------------------------------------
    // Sizing
    // ------------------------------------------------
    case 'width':
    case 'height':
    case 'min-width':
    case 'max-width':
    case 'min-height':
    case 'max-height': {
      const prefix = p === 'width' ? 'w' : p === 'height' ? 'h' : p
      if (vLower === '100%') return { success: true, classes: [`${prefix}-full`] }
      if (vLower === '100vw' && (p === 'width' || p === 'max-width' || p === 'min-width')) return { success: true, classes: [`${prefix}-screen`] }
      if (vLower === '100vh' && (p === 'height' || p === 'max-height' || p === 'min-height')) return { success: true, classes: [`${prefix}-screen`] }
      if (vLower === 'auto') return { success: true, classes: [`${prefix}-auto`] }
      if (vLower === 'min-content') return { success: true, classes: [`${prefix}-min`] }
      if (vLower === 'max-content') return { success: true, classes: [`${prefix}-max`] }
      if (vLower === 'fit-content') return { success: true, classes: [`${prefix}-fit`] }
      
      const val = convertSpacingValue(v)
      return { success: true, classes: [`${prefix}-${val}`] }
    }

    // ------------------------------------------------
    // Border
    // ------------------------------------------------
    case 'border-radius': {
      const radii: { [key: string]: string } = {
        '0': 'rounded-none', '0px': 'rounded-none',
        '2px': 'rounded-sm', '0.125rem': 'rounded-sm',
        '4px': 'rounded', '0.25rem': 'rounded',
        '6px': 'rounded-md', '0.375rem': 'rounded-md',
        '8px': 'rounded-lg', '0.5rem': 'rounded-lg',
        '12px': 'rounded-xl', '0.75rem': 'rounded-xl',
        '16px': 'rounded-2xl', '1rem': 'rounded-2xl',
        '24px': 'rounded-3xl', '1.5rem': 'rounded-3xl',
        '9999px': 'rounded-full', '50%': 'rounded-full'
      }
      if (radii[vLower]) return { success: true, classes: [radii[vLower]] }
      return { success: true, classes: [`rounded-[${vLower.replace(/\s+/g, '_')}]`] }
    }
    case 'border': {
      // Shorthand border: e.g. 1px solid #ccc; or 2px dashed rgb(0,0,0)
      const parts = v.trim().split(/\s+/)
      // Check if parts match size style color
      if (parts.length >= 1) {
        const classes: string[] = ['border']
        let hasWidth = false
        let hasColor = false
        
        for (const part of parts) {
          const partLower = part.toLowerCase()
          // Width matcher
          if (partLower.endsWith('px') || partLower.endsWith('rem') || partLower === '0') {
            const widthVal = partLower === '1px' ? '' : `-${convertSpacingValue(partLower)}`
            classes[0] = `border${widthVal}`
            hasWidth = true
          }
          // Style matcher
          else if (['dashed', 'dotted', 'double', 'none'].includes(partLower)) {
            classes.push(`border-${partLower}`)
          }
          // Color matcher
          else if (partLower.startsWith('#') || partLower.startsWith('rgb') || partLower.startsWith('hsl') || ['white', 'black', 'transparent'].includes(partLower)) {
            classes.push(`border-${cleanColorVal(part)}`)
            hasColor = true
          }
        }
        return { success: true, classes }
      }
      return { success: false, reason: 'Failed to split border shorthand configuration' }
    }
    case 'border-width': return { success: true, classes: [`border-${convertSpacingValue(v)}`] }
    case 'border-color': return { success: true, classes: [`border-${cleanColorVal(v)}`] }

    // ------------------------------------------------
    // Background
    // ------------------------------------------------
    case 'background-color': return { success: true, classes: [`bg-${cleanColorVal(v)}`] }
    case 'background-image': {
      if (vLower.startsWith('url(')) {
        return { success: true, classes: [`bg-[${vLower.replace(/\s+/g, '')}]`] }
      }
      if (vLower.includes('gradient')) {
        // Return arbitrary and flag a notice
        return { 
          success: true, 
          classes: [`bg-[${v.replace(/\s+/g, '_')}]`], 
          reason: 'Custom Gradient: Compiled to arbitrary bg-[...]. For clean code, consider Tailwind standard gradients (bg-gradient-to-r from-red-500 to-blue-500) instead.'
        }
      }
      return { success: false, reason: 'Unsupported background-image property type' }
    }
    case 'background-size': return { success: true, classes: [`bg-${vLower}`] }
    case 'background-position': return { success: true, classes: [`bg-${vLower.replace(/\s+/g, '-')}`] }

    // ------------------------------------------------
    // Effects
    // ------------------------------------------------
    case 'box-shadow': {
      const shadows: { [key: string]: string } = {
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)': 'shadow-sm',
        '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)': 'shadow',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)': 'shadow',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)': 'shadow-md',
        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)': 'shadow-md',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)': 'shadow-lg',
        '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)': 'shadow-lg',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)': 'shadow-xl',
        '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)': 'shadow-xl',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)': 'shadow-2xl',
        '0 25px 50px -12px rgba(0,0,0,0.25)': 'shadow-2xl',
        'inset 0 2px 4px 0 rgba(0,0,0,0.06)': 'shadow-inner',
        'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)': 'shadow-inner'
      }
      if (shadows[vLower]) return { success: true, classes: [shadows[vLower]] }
      return { success: true, classes: [`shadow-[${v.replace(/\s+/g, '_')}]`] }
    }
    case 'opacity': {
      const val = parseFloat(v)
      if (!isNaN(val)) {
        const pct = Math.round(val * 100)
        return { success: true, classes: [`opacity-${pct}`] }
      }
      return { success: false, reason: 'Opacity must be a decimal between 0 and 1' }
    }

    // ------------------------------------------------
    // Transforms
    // ------------------------------------------------
    case 'rotate': return { success: true, classes: [`rotate-[${v.replace(/\s+/g, '_')}]`] }
    case 'scale': return { success: true, classes: [`scale-[${v.replace(/\s+/g, '_')}]`] }
    case 'translate': return { success: true, classes: [`translate-[${v.replace(/\s+/g, '_')}]`] }
    case 'transform': {
      // Matches standard transforms like rotate(12deg) or scale(1.1)
      const matches: string[] = []
      const rotateM = vLower.match(/rotate\(([^)]+)\)/)
      const scaleM = vLower.match(/scale\(([^)]+)\)/)
      const translateM = vLower.match(/translate\(([^)]+)\)/)

      if (rotateM) matches.push(`rotate-[${rotateM[1].trim()}]`)
      if (scaleM) matches.push(`scale-[${scaleM[1].trim()}]`)
      if (translateM) {
        const split = translateM[1].split(',')
        if (split.length === 1) {
          matches.push(`translate-x-[${split[0].trim()}]`)
        } else {
          matches.push(`translate-x-[${split[0].trim()}]`, `translate-y-[${split[1].trim()}]`)
        }
      }

      if (matches.length > 0) return { success: true, classes: matches }
      return { success: true, classes: [`transform-[${v.replace(/\s+/g, '_')}]`] }
    }

    // ------------------------------------------------
    // Transitions
    // ------------------------------------------------
    case 'transition': {
      if (vLower === 'none') return { success: true, classes: ['transition-none'] }
      if (vLower === 'all') return { success: true, classes: ['transition-all'] }
      if (['colors', 'opacity', 'shadow', 'transform'].includes(vLower)) return { success: true, classes: [`transition-${vLower}`] }
      return { success: true, classes: [`transition-[${vLower.replace(/\s+/g, '_')}]`] }
    }
    case 'transition-duration': {
      const match = vLower.match(/^([\d.]+)\s*(ms|s)$/)
      if (match) {
        const val = parseFloat(match[1])
        const unit = match[2]
        const ms = unit === 's' ? val * 1000 : val
        return { success: true, classes: [`duration-${ms}`] }
      }
      return { success: true, classes: [`duration-[${vLower}]`] }
    }
    case 'transition-timing-function': {
      const timingMap: { [key: string]: string } = {
        linear: 'ease-linear',
        in: 'ease-in',
        out: 'ease-out',
        'in-out': 'ease-in-out',
        'ease-in-out': 'ease-in-out',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out'
      }
      if (timingMap[vLower]) return { success: true, classes: [timingMap[vLower]] }
      return { success: true, classes: [`ease-[${vLower.replace(/\s+/g, '_')}]`] }
    }

    default:
      return { success: false, reason: `Unrecognized CSS property name` }
  }
}

export function CSSToTailwindConverterPro() {
  const { toast } = useToast()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Options Configurations
  const [version, setVersion] = useState<'v3' | 'v4'>('v4')
  const [format, setFormat] = useState<'className' | 'apply' | 'classes'>('className')

  // Stats Metrics
  const [propertiesStats, setPropertiesStats] = useState({
    total: 0,
    converted: 0,
    unsupported: 0,
    details: [] as { prop: string; val: string; status: 'success' | 'warning' | 'error'; reason?: string }[]
  })

  // Settings Panel active Tab
  const [activeConfigTab, setActiveConfigTab] = useState<'options' | 'ai' | 'version' | 'help'>('options')

  // Code Parser & Translation Loop
  const handleConvert = useCallback((customInput = inputVal) => {
    if (!customInput.trim()) {
      setOutputVal('')
      setValidationStatus(null)
      setValidationMessage('')
      setProcessingTime(null)
      setPropertiesStats({ total: 0, converted: 0, unsupported: 0, details: [] })
      return
    }

    setIsProcessing(true)
    const startTime = performance.now()

    try {
      // 1. Remove comments
      const cleanCss = customInput.replace(/\/\*[\s\S]*?\*\//g, '')

      // 2. Normalize raw properties lists (e.g. padding: 10px; display: flex;)
      const hasBraces = cleanCss.includes('{')
      const normalizedCss = hasBraces ? cleanCss : `.custom-style { ${cleanCss} }`

      // 3. Match selector blocks
      const blockRegex = /([^{]+)\{([^}]+)\}/g
      let match
      const compiledBlocks: string[] = []
      const detailsList: typeof propertiesStats.details = []

      let totalProps = 0
      let convertedProps = 0
      let unsupportedProps = 0

      while ((match = blockRegex.exec(normalizedCss)) !== null) {
        const selector = match[1].trim()
        const declarationsBlock = match[2].trim()

        // Split individual declarations by semicolon, ignoring inside parens/urls
        const declarations = declarationsBlock.split(/;(?![^(]*\))/g).map(d => d.trim()).filter(Boolean)
        const convertedClasses: string[] = []
        const unsupportedRules: string[] = []

        for (const decl of declarations) {
          const colonIndex = decl.indexOf(':')
          if (colonIndex === -1) continue

          const prop = decl.slice(0, colonIndex).trim()
          const val = decl.slice(colonIndex + 1).trim()
          totalProps++

          const result = convertDeclaration(prop, val)
          if (result.success && result.classes) {
            convertedClasses.push(...result.classes)
            convertedProps++
            
            detailsList.push({
              prop,
              val,
              status: result.reason ? 'warning' : 'success',
              reason: result.reason
            })
          } else {
            unsupportedRules.push(`${prop}: ${val}`)
            unsupportedProps++
            
            detailsList.push({
              prop,
              val,
              status: 'error',
              reason: result.reason || 'Shorthand or complex CSS structure'
            })
          }
        }

        // Reconstruct code block based on output format choice
        if (hasBraces) {
          if (format === 'className') {
            const classString = convertedClasses.join(' ')
            compiledBlocks.push(`// ${selector}\nclassName="${classString}"`)
          } else if (format === 'apply') {
            const classString = convertedClasses.join(' ')
            const applyBlock = `.custom-apply {\n  @apply ${classString};\n}`
            compiledBlocks.push(`/* ${selector} */\n${applyBlock}`)
          } else {
            compiledBlocks.push(`/* ${selector} */\n${convertedClasses.join(' ')}`)
          }

          if (unsupportedRules.length > 0) {
            compiledBlocks[compiledBlocks.length - 1] += `\n\n/* Unsupported rules kept for custom stylesheet:\n${unsupportedRules.map(r => `  ${r};`).join('\n')}\n*/`
          }
          compiledBlocks.push('\n')
        } else {
          // Just output class lists
          if (format === 'className') {
            compiledBlocks.push(`className="${convertedClasses.join(' ')}"`)
          } else if (format === 'apply') {
            compiledBlocks.push(`@apply ${convertedClasses.join(' ')};`)
          } else {
            compiledBlocks.push(convertedClasses.join(' '))
          }
        }
      }

      setOutputVal(compiledBlocks.join('\n').trim())
      setPropertiesStats({
        total: totalProps,
        converted: convertedProps,
        unsupported: unsupportedProps,
        details: detailsList
      })

      if (unsupportedProps > 0) {
        setValidationStatus('warning')
        setValidationMessage(`Conversion completed: Mapped ${convertedProps} properties. We found ${unsupportedProps} rules that are best kept as custom CSS.`)
      } else {
        setValidationStatus('success')
        setValidationMessage(`Success: Mapped all ${convertedProps} CSS declarations into Tailwind classes!`)
      }
    } catch {
      setValidationStatus('warning')
      setValidationMessage('Error: Failed to parse stylesheet formatting. Best-effort classes will render.')
      setOutputVal(customInput)
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
      setIsProcessing(false)
    }
  }, [inputVal, format, version])

  // Debounced auto-converter trigger
  useEffect(() => {
    if (autoConvert) {
      const delay = setTimeout(() => {
        handleConvert()
      }, 250)
      return () => clearTimeout(delay)
    }
  }, [inputVal, autoConvert, handleConvert])

  // File Handlers
  const handleFileLoaded = (text: string, filename: string) => {
    setInputVal(text)
    toast(`Loaded: ${filename}`, 'success')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      handleFileLoaded(text, file.name)
    }
    reader.readAsText(file)
  }

  const handleDownload = () => {
    if (!outputVal) return
    const fileExt = format === 'apply' ? 'css' : format === 'className' ? 'jsx' : 'txt'
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tailwind-classes.${fileExt}`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded Tailwind output', 'success')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputVal(text)
      toast('Pasted from clipboard', 'success')
    } catch {
      toast('Clipboard permission blocked. Use Ctrl+V inside the editor.', 'error')
    }
  }

  const handleCopy = () => {
    const value = outputVal || inputVal
    if (!value) return
    navigator.clipboard.writeText(value)
    toast('Copied Tailwind classes to clipboard!', 'success')
  }

  const loadPreset = (key: string) => {
    setInputVal(SAMPLES[key as keyof typeof SAMPLES].data)
    toast(`Loaded preset: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
  }

  // Spacing options templates
  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  // Spacing line metrics
  const inputLineCount = useMemo(() => inputVal.split('\n').length, [inputVal])
  const statsSummary = useMemo(() => {
    const charCount = inputVal.length
    const wordCount = inputVal.trim() ? inputVal.trim().split(/\s+/).length : 0
    const byteSize = new Blob([inputVal]).size
    const sizeFormatted = byteSize > 1024
      ? `${(byteSize / 1024).toFixed(2)} KB`
      : `${byteSize} B`

    return { charCount, wordCount, sizeFormatted }
  }, [inputVal])

  // Options tabs
  const optionTabs: OptionTab[] = [
    {
      id: 'options',
      label: 'Compilation Options',
      icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Tailwind Class Code Style Format
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="codeFormat"
                  checked={format === 'className'}
                  onChange={() => setFormat('className')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>React <code>className="..."</code></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="codeFormat"
                  checked={format === 'apply'}
                  onChange={() => setFormat('apply')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>CSS <code>@apply ...;</code></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="codeFormat"
                  checked={format === 'classes'}
                  onChange={() => setFormat('classes')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>Class List string</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-normal">
              Select code layout style. React format prefixes with className bindings, CSS wraps declarations in apply blocks.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Execution Control
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={autoConvert}
                  onChange={(e) => setAutoConvert(e.target.checked)}
                  className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer"
                />
                <span>Auto-run compiler on changes</span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'version',
      label: 'Tailwind Engine Version',
      icon: <Cpu className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Compiler Compatibility Options</p>
          <p className="text-xs text-muted-foreground leading-normal">
            Choose whether to output Tailwind v4.0 or v3.0 syntax rules. Version 4.0 uses modern spacing and opacity syntax bindings.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
              <input
                type="radio"
                name="engineVersion"
                checked={version === 'v4'}
                onChange={() => setVersion('v4')}
                className="accent-primary cursor-pointer h-4 w-4"
              />
              <span>Tailwind v4.0 Engine</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
              <input
                type="radio"
                name="engineVersion"
                checked={version === 'v3'}
                onChange={() => setVersion('v3')}
                className="accent-primary cursor-pointer h-4 w-4"
              />
              <span>Tailwind v3.0 Engine</span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      label: 'AI Refactorings',
      icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
      badge: 'Pro',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <p className="font-heading text-sm font-bold text-foreground">AI Optimization & Cleanup</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            De-duplicate generated classes, suggest responsive variants using device media queries, merge redundant divs, and structure layouts.
          </p>
          <div className="flex gap-2 max-w-lg mt-2">
            <Input 
              placeholder="E.g., optimize layouts, clean up redundant margins" 
              disabled 
              className="h-9 cursor-not-allowed bg-secondary/20"
            />
            <Button size="sm" disabled className="cursor-not-allowed bg-primary/50 text-primary-foreground/50 font-semibold h-9 shrink-0">
              Run AI Optimizer
            </Button>
          </div>
        </div>
      )
    }
  ]

  // FAQs Accordion
  const faqItems = [
    {
      id: 'csstw-faq-1',
      title: 'How does the CSS to Tailwind Converter work?',
      content: (
        <span>
          The compiler parses standard selector blocks and declarations in your stylesheet. It examines each rule (such as layout, grid, spacing, and sizing parameters) and translates it to the nearest standard Tailwind CSS utility class. Properties that do not have direct equivalents are preserved inside arbitrary tags (e.g. <code>mt-[13px]</code>) or left as comments.
        </span>
      )
    },
    {
      id: 'csstw-faq-2',
      title: 'What spacing and color units are supported?',
      content: (
        <span>
          The converter parses <code>px</code> and <code>rem</code> dimensions and translates them to standard Tailwind spacing numbers. Values that fall outside standard sizes (e.g. <code>15px</code>) are compiled into arbitrary format: <code>[15px]</code>. Colors mapped in hex, HSL, or RGB syntax become custom Tailwind values: <code>bg-[#6d28d9]</code>.
        </span>
      )
    },
    {
      id: 'csstw-faq-3',
      title: 'What happens to properties that cannot be translated?',
      content: (
        <span>
          Tailwind CSS does not support highly complex declarations like complex webkit animations or nested filters. To ensure no data is lost, the converter keeps these rules, comments them, and adds descriptions showing why they were kept.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".css,.txt">
      <ToolLayout
        toolSlug="css-to-tailwind"
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".css,.txt"
            samples={presetsSamples}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLabel="Convert to Tailwind"
            onCopy={handleCopy}
            copyDisabled={!outputVal}
            onDownload={handleDownload}
            downloadDisabled={!outputVal}
            onClear={() => { setInputVal(''); setOutputVal(''); setValidationStatus(null); setValidationMessage(''); setPropertiesStats({ total: 0, converted: 0, unsupported: 0, details: [] }); }}
            clearDisabled={!inputVal && !outputVal}
          />
        }
        editorSection={
          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              {/* Input card */}
              <div className="lg:col-span-6 flex flex-col">
                <CodeEditorWrapper
                  language="css"
                  value={inputVal}
                  onChange={setInputVal}
                  placeholder="Paste standard CSS rule definitions here (e.g. .class { display: flex; padding: 12px; })"
                />
              </div>

              {/* Output card */}
              <div className="lg:col-span-6 flex flex-col">
                <ResultPanel
                  title="Tailwind CSS Output"
                  value={outputVal}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  validationStatus={validationStatus}
                  processingTime={processingTime}
                >
                  <CodeEditorWrapper
                    language="html"
                    value={outputVal}
                    readOnly={true}
                  />
                </ResultPanel>
              </div>
            </div>

            {/* Statistics Banner */}
            {propertiesStats.total > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Properties Read</div>
                  <div className="text-xl font-bold mt-1 text-foreground">{propertiesStats.total}</div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Successfully Converted</div>
                  <div className="text-xl font-bold mt-1 text-emerald-500">{propertiesStats.converted}</div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Custom/Unsupported Rules</div>
                  <div className="text-xl font-bold mt-1 text-amber-500">{propertiesStats.unsupported}</div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Conversion Accuracy</div>
                  <div className="text-xl font-bold mt-1 text-primary">
                    {propertiesStats.total > 0 ? `${Math.round((propertiesStats.converted / propertiesStats.total) * 100)}%` : '0%'}
                  </div>
                </div>
              </div>
            )}

            {/* Warning Alert Panel for Unsupported Rules */}
            {validationStatus === 'warning' && validationMessage && (
              <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 flex gap-3 text-left font-sans">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-500">Unsupported Rules Notice</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {validationMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        }
        optionTabs={optionTabs}
        faqs={faqItems}
        instructionsTitle="How to Use the CSS to Tailwind Converter"
        instructions={
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-none pl-0">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">1</span>
              <span>Paste your raw CSS classes or stylesheets in the left input panel. You can copy them directly from Chrome DevTools.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">2</span>
              <span>Choose your output layout style (HTML class, React className, or CSS apply) inside the options tab.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">3</span>
              <span>The compiler automatically evaluates margin units, grid specs, colors, and shadows into Tailwind utility equivalents in real-time.</span>
            </li>
          </ul>
        }
        benefits={[
          "Instant Conversion: Client-side compile engine matches properties in milliseconds.",
          "Arbitrary Value Mapping: Translates complex values using custom tailwind brackets so no styling details are dropped.",
          "Clear Diagnostics: Shows conversion statistics and highlights custom CSS rules clearly.",
          "Safe and Sandboxed: Processing is handled entirely in your local browser sandbox, keeping source sheets secure."
        ]}
      />
    </FileUpload>
  )
}
