'use client'

import { useActionState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { contactSchema, type ContactInput } from '@/lib/validation/contact-schema'
import { submitContact } from '@/app/(neutral)/contact/_actions'

// ---------------------------------------------------------------------------
// Label map helpers
// ---------------------------------------------------------------------------

const NEEDS_OPTIONS: { value: ContactInput['needs'][number]; label: string }[] = [
  { value: 'new-website', label: 'New website' },
  { value: 'site-rebuild', label: 'Site rebuild' },
  { value: 'shopify', label: 'Shopify build' },
  { value: 'web-app', label: 'Web app' },
  { value: 'meta-ads', label: 'Meta Ads' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'seo-audit', label: 'SEO audit' },
  { value: 'content', label: 'Content' },
  { value: 'package', label: 'Package' },
  { value: 'unsure', label: "Not sure yet" },
]

const BUDGET_OPTIONS: { value: ContactInput['budget']; label: string }[] = [
  { value: 'under-3k', label: 'Under $3k' },
  { value: '3k-7k', label: '$3k - $7k' },
  { value: '7k-15k', label: '$7k - $15k' },
  { value: '15k-plus', label: '$15k+' },
  { value: 'monthly-retainer', label: 'Monthly retainer' },
]

const TIMELINE_OPTIONS: { value: ContactInput['timeline']; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday (urgent)' },
  { value: '30d', label: 'Within 30 days' },
  { value: '60d', label: 'Within 60 days' },
  { value: 'exploring', label: 'Just exploring' },
]

// ---------------------------------------------------------------------------
// Shared style constants
// ---------------------------------------------------------------------------

const inputBase =
  'w-full rounded-md border border-sand-200 bg-white px-4 py-3 text-sm text-ink placeholder-sand-400 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10'

const labelBase = 'mb-1.5 block text-sm font-medium text-ink'

const errorBase = 'mt-1.5 text-xs text-red-600'

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className={errorBase} role="alert">
      {message}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Success state
// ---------------------------------------------------------------------------

function SuccessState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <CheckCircle2
        className="h-16 w-16 animate-pulse text-emerald-500"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div>
        <p className="text-xl font-semibold text-ink">Got it.</p>
        <p className="mt-2 text-sm text-sand-600">
          One of us will reply within 24 hours.
        </p>
      </div>
      <a
        href="/audit"
        className="mt-2 inline-flex items-center rounded-md bg-ink px-6 py-3 text-sm font-medium text-sand-50 transition hover:bg-ink/90"
      >
        Book a free 30-min audit
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type ServerState =
  | null
  | { success: true }
  | { success: false; errors: Record<string, string[]> }
  | { success: false; error: string }

async function formAction(_prev: ServerState, formData: FormData): Promise<ServerState> {
  return submitContact(formData)
}

export function ContactForm() {
  const [serverState, dispatch, isPending] = useActionState(formAction, null)

  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  })

  const formRef = useRef<HTMLFormElement>(null)

  // Show field errors only after blur or a submit attempt
  const shouldShow = (field: keyof ContactInput) =>
    isSubmitted || Boolean(touchedFields[field])

  // Server-side field errors (if any)
  const serverFieldErrors =
    serverState && !serverState.success && 'errors' in serverState
      ? serverState.errors
      : {}

  const serverGlobalError =
    serverState && !serverState.success && 'error' in serverState
      ? serverState.error
      : null

  if (serverState?.success) {
    return <SuccessState />
  }

  return (
    <form
      ref={formRef}
      action={dispatch}
      noValidate
      className="space-y-6"
    >
      {/* Honeypot -- hidden from real users */}
      <input
        {...register('company_url')}
        name="company_url"
        tabIndex={-1}
        style={{ display: 'none' }}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Row: Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelBase}>
            Name
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="Alex Johnson"
            autoComplete="name"
            className={inputBase}
          />
          {shouldShow('name') && (
            <FieldError message={errors.name?.message ?? serverFieldErrors['name']?.[0]} />
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelBase}>
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="alex@company.com"
            autoComplete="email"
            className={inputBase}
          />
          {shouldShow('email') && (
            <FieldError message={errors.email?.message ?? serverFieldErrors['email']?.[0]} />
          )}
        </div>
      </div>

      {/* Row: Company + Website */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelBase}>
            Company
          </label>
          <input
            {...register('company')}
            id="company"
            type="text"
            placeholder="Acme Inc."
            autoComplete="organization"
            className={inputBase}
          />
          {shouldShow('company') && (
            <FieldError
              message={errors.company?.message ?? serverFieldErrors['company']?.[0]}
            />
          )}
        </div>

        <div>
          <label htmlFor="websiteUrl" className={labelBase}>
            Website{' '}
            <span className="font-normal text-sand-400">(optional)</span>
          </label>
          <input
            {...register('websiteUrl')}
            id="websiteUrl"
            type="url"
            placeholder="https://acme.com"
            autoComplete="url"
            className={inputBase}
          />
          {shouldShow('websiteUrl') && (
            <FieldError
              message={errors.websiteUrl?.message ?? serverFieldErrors['websiteUrl']?.[0]}
            />
          )}
        </div>
      </div>

      {/* What do you need? */}
      <div>
        <fieldset>
          <legend className={labelBase}>What do you need?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NEEDS_OPTIONS.map((opt) => {
              const currentNeeds = watch('needs') ?? []
              const checked = currentNeeds.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition select-none',
                    checked
                      ? 'border-ink bg-ink text-sand-50'
                      : 'border-sand-200 bg-white text-ink hover:border-ink/40',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    name="needs"
                    value={opt.value}
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...currentNeeds, opt.value]
                        : currentNeeds.filter((v) => v !== opt.value)
                      setValue('needs', next as ContactInput['needs'], {
                        shouldValidate: isSubmitted,
                        shouldTouch: true,
                      })
                    }}
                    className="sr-only"
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        </fieldset>
        {(isSubmitted || touchedFields.needs) && (
          <FieldError
            message={errors.needs?.message ?? serverFieldErrors['needs']?.[0]}
          />
        )}
      </div>

      {/* Budget */}
      <div>
        <fieldset>
          <legend className={labelBase}>Budget</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => {
              const current = watch('budget')
              const selected = current === opt.value
              return (
                <label
                  key={opt.value}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition select-none',
                    selected
                      ? 'border-ink bg-ink text-sand-50'
                      : 'border-sand-200 bg-white text-ink hover:border-ink/40',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={opt.value}
                    checked={selected}
                    onChange={() => {
                      setValue('budget', opt.value, {
                        shouldValidate: isSubmitted,
                        shouldTouch: true,
                      })
                    }}
                    className="sr-only"
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        </fieldset>
        {shouldShow('budget') && (
          <FieldError
            message={errors.budget?.message ?? serverFieldErrors['budget']?.[0]}
          />
        )}
      </div>

      {/* Timeline */}
      <div>
        <label htmlFor="timeline" className={labelBase}>
          Timeline
        </label>
        <select
          {...register('timeline')}
          id="timeline"
          name="timeline"
          className={[inputBase, 'cursor-pointer appearance-none'].join(' ')}
          defaultValue=""
        >
          <option value="" disabled>
            Pick one...
          </option>
          {TIMELINE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {shouldShow('timeline') && (
          <FieldError
            message={errors.timeline?.message ?? serverFieldErrors['timeline']?.[0]}
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelBase}>
          Anything else?{' '}
          <span className="font-normal text-sand-400">(optional)</span>
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          placeholder="Share any context that would help us come back with something useful."
          className={[inputBase, 'resize-y'].join(' ')}
        />
        {shouldShow('notes') && (
          <FieldError
            message={errors.notes?.message ?? serverFieldErrors['notes']?.[0]}
          />
        )}
      </div>

      {/* Global server error */}
      {serverGlobalError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverGlobalError}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        onClick={async () => {
          // Trigger client-side validation on manual submit click
          await trigger()
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-8 py-4 text-sm font-semibold text-sand-50 transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  )
}
