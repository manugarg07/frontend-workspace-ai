export const commonJsonErrors = {
  id: 'common-json-errors',
  slug: 'common-json-errors',
  title: 'Common JSON Errors and How to Fix Them: A Linter\'s Guide',
  subtitle: 'Diagnosing bracket mismatches, trailing commas, and invalid key structures.',
  description: 'A comprehensive developer guide to diagnosing and fixing common JSON syntax errors. Learn about quote escaping, trailing commas, parsing rules, and how to write secure try-catch blocks.',
  category: 'Development',
  author: 'Manu Garg',
  publishedDate: '2026-07-20',
  updatedDate: '2026-07-22',
  readingTime: '8 min read',
  keywords: ['json errors', 'json parser', 'json linter', 'trailing comma json', 'syntax error json', 'try-catch json'],
  relatedTools: ['json-formatter', 'jwt-decoder', 'regex-tester'],
  relatedArticles: ['json-formatter-vs-validator', 'best-frontend-tools-2026'],
  content: `# Common JSON Errors and How to Fix Them: A Linter\'s Guide

JSON (JavaScript Object Notation) is a widely used format for data exchange due to its simplicity. However, its strict syntax specifications make it prone to formatting errors. A single misplaced comma or unquoted key can cause parsers to fail, leading to build crashes or runtime errors.

In JavaScript, developers are used to flexible object literal rules. When writing JSON configurations or API payloads, they often carry over these habits, resulting in syntax errors.

This guide details common JSON errors, explains why they violate standard specifications, and shows how to resolve them.

---

## 1. Mismatched Quotes

One of the most common JSON syntax issues involves quote characters.

### A. Single Quotes
JavaScript allows using single quotes for strings:
\`\`\`javascript
// Valid JavaScript
const config = { \'theme\': \'dark\' };
\`\`\`
In JSON, **only double quotes** are valid for keys and string values:
\`\`\`
// Invalid JSON
{
  \'theme\': \'dark\'
}
\`\`\`
\`\`\`json
// Valid JSON
{
  "theme": "dark"
}
\`\`\`

### B. Unescaped Double Quotes
If a string value contains double quotes, they must be escaped using a backslash (\`\\\`):
\`\`\`
// Invalid JSON
{
  "quote": "He said, "Welcome to the system.""
}
\`\`\`
\`\`\`json
// Valid JSON
{
  "quote": "He said, \\"Welcome to the system.\\""
}
\`\`\`

---

## 2. Trailing Commas

Modern JavaScript supports trailing commas at the end of lists or object properties to simplify Git diffs:
\`\`\`javascript
// Valid JavaScript
const list = [
  "item1",
  "item2",
];
\`\`\`

In JSON, trailing commas are strictly prohibited:
\`\`\`
// Invalid JSON
{
  "ports": [80, 443,],
  "active": true,
}
\`\`\`
If a validator parser reads a trailing comma, it expects another element. Finding a closing bracket (\`]\` or \`}\`) instead will cause the parser to fail.
\`\`\`json
// Valid JSON
{
  "ports": [80, 443],
  "active": true
}
\`\`\`

---

## 3. Numeric Sizing and Formatting Limits

JSON numeric specifications are stricter than standard JavaScript:
- **Leading Zeros**: Numbers cannot have leading zeros (e.g. \`05\` is invalid; it must be written as \`5\`).
- **Octal and Hexadecimal**: Hexadecimal values (e.g. \`0xFF\`) are invalid.
- **NaN and Infinity**: Special numerical tokens like \`NaN\` or \`Infinity\` are not supported in JSON; empty or invalid numbers must be represented as \`null\`.

\`\`\`
// Invalid JSON
{
  "delay": 05,
  "mask": 0xFF,
  "limit": NaN
}
\`\`\`
\`\`\`json
// Valid JSON
{
  "delay": 5,
  "mask": 255,
  "limit": null
}
\`\`\`

---

## 4. Secure Parsing in JavaScript (Try-Catch Pattern)

When parsing external API responses or configuration files, always wrap \`JSON.parse()\` in a \`try-catch\` block to handle malformed data gracefully and prevent application crashes:

\`\`\`javascript
function parseConfigPayload(rawJsonString) {
  try {
    const config = JSON.parse(rawJsonString);
    return { success: true, data: config };
  } catch (error) {
    console.error("JSON Parsing failed:", error.message);
    // Return structured diagnostic details
    return { 
      success: false, 
      error: "Malformed JSON payload structure", 
      details: error.message 
    };
  }
}
\`\`\`

---

## 5. Frequently Asked Questions

### What does the JSON Formatter do when it finds a syntax error?
The linter catches the parsing exception and displays a diagnostic message highlighting the exact line and character column where the syntax broke.

### Why does JSON forbid trailing commas?
JSON was designed to be language-independent. Forbidding trailing commas ensures compatibility with older or stricter parsers in languages like C++ or Java.

### Can JSON represent date objects?
JSON does not have a native date type. Dates are typically serialized as ISO 8601 strings (e.g., "2026-07-22T10:00:00Z") and parsed back to date objects by the client.

### How do I escape backslashes in JSON?
To include a literal backslash in a string, escape it with another backslash (e.g., "C:\\\\Program Files").

### What happens if I use unquoted keys in JSON?
The parser will fail immediately and report a syntax error. All keys must be enclosed in double quotes.

### Can I format JSON with comments?
No. The standard JSON specification (RFC 8259) does not support comments. Including comments will cause validation to fail.
`,
  tips: [
    'Always use double quotes for both keys and string values in JSON.',
    'Wrap JSON.parse calls in try-catch blocks to prevent your application from crashing on malformed inputs.',
    'Use local JSON formatters to validate and inspect data structures securely.'
  ],
  pitfalls: [
    'Leaving trailing commas at the end of lists or objects, which violates JSON standards.',
    'Attempting to store complex data types like functions, undefined, or RegExp in JSON payloads.'
  ]
}
