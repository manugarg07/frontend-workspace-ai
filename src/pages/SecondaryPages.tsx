import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Milestone, ShieldCheck, Send } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { SEO } from '@/components/common/SEO'

// ----------------------------------------------------
// ABOUT PAGE
// ----------------------------------------------------
export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 text-left">
      <SEO title="About Us - CodeStrategists" />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">About CodeStrategists</h1>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        CodeStrategists was founded on a simple premise: developer productivity tools shouldn't be scattered across 20 different ad-ridden websites.
      </p>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        We set out to create a cohesive, private, and blazing fast browser dashboard where engineers could formatting payloads, test regex, inspect security tokens, and customize CSS config.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Card className="bg-card/50">
          <CardHeader>
            <Milestone className="h-6 w-6 text-primary mb-2" aria-hidden="true" />
            <CardTitle as="h2" className="font-heading text-base">Our Vision</CardTitle>
            <CardDescription className="text-xs">Consolidating developer resources into a beautiful, standardized screen that stays 100% client-side.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card/50">
          <CardHeader>
            <ShieldCheck className="h-6 w-6 text-primary mb-2" aria-hidden="true" />
            <CardTitle as="h2" className="font-heading text-base">Privacy Standard</CardTitle>
            <CardDescription className="text-xs">We believe your source code and configurations shouldn't travel to any cloud. Security via client side executions.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// CONTACT PAGE (WITH VALIDATION)
// ----------------------------------------------------
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export function ContactPage() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = (data: ContactFormData) => {
    // Mock submit delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast(`Thanks, ${data.name}! We received your message (sandbox mock).`, 'success')
        reset()
        resolve()
      }, 800)
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-6 text-left">
      <SEO title="Contact Us - CodeStrategists" />
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">Get in Touch</h1>
        <p className="text-sm text-muted-foreground mt-1">Have ideas or custom tool suggestions? Drop a note.</p>
      </div>

      <Card className="bg-card/60">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              id="name"
              label="Your Name"
              placeholder="Alex Johnson"
              autoComplete="name"
              aria-required="true"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="alex@company.com"
              autoComplete="email"
              aria-required="true"
              error={errors.email?.message}
              {...register('email')}
            />
            <Textarea
              id="message"
              label="Feedback Message"
              placeholder="Type your feature requests here..."
              aria-required="true"
              error={errors.message?.message}
              className="min-h-24 font-sans"
              {...register('message')}
            />
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}>
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ----------------------------------------------------
// PRIVACY PAGE
// ----------------------------------------------------
export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 text-left leading-relaxed">
      <SEO title="Privacy Policy - CodeStrategists" />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground">Last updated: July 8, 2026</p>
      
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <h2 className="font-heading text-base font-bold text-foreground mt-2">1. Local Execution Principle</h2>
        <p>
          CodeStrategists is dedicated to maintaining your privacy. All operations, conversions, beautification parsing, and regex calculations take place on your local computer using the browser's context execution environments.
        </p>
        <p>
          We do not collect, intercept, or copy any input data that you process in our utilities.
        </p>
        
        <h2 className="font-heading text-base font-bold text-foreground mt-2">2. Cookies and Storage</h2>
        <p>
          We use browser `localStorage` to save your dashboard choices, recently used files list, and active light/dark display theme configurations. These options are held locally on your device and are never synced to external analytics unless you opt-in to pro tiers.
        </p>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// TERMS PAGE
// ----------------------------------------------------
export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 text-left leading-relaxed">
      <SEO title="Terms of Service - CodeStrategists" />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="text-xs text-muted-foreground">Last updated: July 8, 2026</p>
      
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <h2 className="font-heading text-base font-bold text-foreground mt-2">1. Use License</h2>
        <p>
          You are free to utilize all active converters, validators, formatters, and generators in CodeStrategists for personal and commercial development.
        </p>
        <p>
          The service is provided "as is", without any warranties of any kind. We are not responsible for outputs or configurations generated during your session.
        </p>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// CHANGELOG PAGE
// ----------------------------------------------------
export function ChangelogPage() {
  const versions = [
    {
      version: 'v2.0.0',
      date: 'July 2026',
      badge: 'Major Release',
      changes: [
        'Added dynamic command palette (Ctrl+K) for tool indexing.',
        'Switched from Tailwind CSS v3 to lightning-fast Tailwind CSS v4 compiler.',
        'Introduced global stateful dark / light / system preference syncing.',
        'Refined layout design with glassmorphic cards and glowing gradients.',
      ],
    },
    {
      version: 'v1.1.0',
      date: 'May 2026',
      badge: 'Utility Update',
      changes: [
        'Added Base64 Encoder/Decoder and JWT claims analyzer panels.',
        'Implemented breadcrumbs routing.',
        'Polished output copy and download buttons.',
      ],
    },
    {
      version: 'v1.0.0',
      date: 'March 2026',
      badge: 'Initial Launch',
      changes: [
        'Scaffolded basic workspace structure.',
        'Created initial Converters, Formatters, and Generators index registry.',
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8 text-left">
      <SEO title="Changelog & Updates - CodeStrategists" />
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Product Changelog</h1>
        <p className="text-sm text-muted-foreground mt-1">Keep track of releases and configuration updates.</p>
      </div>

      <div className="relative border-l border-border/40 pl-6 flex flex-col gap-10">
        {versions.map((ver) => (
          <div key={ver.version} className="relative group">
            {/* Timeline bullet dot */}
            <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border border-primary bg-background group-hover:bg-primary transition-colors" />

            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-heading text-lg font-bold text-foreground">{ver.version}</h2>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                {ver.badge}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{ver.date}</span>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-4">
              {ver.changes.map((change, cIdx) => (
                <li key={cIdx}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
