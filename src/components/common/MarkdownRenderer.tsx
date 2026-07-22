import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useToast } from '../ui/Toast'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { toast } = useToast()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Custom parsing algorithm
  const parseMarkdown = (text: string) => {
    const blocks: { type: string; content: string; lang?: string }[] = []
    
    // Split by code blocks first
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    let lastIndex = 0
    let match
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const textBefore = text.slice(lastIndex, match.index)
      if (textBefore.trim()) {
        blocks.push({ type: 'text', content: textBefore })
      }
      
      blocks.push({
        type: 'code',
        lang: match[1] || 'plaintext',
        content: match[2]
      })
      
      lastIndex = codeBlockRegex.lastIndex
    }
    
    const textAfter = text.slice(lastIndex)
    if (textAfter.trim()) {
      blocks.push({ type: 'text', content: textAfter })
    }
    
    // For text blocks, split by newlines and parse elements
    return blocks.flatMap((block) => {
      if (block.type === 'code') return [block]
      
      const lines = block.content.split('\n')
      const refinedBlocks: { type: string; content: string; lang?: string }[] = []
      let currentList: string[] = []
      
      for (const line of lines) {
        const trimmed = line.trim()
        
        // List check
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          currentList.push(trimmed.slice(2))
          continue
        }
        
        // If list was accumulating and we hit a non-list line, flush it
        if (currentList.length > 0 && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
          refinedBlocks.push({ type: 'list', content: currentList.join('\n') })
          currentList = []
        }
        
        if (trimmed.startsWith('# ')) {
          refinedBlocks.push({ type: 'h1', content: trimmed.slice(2) })
        } else if (trimmed.startsWith('## ')) {
          refinedBlocks.push({ type: 'h2', content: trimmed.slice(3) })
        } else if (trimmed.startsWith('### ')) {
          refinedBlocks.push({ type: 'h3', content: trimmed.slice(4) })
        } else if (trimmed.startsWith('#### ')) {
          refinedBlocks.push({ type: 'h4', content: trimmed.slice(5) })
        } else if (trimmed.startsWith('> ')) {
          refinedBlocks.push({ type: 'quote', content: trimmed.slice(2) })
        } else if (trimmed === '') {
          continue
        } else {
          refinedBlocks.push({ type: 'paragraph', content: line })
        }
      }
      
      if (currentList.length > 0) {
        refinedBlocks.push({ type: 'list', content: currentList.join('\n') })
      }
      
      return refinedBlocks
    })
  }

  const parsedBlocks = parseMarkdown(content)

  // In-line element parser (handles link [text](url), bold **, italics *, inline code `text`)
  const parseInlineElements = (text: string): React.ReactNode[] => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const boldRegex = /\*\*([^*]+)\*\*/g
    const italicRegex = /\*([^*]+)\*/g
    const codeRegex = /`([^`]+)`/g
    
    let parts: React.ReactNode[] = [text]
    
    // 1. Parse Links
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part]
      const result: React.ReactNode[] = []
      let lastIdx = 0
      let match
      linkRegex.lastIndex = 0
      while ((match = linkRegex.exec(part)) !== null) {
        if (match.index > lastIdx) {
          result.push(part.slice(lastIdx, match.index))
        }
        const label = match[1]
        const url = match[2]
        
        if (url.startsWith('/')) {
          result.push(
            <a key={match.index} href={url} className="text-primary hover:underline font-semibold transition-colors duration-150">
              {label}
            </a>
          )
        } else {
          result.push(
            <a
              key={match.index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold transition-colors duration-150"
            >
              {label}
            </a>
          )
        }
        lastIdx = linkRegex.lastIndex
      }
      if (lastIdx < part.length) {
        result.push(part.slice(lastIdx))
      }
      return result
    })

    // 2. Parse Bold
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part]
      const result: React.ReactNode[] = []
      let lastIdx = 0
      let match
      boldRegex.lastIndex = 0
      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIdx) {
          result.push(part.slice(lastIdx, match.index))
        }
        result.push(<strong key={match.index} className="font-bold text-foreground">{match[1]}</strong>)
        lastIdx = boldRegex.lastIndex
      }
      if (lastIdx < part.length) {
        result.push(part.slice(lastIdx))
      }
      return result
    })

    // 3. Parse Code backticks
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part]
      const result: React.ReactNode[] = []
      let lastIdx = 0
      let match
      codeRegex.lastIndex = 0
      while ((match = codeRegex.exec(part)) !== null) {
        if (match.index > lastIdx) {
          result.push(part.slice(lastIdx, match.index))
        }
        result.push(
          <code key={match.index} className="bg-secondary border border-border px-1.5 py-0.5 rounded text-xs font-mono text-foreground font-semibold">
            {match[1]}
          </code>
        )
        lastIdx = codeRegex.lastIndex
      }
      if (lastIdx < part.length) {
        result.push(part.slice(lastIdx))
      }
      return result
    })

    return parts
  }

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    toast('Code snippet successfully copied.', 'success')
    setTimeout(() => {
      setCopiedIndex(null)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 text-sm sm:text-base text-muted-foreground leading-relaxed font-sans select-text">
      {parsedBlocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2 key={idx} className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-8 mb-2 leading-tight border-b border-border/40 pb-2">
                {parseInlineElements(block.content)}
              </h2>
            )
          case 'h2':
            return (
              <h2 key={idx} className="font-heading text-xl sm:text-2xl font-bold text-foreground mt-8 mb-2 leading-tight">
                {parseInlineElements(block.content)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={idx} className="font-heading text-lg sm:text-xl font-semibold text-foreground mt-6 mb-1.5 leading-tight">
                {parseInlineElements(block.content)}
              </h3>
            )
          case 'h4':
            return (
              <h4 key={idx} className="font-heading text-base sm:text-lg font-semibold text-foreground mt-4 mb-1 leading-tight">
                {parseInlineElements(block.content)}
              </h4>
            )
          case 'paragraph':
            return (
              <p key={idx} className="my-2.5 font-normal leading-relaxed text-muted-foreground">
                {parseInlineElements(block.content)}
              </p>
            )
          case 'quote':
            return (
              <blockquote key={idx} className="border-l-4 border-primary pl-4 py-1.5 my-4 bg-secondary/35 rounded-r-lg text-foreground/90 italic">
                {parseInlineElements(block.content)}
              </blockquote>
            )
          case 'list':
            return (
              <ul key={idx} className="list-disc list-outside pl-6 my-3 space-y-2">
                {block.content.split('\n').map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {parseInlineElements(item)}
                  </li>
                ))}
              </ul>
            )
          case 'code':
            const isCopied = copiedIndex === idx
            return (
              <div key={idx} className="relative group rounded-xl border border-border/50 bg-black/40 overflow-hidden my-6">
                <div className="flex justify-between items-center px-4 py-2 border-b border-border/20 bg-secondary/15">
                  <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">{block.lang}</span>
                  <button
                    onClick={() => handleCopy(block.content, idx)}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2 py-1 rounded hover:bg-secondary/40"
                    aria-label="Copy code block"
                  >
                    {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs text-foreground/95 font-mono leading-relaxed whitespace-pre max-h-[400px]">
                  <code>{block.content}</code>
                </pre>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
