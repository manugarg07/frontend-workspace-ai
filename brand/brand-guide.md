# CodeStrategists — Brand Guidelines

Welcome to the visual identity and brand rules for CodeStrategists. These guidelines ensure our brand remains consistent, professional, premium, and trustworthy across all digital surfaces.

---

## 1. Brand Personality & Tone

We design tools and write content for some of the most detail-oriented users in the world: frontend engineers. Our branding must feel:
*   **Technical & Precise**: No fluff. Clear geometry, clean lines.
*   **Premium & Confident**: Minimal styling with deep attention to pixel-level details.
*   **Reliable & Open**: Solid shapes, clear open-source representation, fast performance.

---

## 2. Logo System

The CodeStrategists logo is a refined geometric construct named **The Monoliths & Diamond**. It consists of two vertical parallel pillars of unequal heights with slanted tops, and a floating diamond beacon directly above the shorter pillar, representing structural scale, systems engineering, precision, and strategic direction.

### Logo Geometry
*   **Grid Base**: Designed on a $100\times100$ pixel vector viewport.
*   **Left Pillar**: Base width $18$, height $48$ (from $y=78$ to $y=30$), top edge sheared at a $45^\circ$ angle (from $y=48$ on the left to $y=30$ on the right).
    *   Path coordinate: `M 25 78 L 25 48 L 43 30 L 43 78 Z`
*   **Right Pillar**: Base width $18$, height $66$ (from $y=78$ to $y=12$), top edge sheared at a $45^\circ$ angle (from $y=30$ on the left to $y=12$ on the right).
    *   Path coordinate: `M 57 78 L 57 30 L 75 12 L 75 78 Z`
*   **Parallel Gap**: A vertical channel of exactly $14$ units of whitespace separates the two pillars.
*   **Floating Diamond**: A $45^\circ$ rotated square (diamond) of diagonal size $18$ floating above the left pillar. The top vertex aligns to $y=12$ (matching the tallest pillar peak), and the bottom vertex aligns to $y=30$ (matching the left pillar top-right corner), creating a parallel diagonal channel.
    *   Path coordinate: `M 34 12 L 43 21 L 34 30 L 25 21 Z`
*   **Precise Path**: `d="M 25 78 L 25 48 L 43 30 L 43 78 Z M 57 78 L 57 30 L 75 12 L 75 78 Z M 34 12 L 43 21 L 34 30 L 25 21 Z"`

### Logo Variations
*   **Primary Logo (`logo.svg`)**: Used on light backgrounds. Features the brand obsidian pillars with the blue diamond and paired typography.
*   **Dark Logo (`logo-dark.svg`)**: Used on dark backgrounds. Features the white pillars with the light blue diamond.
*   **Vertical Logo (`logo-vertical.svg` / `logo-vertical-dark.svg`)**: Centered Monoliths and Diamond mark placed directly above the wordmark.
*   **Icon Only (`logo-icon.svg`)**: Standalone brand mark. Perfect for favicons, headers, and profile avatars.
*   **Monochrome (`logo-monochrome.svg`)**: Pure black logo. Used for high-contrast print, docs, or embossing.
*   **Outline (`logo-outline.svg`)**: Line-art version using CSS `currentColor` stroke.

### Clear Space & Scale
*   **Clear Space**: Always maintain a clear margin of at least 50% of the logo mark width around the entire logotype.
*   **Minimum Size**:
    *   Horizontal Logotype: Minimum width of `120px` in digital interfaces.
    *   Vertical Logotype: Minimum width of `80px` in digital interfaces.
    *   Logo Icon: Minimum width of `16px` (e.g., standard browser tab favicon).

### Incorrect Usage (Do Not Do)
*   ❌ Do not stretch, distort, or shear the logo mark or wordmark.
*   ❌ Do not change the colors of the wordmark to unapproved values.
*   ❌ Do not rotate the monogram mark.
*   ❌ Do not add dropshadows directly to the logo SVG lines.

---

## 3. Color System

Our color palette is built on a 3-tier structure: Brand base colors, Semantic indicators, and UI components. All colors are defined as HSL custom properties inside `index.css`.

### Brand Base Colors
*   **Primary Obsidian**: `hsl(224 25% 4%)` (Light Foreground) / `hsl(224 25% 4%)` (Dark Background)
*   **Accent Slate**: `hsl(220 10% 45%)` (Light Wordmark) / `hsl(217.9 10.6% 64.9%)` (Dark Wordmark)
*   **Pure White**: `hsl(0 0% 100%)` (Dark Foreground / Light Background)

### UI Token Variables
| Custom Property | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--background` | `hsl(220 30% 99%)` | `hsl(224 25% 4%)` | Global screen canvas |
| `--foreground` | `hsl(224 60% 8%)` | `hsl(210 20% 98%)` | Primary text and labels |
| `--card` | `hsl(0 0% 100%)` | `hsl(224 25% 8%)` | Surface panel backgrounds |
| `--border` | `hsl(220 15% 90%)` | `hsl(224 15% 12%)` | Sleek divider lines and outlines |
| `--muted-foreground` | `hsl(220 10% 45%)` | `hsl(217.9 10.6% 64.9%)` | Secondary meta-text and captions |

---

## 4. Typography

Typography is a cornerstone of our technical brand. We prefer open-source fonts loaded via Google Fonts.

*   **Logotype & Headings**: **Outfit** — A modern, geometric sans-serif with a warm, technical character.
*   **Body & UI Text**: **Plus Jakarta Sans** — A highly readable, modern font optimized for dashboards and panels.
*   **Code Blocks & Monospace UI**: **JetBrains Mono** — A developer-focused monospace font with high legibility and clear character differentiation.

---

## 5. Design Tokens

### Spacing Scale
Built on a strict **4px grid** to guarantee perfect layout balance:
*   `0.5` = `2px`
*   `1` = `4px`
*   `2` = `8px`
*   `3` = `12px`
*   `4` = `16px`
*   `6` = `24px`
*   `8` = `32px`

### Border Radius Scale
*   `sm`: `calc(var(--radius) - 4px)` = `8px` (Inputs, buttons)
*   `md`: `calc(var(--radius) - 2px)` = `10px` (Inner cards, popovers)
*   `lg`: `var(--radius)` = `12px` (Outer containers, dashboard cards)
*   `xl`: `16px` (Large modal panels)
*   `pill`: `9999px` (Status badges, toggle pills)

### Drop Shadows
*   **Soft premium shadows** are used to create depth for panels:
    *   Light: `0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)`
    *   Dark: `0 10px 40px -15px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(255, 255, 255, 0.01)`
