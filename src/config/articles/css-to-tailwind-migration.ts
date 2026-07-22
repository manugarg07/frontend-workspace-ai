export const cssToTailwindMigration = {
  id: 'css-to-tailwind-migration',
  slug: 'css-to-tailwind-migration',
  title: 'CSS to Tailwind CSS Migration: A Practical Refactoring Guide',
  subtitle: 'How to transition stylesheets into clean, utility-first markup configurations.',
  description: 'A complete developer guide to migrating from CSS to Tailwind CSS. Learn spacing scales, layout mappings, breakpoint systems, custom configurations, and best practices for refactoring legacy styles.',
  category: 'Development',
  author: 'Manu Garg',
  publishedDate: '2026-07-20',
  updatedDate: '2026-07-22',
  readingTime: '9 min read',
  keywords: ['css to tailwind', 'convert css to tailwind', 'utility-first css', 'tailwind migration', 'css refactoring', 'responsive breakpoints'],
  relatedTools: ['css-to-tailwind', 'tailwind-grid-generator', 'glassmorphism-generator'],
  relatedArticles: ['html-to-jsx-guide', 'react-productivity-toolkit'],
  content: `# CSS to Tailwind CSS Migration: A Practical Refactoring Guide

Cascading Stylesheets (CSS) have long been the backbone of web layout and styling. However, as applications grow, maintaining monolithic CSS stylesheets can introduce challenges: unused declarations accumulate, naming conflicts arise, and managing responsive breakpoints requires constant context-switching. 

Tailwind CSS addresses these challenges by using a utility-first styling model. Rather than writing custom selectors in external stylesheets, developers apply styling properties using predefined, inline utility classes directly in the markup.

Transitioning legacy styling to Tailwind requires mapping standard CSS properties (margins, colors, font weights, grids) to equivalent utility classes. This guide provides a practical blueprint for refactoring CSS projects to Tailwind CSS.

---

## 1. The Utility-First Mentality: What Changes?

In traditional CSS, you write class selectors to group styling rules:
\`\`\`css
/* Legacy CSS Selector */
.feature-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
\`\`\`
You then apply that single class selector name in your HTML structure:
\`\`\`html
<div class="feature-card">...</div>
\`\`\`

With Tailwind CSS, you remove the selector block and apply equivalent classes directly:
\`\`\`html
<!-- Tailwind Utility classes -->
<div class="flex flex-col p-6 bg-white border border-slate-200 rounded-xl shadow-md">...</div>
\`\`\`

This approach helps prevent stylesheet bloat: your styling classes are reused directly, and the final production CSS bundle size remains compact.

---

## 2. Property Mapping Reference

Migrating styles requires translating CSS declarations into Tailwind equivalents.

### A. Spacing Scale (Margins and Padding)
Tailwind maps pixel spacing to a proportional scale where **1 unit equals 0.25rem (4px)**:
- \`padding: 4px;\` $\\rightarrow$ \`p-1\`
- \`padding: 16px;\` $\\rightarrow$ \`p-4\`
- \`margin-top: 24px;\` $\\rightarrow$ \`mt-6\`
- \`margin-left: auto; margin-right: auto;\` $\\rightarrow$ \`mx-auto\`

### B. Display and Layout (Flexbox & Grid)
Flexbox and Grid layout rules map directly to Tailwind properties:
- \`display: flex;\` $\\rightarrow$ \`flex\`
- \`flex-direction: column;\` $\rightarrow$ \`flex-col\`
- \`justify-content: center;\` $\rightarrow$ \`justify-center\`
- \`align-items: center;\` $\rightarrow$ \`items-center\`
- \`display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;\` $\rightarrow$ \`grid grid-cols-3 gap-4\`

### C. Typography
- \`font-size: 14px;\` $\\rightarrow$ \`text-sm\`
- \`font-weight: 700;\` $\rightarrow$ \`font-bold\`
- \`line-height: 1.5;\` $\rightarrow$ \`leading-relaxed\`
- \`text-align: center;\` $\rightarrow$ \`text-center\`

---

## 3. Responsive Breakpoints

Traditional stylesheets use media queries to manage responsive layouts:
\`\`\`css
/* CSS Media Query */
.card-grid {
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

In Tailwind, you apply responsive breakpoint prefixes inline (e.g. \`sm:\`, \`md:\`, \`lg:\`, \`xl:\`). By default, Tailwind uses mobile-first styling, meaning unprefixed classes apply to mobile viewports, and breakpoint prefixes apply as the screen width increases:
\`\`\`html
<!-- Tailwind Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-3">...</div>
\`\`\`

---

## 4. Common Migration Pitfalls

### A. Arbitrary Colors and Sizing
If your project uses specific design parameters (e.g. \`background-color: #3b28b4;\` or \`width: 283px;\`) that do not match Tailwind\'s default colors or spacing scales, you can write arbitrary values inside brackets:
- \`background-color: #3b28b4;\` $\\rightarrow$ \`bg-[#3b28b4]\`
- \`width: 283px;\` $\\rightarrow$ \`w-[283px]\`

For values used frequently throughout your project, define them in your theme config (\`tailwind.config.js\`) instead of using arbitrary brackets.

### B. CSS Pseudo-Classes
Pseudo-classes (like \`hover:\` or \`focus:\`) must be appended inline:
- \`color: blue; hover: color: red;\` $\\rightarrow$ \`text-blue-500 hover:text-red-500\`

---

## 5. Developer Best Practices

1. **Avoid Style Bloat**: When refactoring, clean up legacy CSS.
2. **Leverage Theme Configs**: Add your custom design tokens (colors, font families, base margins) to the \`theme\` section of your configuration file.
3. **Use the @apply Directive Sparingly**: You can use \`@apply\` in CSS files to combine Tailwind utility classes under custom class selectors. However, overusing this can re-introduce the maintenance challenges of custom stylesheets.
4. **Utilize Conversion Tools**: Use local converters (like the CSS to Tailwind tool) to format legacy selectors into inline class lists.

---

## 6. Frequently Asked Questions

### How does the CSS to Tailwind translation work?
The parser reads your CSS rules and matches them against Tailwind\'s core class list. Any properties that don\'t match default scales are translated using arbitrary bracket syntax (e.g. padding-[17px]).

### Is my CSS uploaded to a server?
No. All translation logic executes locally in your browser memory, keeping your code and design styles private.

### Can Tailwind run alongside traditional CSS?
Yes. You can import Tailwind utilities at the top of your stylesheet and keep legacy selector classes in the same project, allowing for an incremental migration.

### What is arbitrary syntax in Tailwind?
Arbitrary syntax allows you to pass custom values directly to utility classes using square brackets (e.g. w-[342px] or text-[#123456]).

### How are hover states handled?
Add the hover: prefix to utility classes to apply styles on mouse hover (e.g. hover:bg-blue-600).

### Does Tailwind increase page build size?
No. Production builds run a purging process that scans your source code and keeps only the classes actually used, producing a compact final stylesheet.

### Can I convert media queries with custom widths?
Yes. For standard breakpoints, use prefixes like md: or lg:. For custom queries, define them in the tailwind.config.js theme settings.

### What is the default spacing unit in Tailwind?
The default spacing unit is 4px (0.25rem). A class like p-4 represents 16px of padding on all sides.
`,
  tips: [
    'Use the mobile-first approach: write base utilities for mobile viewports, then add prefixes like md: or lg: for larger screens.',
    'Extend your tailwind.config.js settings to declare brand colors, avoiding the need for arbitrary brackets.',
    'Clean up legacy CSS files as you convert rules to inline utilities to reduce file size.'
  ],
  pitfalls: [
    'Overusing the @apply directive in stylesheets, which can re-introduce complex styling inheritance issues.',
    'Pasting nested SCSS selector structures directly into CSS converters without expanding them first.'
  ]
}
