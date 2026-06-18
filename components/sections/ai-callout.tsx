'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Container } from '@/components/layout/container'

export interface AICalloutProps {
  theme: 'studio' | 'garden'
}

/** Matches the `--easing-out` token: cubic-bezier(0.22, 1, 0.36, 1). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type LineKind = 'agent' | 'tool' | 'result' | 'done'

interface ScriptLine {
  kind: LineKind
  glyph: string
  /** Visual indent depth (0 = flush, 1 = tool, 2 = result). */
  depth: 0 | 1 | 2
  text: string
  /** Marks the active tool rows that get the lane-accent highlight. */
  active?: boolean
  /** A trailing `// illustrative` marker for honesty on metric rows. */
  illustrative?: boolean
}

const SCRIPT: readonly ScriptLine[] = [
  { kind: 'agent', glyph: '▷', depth: 0, text: 'agent.run("grow the loop")' },
  { kind: 'tool', glyph: '→', depth: 1, text: 'tool: ads.fetch_performance()', active: true },
  {
    kind: 'result',
    glyph: '⤷',
    depth: 2,
    text: 'roas 3.8x · cac $24 · top_creative #7',
    illustrative: true,
  },
  {
    kind: 'tool',
    glyph: '→',
    depth: 1,
    text: 'tool: page.propose_variant(creative #7)',
    active: true,
  },
  {
    kind: 'result',
    glyph: '⤷',
    depth: 2,
    text: 'draft ready · lcp 0.9s · ship? [y]',
    illustrative: true,
  },
  { kind: 'done', glyph: '✓', depth: 0, text: 'build ⇄ grow, one loop. no handoff.' },
] as const

const SUMMARY =
  'An illustration of an AI agent reading ad performance and proposing a landing-page variant — build and growth in one loop.'

/** Per-line reveal cadence. Studio is snappy; Garden is deliberate. */
const TIMING = {
  studio: { stagger: 0.45, lineDuration: 0.15, holdAtEnd: 1.4 },
  garden: { stagger: 0.6, lineDuration: 0.6, holdAtEnd: 1.6 },
} as const

function useScriptCycle(theme: AICalloutProps['theme'], reduced: boolean, paused: boolean) {
  const [visibleCount, setVisibleCount] = React.useState(reduced ? SCRIPT.length : 0)

  React.useEffect(() => {
    if (reduced) {
      setVisibleCount(SCRIPT.length)
      return
    }
    if (paused) return

    const { stagger, holdAtEnd } = TIMING[theme]
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    const runLoop = (): void => {
      if (cancelled) return
      setVisibleCount(0)
      SCRIPT.forEach((_, i) => {
        timers.push(
          setTimeout(
            () => {
              if (!cancelled) setVisibleCount(i + 1)
            },
            (i + 1) * stagger * 1000
          )
        )
      })
      const total = (SCRIPT.length * stagger + holdAtEnd) * 1000
      timers.push(setTimeout(runLoop, total))
    }

    runLoop()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [theme, reduced, paused])

  return reduced ? SCRIPT.length : visibleCount
}

function laneAccent(theme: AICalloutProps['theme']): string {
  // Studio AI lane = electric blue; Garden AI lane = plum (quaternary).
  return theme === 'studio' ? 'var(--color-secondary)' : 'var(--color-quaternary)'
}

function BlinkingCursor({ color }: { color: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '0.55em',
        height: '1.05em',
        marginLeft: 4,
        verticalAlign: 'text-bottom',
        background: color,
      }}
      animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
      transition={reduced ? undefined : { duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
    />
  )
}

function ScriptRow({
  line,
  visible,
  theme,
  accent,
  duration,
}: {
  line: ScriptLine
  visible: boolean
  theme: AICalloutProps['theme']
  accent: string
  duration: number
}) {
  const isStudio = theme === 'studio'
  const highlight = line.active && visible
  const textColor =
    line.kind === 'done'
      ? accent
      : isStudio
        ? 'var(--color-text-on-inverse)'
        : 'var(--color-text-body)'

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : isStudio ? 0 : 4 }}
      transition={{ duration, ease: EASE }}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        paddingTop: isStudio ? 2 : 5,
        paddingBottom: isStudio ? 2 : 5,
        paddingLeft: 12 + line.depth * 18,
        paddingRight: 12,
        background: highlight
          ? isStudio
            ? 'color-mix(in oklab, var(--color-secondary) 16%, transparent)'
            : 'color-mix(in oklab, var(--color-quaternary) 10%, transparent)'
          : 'transparent',
        borderLeft: highlight ? `2px solid ${accent}` : '2px solid transparent',
        fontFamily: 'var(--font-mono)',
        fontSize: isStudio ? '0.8125rem' : '0.875rem',
        lineHeight: 1.5,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          color:
            line.kind === 'agent' || line.kind === 'done' || line.depth >= 1 ? accent : textColor,
          flexShrink: 0,
        }}
      >
        {line.glyph}
      </span>
      <span style={{ color: textColor, fontWeight: line.kind === 'done' ? 600 : 400 }}>
        {line.text}
        {line.illustrative && (
          <span
            aria-hidden="true"
            style={{ marginLeft: 8, opacity: 0.6, color: 'var(--color-text-muted)' }}
          >
            {'// illustrative'}
          </span>
        )}
      </span>
    </motion.div>
  )
}

function StudioChrome({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(242, 236, 219, 0.14)',
      }}
    >
      <span style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'rgba(242, 236, 219, 0.28)',
            }}
          />
        ))}
      </span>
      <span
        style={{
          marginLeft: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: accent,
        }}
      >
        digitribe-mcp
      </span>
    </div>
  )
}

export function AICallout({ theme }: AICalloutProps) {
  const reduced = useReducedMotion() ?? false
  const [paused, setPaused] = React.useState(false)
  const visibleCount = useScriptCycle(theme, reduced, paused)
  const accent = laneAccent(theme)
  const isStudio = theme === 'studio'

  const hoverHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  }

  const rows = (
    <>
      {SCRIPT.map((line, i) => (
        <ScriptRow
          key={i}
          line={line}
          visible={i < visibleCount}
          theme={theme}
          accent={accent}
          duration={isStudio ? TIMING.studio.lineDuration : TIMING.garden.lineDuration}
        />
      ))}
    </>
  )

  return (
    <section
      style={{
        background: 'var(--color-bg-page)',
        paddingTop: 'var(--space-section-md, 4rem)',
        paddingBottom: 'var(--space-section-md, 4rem)',
      }}
    >
      <Container>
        <p className="sr-only">{SUMMARY}</p>

        <div className="mb-8 max-w-xl">
          {isStudio ? (
            <span
              className="mb-4 inline-block"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: accent,
                border: `1.5px solid ${accent}`,
                padding: '5px 10px',
              }}
            >
              /// the differentiator — live
            </span>
          ) : (
            <span
              className="mb-3 block"
              style={{
                fontFamily: 'var(--font-accent)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 24, 'wght' 500",
                fontSize: '1rem',
                color: accent,
              }}
            >
              — the part that feels like the future
            </span>
          )}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--display-sm)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-display)',
              color: 'var(--color-text-primary)',
              fontWeight: isStudio ? 800 : undefined,
            }}
          >
            {isStudio
              ? 'Your store, your ads, and an agent — one loop.'
              : 'The agents and MCP servers your roadmap needs.'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {isStudio
              ? 'We wire your store, your ad accounts, and a task-specific agent into one loop — built on Claude with real evals and guardrails.'
              : 'Custom MCP servers and production agents on Claude — built to product standards, the same way we built the assistant on this page.'}
          </p>
        </div>

        {isStudio ? (
          <div
            {...hoverHandlers}
            aria-hidden="true"
            style={{
              maxWidth: 560,
              background: 'var(--color-bg-inverse)',
              border: `1px solid ${accent}`,
              borderRadius: 'var(--radius-theme-md)',
              overflow: 'hidden',
              boxShadow: '6px 6px 0 var(--color-border)',
            }}
          >
            <StudioChrome accent={accent} />
            <div style={{ padding: '12px 0' }}>
              {rows}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                  paddingTop: 4,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: accent,
                  }}
                >
                  ▷
                </span>
                <BlinkingCursor color="var(--color-text-on-inverse)" />
              </div>
            </div>
          </div>
        ) : (
          <div {...hoverHandlers} style={{ maxWidth: 580 }}>
            <p
              aria-hidden="true"
              className="mb-4"
              style={{
                fontFamily: 'var(--font-accent)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 40, 'wght' 500",
                fontSize: '1.0625rem',
                color: 'var(--color-text-muted)',
              }}
            >
              — how we think about your stack
            </p>
            <div
              aria-hidden="true"
              style={{
                background: 'var(--color-bg-card-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-theme-md)',
                padding: '18px 6px',
                boxShadow: '0 8px 30px -6px rgba(45, 36, 24, 0.1)',
              }}
            >
              {rows}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
