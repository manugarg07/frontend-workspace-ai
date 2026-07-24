import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Sparkles,
  Code,
  Share2,
  FileCode,
  Sliders,
  ArrowLeftRight,
  Copy,
  Download,
  ClipboardList,
  Trash,
  Play,
  Check,
  AlertCircle,
  Settings,
  HelpCircle,
  Activity,
  FileText,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { ResultPanel } from '@/components/ui/ResultPanel'
import { Toolbar } from '@/components/ui/Toolbar'
import { ToolLayout } from '@/components/common/ToolLayout'
import type { OptionTab } from '@/components/common/ToolLayout'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

// Singularization helper
function singularize(name: string): string {
  // Simple English singularization
  const clean = name.replace(/[^a-zA-Z0-9_]/g, ' ');
  const cleaned = clean
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  if (cleaned.endsWith('s') && !cleaned.endsWith('ss') && !cleaned.endsWith('us')) {
    return cleaned.slice(0, -1);
  }
  return cleaned;
}

function cleanName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_]/g, ' ');
  return clean
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// JSON-to-TS interface generator engine
class TSGenerator {
  private bodyToName = new Map<string, string>();
  private nameToBody = new Map<string, string>();
  private definitions: { name: string; body: string }[] = [];
  private options: {
    rootName: string;
    nullType: 'any' | 'null' | 'unknown';
    exportInterfaces: boolean;
    optionalProperties: boolean;
  };

  constructor(options: {
    rootName: string;
    nullType: 'any' | 'null' | 'unknown';
    exportInterfaces: boolean;
    optionalProperties: boolean;
  }) {
    this.options = options;
  }

  generate(val: any): string {
    this.bodyToName.clear();
    this.nameToBody.clear();
    this.definitions = [];

    const rootType = this.getType(val, this.options.rootName);

    let output = '';
    const prefix = this.options.exportInterfaces ? 'export ' : '';

    if (rootType.endsWith('[]') && !this.nameToBody.has(rootType.slice(0, -2)) && rootType !== 'any[]') {
      output += `${prefix}type ${this.options.rootName} = ${rootType};\n\n`;
    } else if (rootType === 'any' || rootType === 'null' || rootType === 'string' || rootType === 'number' || rootType === 'boolean') {
      output += `${prefix}type ${this.options.rootName} = ${rootType};\n\n`;
    } else if (rootType.endsWith('[]')) {
      const itemName = rootType.slice(0, -2);
      output += `${prefix}type ${this.options.rootName} = ${itemName}[];\n\n`;
    }

    this.definitions.forEach((def) => {
      output += `${prefix}interface ${def.name} ${def.body}\n\n`;
    });

    return output.trim();
  }

  private getType(val: any, keyName: string): string {
    if (val === null) {
      return this.options.nullType;
    }

    const type = typeof val;
    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return 'any[]';
      }

      const elementTypes = new Set<string>();
      const objects: any[] = [];

      val.forEach((item) => {
        if (item === null) {
          elementTypes.add(this.options.nullType);
        } else if (typeof item === 'object' && !Array.isArray(item)) {
          objects.push(item);
        } else {
          elementTypes.add(this.getType(item, keyName));
        }
      });

      if (objects.length > 0) {
        const mergedObj = this.mergeObjects(objects);
        const singularName = singularize(keyName) || 'Item';
        const objType = this.getType(mergedObj, singularName);
        elementTypes.add(objType);
      }

      const typeList = Array.from(elementTypes);
      if (typeList.length === 1) {
        return `${typeList[0]}[]`;
      } else {
        return `(${typeList.join(' | ')})[]`;
      }
    }

    if (type === 'object') {
      return this.createInterface(val, keyName);
    }

    return 'any';
  }

  private mergeObjects(objs: any[]): any {
    const merged: any = {};
    const allKeys = new Set<string>();

    objs.forEach((o) => {
      if (o && typeof o === 'object') {
        Object.keys(o).forEach((k) => allKeys.add(k));
      }
    });

    allKeys.forEach((key) => {
      const values = objs
        .filter((o) => o && typeof o === 'object' && key in o)
        .map((o) => o[key]);

      if (values.length === 0) {
        merged[key] = null;
      } else {
        const objectValues = values.filter((v) => v !== null && typeof v === 'object' && !Array.isArray(v));
        const arrayValues = values.filter((v) => Array.isArray(v));

        if (objectValues.length === values.length) {
          merged[key] = this.mergeObjects(objectValues);
        } else if (arrayValues.length === values.length) {
          const flatArray: any[] = [];
          arrayValues.forEach((arr) => flatArray.push(...arr));
          merged[key] = flatArray;
        } else {
          merged[key] = { __isUnion: true, values };
        }
      }

      const isOptional = values.length < objs.length;
      if (isOptional && this.options.optionalProperties) {
        if (!merged.__optionalKeys) {
          merged.__optionalKeys = new Set<string>();
        }
        merged.__optionalKeys.add(key);
      }
    });

    return merged;
  }

  private createInterface(obj: any, keyName: string): string {
    const keys = Object.keys(obj).filter((k) => k !== '__optionalKeys' && k !== '__isUnion' && k !== 'values');
    const fields: string[] = [];

    keys.forEach((key) => {
      const val = obj[key];
      const isOptional = obj.__optionalKeys && obj.__optionalKeys.has(key);

      let propType = 'any';
      if (val && val.__isUnion === true) {
        const unionTypes = new Set<string>();
        val.values.forEach((v: any) => {
          unionTypes.add(this.getType(v, key));
        });
        propType = Array.from(unionTypes).join(' | ');
      } else {
        propType = this.getType(val, key);
      }

      const optionalSuffix = isOptional ? '?' : '';
      fields.push(`  ${key}${optionalSuffix}: ${propType};`);
    });

    const body = `{\n${fields.join('\n')}\n}`;

    if (this.bodyToName.has(body)) {
      return this.bodyToName.get(body)!;
    }

    let baseName = cleanName(keyName) || 'Item';
    let interfaceName = baseName;
    let counter = 2;
    while (this.nameToBody.has(interfaceName)) {
      interfaceName = `${baseName}${counter}`;
      counter++;
    }

    this.bodyToName.set(body, interfaceName);
    this.nameToBody.set(interfaceName, body);
    this.definitions.push({ name: interfaceName, body });

    return interfaceName;
  }
}

// Preset samples
const SAMPLES = {
  basic: {
    title: 'Basic User Profile',
    data: JSON.stringify({
      name: "John",
      age: 25,
      isAdmin: true,
      address: {
        city: "London"
      }
    }, null, 2)
  },
  complex: {
    title: 'Advanced Developer',
    data: JSON.stringify({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      isActive: true,
      roles: ["editor", "admin"],
      tags: [],
      address: {
        street: "123 Main St",
        city: "London",
        postalCode: "EC1A 1BB"
      },
      skills: [
        {
          name: "React",
          level: "Expert"
        },
        {
          name: "TypeScript",
          level: "Advanced",
          certified: true
        }
      ]
    }, null, 2)
  }
}

export function JSONToTypeScriptConverterPro() {
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning' | 'error'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Configuration Toggles
  const [rootName, setRootName] = useState('Root')
  const [nullType, setNullType] = useState<'any' | 'null' | 'unknown'>('any')
  const [exportInterfaces, setExportInterfaces] = useState(false)
  const [optionalProperties, setOptionalProperties] = useState(true)

  // Handle auto-resize of textarea (fallback)
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(textarea.scrollHeight, 250)}px`
    }
  }, [inputVal])

  // Conversion core execution
  const handleConvert = useCallback((customInput = inputVal) => {
    if (!customInput.trim()) {
      setOutputVal('')
      setValidationStatus(null)
      setValidationMessage('')
      setErrorDetails(null)
      setProcessingTime(null)
      return
    }

    setIsProcessing(true)
    const startTime = performance.now()

    try {
      // Parse JSON safely
      const parsed = JSON.parse(customInput.trim())
      
      // Initialize compiler engine
      const generator = new TSGenerator({
        rootName: rootName.trim() || 'Root',
        nullType,
        exportInterfaces,
        optionalProperties
      })

      const generated = generator.generate(parsed)
      setOutputVal(generated)
      setValidationStatus('success')
      setValidationMessage('JSON schema parsed successfully! TypeScript interfaces generated.')
      setErrorDetails(null)
    } catch (err) {
      setValidationStatus('error')
      setValidationMessage('Invalid JSON')
      setErrorDetails(err instanceof Error ? err.message : 'Please check your JSON syntax and try again.')
      setOutputVal('')
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
      setIsProcessing(false)
    }
  }, [inputVal, rootName, nullType, exportInterfaces, optionalProperties])

  // Debounced auto-convert trigger
  useEffect(() => {
    if (autoConvert) {
      const delay = setTimeout(() => {
        handleConvert()
      }, 200)
      return () => clearTimeout(delay)
    }
  }, [inputVal, rootName, nullType, exportInterfaces, optionalProperties, autoConvert, handleConvert])

  // Keyboard shortcut: Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleConvert()
        toast('Generated TypeScript Interfaces', 'success')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleConvert, toast])

  // Preset Spacing Options
  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  const loadPreset = (key: string) => {
    setInputVal(SAMPLES[key as keyof typeof SAMPLES].data)
    toast(`Loaded example: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
  }

  const handleCopy = () => {
    if (!outputVal) return
    navigator.clipboard.writeText(outputVal)
    toast('Copied TypeScript interfaces to clipboard!', 'success')
  }

  const handleDownload = () => {
    if (!outputVal) return
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'types.ts'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded types.ts file', 'success')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputVal(text)
      toast('Pasted payload from clipboard', 'success')
    } catch {
      toast('Clipboard access blocked. Use Ctrl+V inside the editor.', 'error')
    }
  }

  // Options tabs configuration
  const optionTabs: OptionTab[] = [
    {
      id: 'settings',
      label: 'Generator Settings',
      icon: <Sliders className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-sans">
          {/* Root Interface Name */}
          <div className="space-y-2">
            <label htmlFor="root-name-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Root Name
            </label>
            <input
              id="root-name-input"
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="Root"
              className="w-full bg-background border border-border/40 p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/45 font-mono"
            />
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              Naming convention for the top-level parent interface.
            </p>
          </div>

          {/* Null Type Representation */}
          <div className="space-y-2">
            <label htmlFor="null-representation-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Null Representation
            </label>
            <select
              id="null-representation-select"
              value={nullType}
              onChange={(e) => setNullType(e.target.value as 'any' | 'null' | 'unknown')}
              className="w-full bg-background border border-border/40 p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/45"
            >
              <option value="any">any</option>
              <option value="null">null</option>
              <option value="unknown">unknown</option>
            </select>
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              TypeScript type assigned to null values.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 flex flex-col justify-center">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={exportInterfaces}
                onChange={(e) => setExportInterfaces(e.target.checked)}
                className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer bg-background"
              />
              <span>Prefix with export keywords</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={optionalProperties}
                onChange={(e) => setOptionalProperties(e.target.checked)}
                className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer bg-background"
              />
              <span>Generate optional properties</span>
            </label>
          </div>
        </div>
      )
    }
  ]

  return (
    <ToolLayout
      toolSlug="json-to-typescript"
      parentTitle="Tools"
      parentRoute="/tools"
      extraSEOProps={{
        title: "JSON to TypeScript Interface Generator | CodeStrategists",
        description: "Convert JSON into TypeScript interfaces instantly with this free online generator. Supports nested objects, arrays, optional properties and works completely in your browser.",
        canonical: "/tools/json-to-typescript"
      }}
      toolbar={
        <Toolbar
          onPaste={handlePaste}
          samples={presetsSamples}
          onLoadSample={loadPreset}
          onConvert={() => handleConvert()}
          convertLabel="Generate Interface"
          onCopy={handleCopy}
          copyDisabled={!outputVal}
          onDownload={handleDownload}
          downloadDisabled={!outputVal}
          onClear={() => { setInputVal(''); setOutputVal(''); setValidationStatus(null); setValidationMessage(''); setErrorDetails(null); }}
          clearDisabled={!inputVal && !outputVal}
        />
      }
      editorSection={
        <div className="flex flex-col gap-6 w-full text-left font-sans">
          
          {/* Main workspace layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            
            {/* Input card */}
            <div className="lg:col-span-6 flex flex-col">
              <Card className="flex flex-col bg-card/45 border-border overflow-hidden h-full">
                <CardHeader className="p-4 border-b border-border/40 bg-secondary/15">
                  <CardTitle as="h2" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    JSON Input Payload
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col justify-between bg-secondary/5 min-h-[300px]">
                  <textarea
                    ref={textareaRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={`{\n  "name": "John",\n  "age": 25,\n  "isAdmin": true,\n  "address": {\n    "city": "London"\n  }\n}`}
                    aria-label="JSON Input Area"
                    spellCheck="false"
                    className="w-full min-h-[250px] p-3 font-mono text-sm bg-transparent border-none text-foreground placeholder:text-muted-foreground/35 resize-none focus:outline-none flex-1 overflow-y-auto"
                  />
                  <div className="mt-2 text-[10px] text-muted-foreground font-mono select-none">
                    Press <kbd className="bg-background border px-1 rounded">Ctrl + Enter</kbd> to run
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Output card */}
            <div className="lg:col-span-6 flex flex-col">
              <ResultPanel
                title="Generated TypeScript Interfaces"
                value={outputVal}
                onCopy={handleCopy}
                onDownload={handleDownload}
                validationStatus={validationStatus}
                validationMessage={validationMessage}
                processingTime={processingTime}
                emptyTitle="TypeScript Output Panel"
                emptyDescription="TypeScript interfaces compiled from your JSON schema will render here."
              >
                <div className="flex-1 flex flex-col min-h-[350px]">
                  {validationStatus === 'error' ? (
                    <div className="p-6 flex-1 flex flex-col justify-center select-none bg-destructive/5 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <AlertCircle className="h-10 w-10 text-destructive mx-auto animate-pulse" />
                        <h3 className="font-heading font-bold text-base text-destructive">Invalid JSON</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Please check your JSON syntax and try again.
                        </p>
                        {errorDetails && (
                          <pre className="text-xs font-mono bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-destructive overflow-x-auto whitespace-pre-wrap max-w-full text-left">
                            {errorDetails}
                          </pre>
                        )}
                      </div>
                    </div>
                  ) : (
                    <CodeEditorWrapper
                      language="typescript"
                      value={outputVal}
                      readOnly={true}
                    />
                  )}
                </div>
              </ResultPanel>
            </div>

          </div>

        </div>
      }
      optionTabs={optionTabs}
      instructionsTitle="JSON to TypeScript Interface Guide"
      instructions={
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-sans">
          
          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <FileCode className="h-4.5 w-4.5 text-primary" /> What is JSON to TypeScript?
            </h3>
            <p>
              This generator allows frontend engineers to port raw backend data shapes into strongly typed contract schemas in the React/TypeScript compiler pipeline. Integrating APIs requires typing return parameters manually. This utility reads parameters, converts structures, singularizes names, merges arrays, and produces clean typescript components instantly.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-primary" /> How It Works
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Step 1:</strong> Paste your raw minified JSON structures in the left editor area.</li>
              <li><strong className="text-foreground">Step 2:</strong> Configure parameters such as Root class naming, prefix selectors, and null translations in the settings.</li>
              <li><strong className="text-foreground">Step 3:</strong> The system validates JSON structures locally and outputs TypeScript interfaces.</li>
              <li><strong className="text-foreground">Step 4:</strong> Click the copy or download actions to save your `types.ts` locally.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Interface Formatting Guidelines
            </h3>
            <p>
              To maintain clean outputs, our system automatically runs structural deduplication. If two nested structures have identical field properties, we consolidate them under a single interface instead of spawning multiple numbered copies. Array elements are singularized using basic English grammar rules to optimize semantic readability.
            </p>
          </div>

        </div>
      }
      benefits={[
        "Recursive Payload Parsing: Safely translates nested sub-objects and properties.",
        "Auto-consolidation: Reuses identical structures to keep the types compile-clean.",
        "Browser Sandboxed Privacy: Zero networks telemetry. Safe for production databases."
      ]}
    />
  )
}
