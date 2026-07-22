import type { ToolFAQ } from './tools.config'

export interface CollectionConfig {
  slug: string
  title: string
  seoTitle: string
  seoDescription: string
  description: string
  introduction: string
  keywords: string[]
  toolSlugs: string[] // List of tools in this collection
  faqs: ToolFAQ[]
}

export const COLLECTIONS_CONFIG: CollectionConfig[] = [
  {
    slug: 'json-tools',
    title: 'JSON Developer Tools',
    seoTitle: 'JSON Formatter, Validator, and Web Token Decoders - CodeStrategists',
    seoDescription: 'Access free client-side JSON formatters, syntax validators, and JWT decoders to debug payloads locally and securely.',
    description: 'Format, validate, and inspect JSON structures and token values.',
    introduction: 'JSON (JavaScript Object Notation) is the backbone of modern APIs and state management. However, dealing with compressed logs or debugging authentication payloads can be difficult without formatting utilities. Our JSON Developer Tools collection provides client-side formatters and validators to clean and analyze payloads instantly in browser memory. By executing all calculations locally, these utilities ensure credentials and private JSON structures remain secure.',
    keywords: ['json tools', 'pretty print json', 'format json online', 'jwt decoder local', 'json syntax validator'],
    toolSlugs: ['json-formatter', 'jwt-decoder'],
    faqs: [
      {
        question: 'Why should I use local JSON tools?',
        answer: 'Local tools process your payloads entirely inside your browser viewport. No data is sent over the network, keeping credentials, database logs, and tokens secure.'
      },
      {
        question: 'How do I format JSON containing comments?',
        answer: 'Standard JSON does not support comments. The formatter will identify comments as syntax issues, allowing you to format them back to standard JSON key-value pairs.'
      },
      {
        question: 'Does the formatter support minification?',
        answer: 'Yes. You can minify JSON with one click to remove all whitespace and compile it into a single line to reduce payload size.'
      }
    ]
  },
  {
    slug: 'react-tools',
    title: 'React & JSX Developer Tools',
    seoTitle: 'HTML to JSX and SVG to React Component Converters - CodeStrategists',
    seoDescription: 'Convert standard HTML and SVG vectors into React functional components. Clean syntax formatting, TypeScript options, and customizable props.',
    description: 'Convert layout markup and SVGs to React-compliant JSX.',
    introduction: 'React codebases require camelCase attributes and self-closing tags. Porting design templates, inline styling, or SVG vectors manually can slow down development. Our React & JSX Developer Tools automate these migrations, generating clean JSX/TSX elements. All utilities run client-side, allowing you to port layouts securely in your browser.',
    keywords: ['react tools', 'html to jsx converter', 'svg to react component', 'svg to jsx', 'jsx formatter'],
    toolSlugs: ['html-to-jsx', 'svg-to-react', 'svg-converter'],
    faqs: [
      {
        question: 'How does HTML to JSX conversion work?',
        answer: 'The converter parses standard markup and translates reserved terms (like class to className and for to htmlFor) while formatting style strings into React style objects.'
      },
      {
        question: 'Can I generate TypeScript components?',
        answer: 'Yes. Toggle TSX mode in the settings to generate TypeScript code with typed React SVG components.'
      },
      {
        question: 'Does the generator optimize vector graphics?',
        answer: 'It removes namespaces, empty tags, and legacy metadata from vector files to output clean and lightweight JSX elements.'
      }
    ]
  },
  {
    slug: 'css-tools',
    title: 'CSS & Tailwind Styling Tools',
    seoTitle: 'CSS to Tailwind Compiler, Grid Generator, and Glassmorphism - CodeStrategists',
    seoDescription: 'Convert CSS declarations to Tailwind CSS utility classes, design responsive layout grids, and preview glassmorphism panel styling.',
    description: 'Compile styles, build grids, and generate glassmorphism designs.',
    introduction: 'Managing layout properties and responsive breakpoints requires constant adjustment. Our CSS & Tailwind Styling Tools collection provides visual and code-based utilities to speed up design workflows. You can convert legacy CSS to Tailwind classes, build responsive grids, and design glassmorphism effects locally in your browser sandbox.',
    keywords: ['css tools', 'css to tailwind', 'tailwind grid generator', 'glassmorphism card css', 'grid layout builder'],
    toolSlugs: ['css-to-tailwind', 'glassmorphism-generator', 'tailwind-grid-generator'],
    faqs: [
      {
        question: 'How are custom color values translated to Tailwind?',
        answer: 'Specific measurements and color hexes are converted to arbitrary values using brackets (e.g. bg-[#3b82f6] or p-[17px]).'
      },
      {
        question: 'Does the grid designer support responsive classes?',
        answer: 'Yes. You can customize grid parameters for mobile, tablet, and desktop views, which are outputted with Tailwind responsive modifiers.'
      },
      {
        question: 'Which browsers support glassmorphism blur?',
        answer: 'Almost all modern browsers support backdrop-filter blur. Safari and iOS require the -webkit-backdrop-filter prefix, which is automatically generated by the tool.'
      }
    ]
  },
  {
    slug: 'developer-utilities',
    title: 'Developer Workspace Utilities',
    seoTitle: 'Regular Expression Testers and secure Password Generators - CodeStrategists',
    seoDescription: 'Evaluate Javascript regular expressions, generate secure passwords, and build batch UUID lists locally in browser sandbox.',
    description: 'Test regular expressions, generate secure passwords, and create UUIDs.',
    introduction: 'Developer workflows require generating secure credentials and testing patterns. Our Developer Workspace Utilities provide tools to speed up these tasks. You can evaluate regular expressions, generate cryptographically secure passwords, and build batch UUID lists locally in your browser memory.',
    keywords: ['developer utilities', 'regex tester online', 'password generator secure', 'uuid guid list', 'local code tools'],
    toolSlugs: ['regex-tester', 'uuid-generator', 'password-generator'],
    faqs: [
      {
        question: 'Are generated passwords secure?',
        answer: 'Yes. The generator uses the browser\'s native Web Cryptography API to fetch random values from the OS kernel, ensuring cryptographically secure entropy.'
      },
      {
        question: 'Does the regex tester support replacement previews?',
        answer: 'Yes. You can toggle Replace mode to preview string replacements using your regular expression patterns.'
      },
      {
        question: 'How does UUID v4 ensure uniqueness?',
        answer: 'UUID v4 contains 122 bits of random entropy, making the probability of generating duplicate IDs virtually zero.'
      }
    ]
  },
  {
    slug: 'generators',
    title: 'Random Data & Asset Generators',
    seoTitle: 'UUID Lists, Secure Password Generators, and Design Canvas - CodeStrategists',
    seoDescription: 'Generate secure random UUIDs, strong passwords, glassmorphic styles, and Tailwind grid layouts online.',
    description: 'Generate secure random UUIDs, strong passwords, glassmorphic styles, and layouts.',
    introduction: 'Generating secure data seeds, layout options, and random identifiers is essential for frontend development. Our Random Data & Asset Generators collection provides tools to generate these resources. You can create UUID lists, strong passwords, glassmorphic styles, and responsive grids locally in your browser.',
    keywords: ['generators online', 'uuid creator secure', 'strong password maker', 'tailwind layout builder', 'glass card generator'],
    toolSlugs: ['uuid-generator', 'password-generator', 'glassmorphism-generator', 'tailwind-grid-generator'],
    faqs: [
      {
        question: 'Can I generate multiple UUIDs at once?',
        answer: 'Yes. You can generate up to 1000 UUIDs per batch instantly in your browser.'
      },
      {
        question: 'Why should I exclude similar characters in passwords?',
        answer: 'Excluding characters like O, 0, I, l, and | prevents reading mistakes when typing passwords manually.'
      },
      {
        question: 'Does the grid designer support arbitrary values?',
        answer: 'Yes. It maps custom spacing to matching Tailwind utilities, using arbitrary bracket syntax if needed.'
      }
    ]
  },
  {
    slug: 'converters',
    title: 'Code Format & Encoding Converters',
    seoTitle: 'Base64 Converters, Percent Encoders, and HTML-to-JSX - CodeStrategists',
    seoDescription: 'Translate binary assets to Base64, percent-encode query strings, and convert HTML stylesheets into React utility components.',
    description: 'Translate binary assets to Base64, encode query strings, and convert layouts.',
    introduction: 'Exchanging data across different frameworks and communication channels requires converting formats. Our Code Format & Encoding Converters collection provides utilities to simplify these conversions. You can encode query parameters, convert binary files to Base64, and translate legacy styling or HTML code securely in your browser.',
    keywords: ['converters tools', 'base64 convert file', 'url percent encoding', 'css to tailwind online', 'html to react jsx'],
    toolSlugs: ['base64-converter', 'url-encoder', 'html-to-jsx', 'css-to-tailwind', 'svg-converter'],
    faqs: [
      {
        question: 'What is the purpose of URL encoding?',
        answer: 'URL encoding replaces characters outside the reserved and unreserved range with a percent sign (%) followed by two hexadecimal digits, ensuring query parameters comply with RFC 3986.'
      },
      {
        question: 'How is Base64 data padded?',
        answer: 'The equals sign (=) is added as padding when the source data size is not a multiple of 3 bytes, allowing decoders to align the binary stream correctly.'
      },
      {
        question: 'Does HTML-to-JSX support comments?',
        answer: 'Yes. Standard HTML comments (<!-- comment -->) are converted into React JSX comments ({/* comment */}) to prevent compilation errors.'
      }
    ]
  }
]

export function getCollectionBySlug(slug: string): CollectionConfig | undefined {
  return COLLECTIONS_CONFIG.find((c) => c.slug === slug)
}
