export type ServiceCategory = 'build' | 'grow' | 'design' | 'automate'

export type Service = {
  slug: string
  name: string
  category: ServiceCategory
  oneLiner: string
  description: string
  scope: string[]
  timeline: string
  startingPriceEur: number
  ceilingPriceEur?: number
  startingPriceUsd: number
  ceilingPriceUsd?: number
  recurring: boolean
}

export const services: Service[] = [
  {
    slug: 'landing-page-sprint',
    name: 'Landing Page Sprint',
    category: 'build',
    oneLiner: 'A single high-converting page, designed and built in two weeks.',
    description:
      'Ideal for product launches, campaign pages, or testing a new offer. We design and build from scratch — copy-ready, mobile-first, Lighthouse-clean.',
    scope: [
      'One-page design (Figma) + full build',
      'Mobile-first, responsive at all breakpoints',
      'Lighthouse ≥95 performance',
      'Basic analytics setup',
      '2 rounds of copy/design revisions',
      '2 weeks post-launch support',
    ],
    timeline: '2 weeks',
    startingPriceEur: 1800,
    startingPriceUsd: 2000,
    recurring: false,
  },
  {
    slug: 'marketing-site',
    name: 'Marketing Site',
    category: 'build',
    oneLiner: 'A 5–7 page site that converts. Built to perform, not just look good.',
    description:
      'For brands that need a credibility-grade marketing presence. We handle design, copy architecture, build, and deployment — you get a site that loads fast and converts.',
    scope: [
      '5–7 pages (Home, About, Services, Contact, etc.)',
      'Full design in Figma before build',
      'Next.js or Webflow (your choice)',
      'CMS integration (if needed)',
      'Analytics, sitemap, and OG images',
      '30 days post-launch support',
    ],
    timeline: '4–6 weeks',
    startingPriceEur: 4500,
    ceilingPriceEur: 10000,
    startingPriceUsd: 5000,
    ceilingPriceUsd: 11000,
    recurring: false,
  },
  {
    slug: 'shopify-build',
    name: 'Shopify Build',
    category: 'build',
    oneLiner: 'Product-grade Shopify builds — custom theme or Shopify Plus migration.',
    description:
      "We build Shopify stores that perform. Whether it's a custom theme from scratch, a performance-focused rebuild, or a Shopify Plus migration, we handle the full SDLC.",
    scope: [
      'Custom theme development or existing theme customization',
      'Shopify Plus migration (if needed)',
      'Product page optimization for conversion',
      'Cart and checkout refinement',
      'Speed optimization (LCP ≤1.5s target)',
      'App integrations (Klaviyo, Yotpo, Recharge, etc.)',
      '30 days post-launch support',
    ],
    timeline: '4–8 weeks',
    startingPriceEur: 5500,
    ceilingPriceEur: 15000,
    startingPriceUsd: 6000,
    ceilingPriceUsd: 17000,
    recurring: false,
  },
  {
    slug: 'custom-web-app',
    name: 'Custom Web App',
    category: 'build',
    oneLiner: 'Next.js or React apps built at product-org standards.',
    description:
      'For founders who need more than a marketing site. We design and build web apps with the same engineering standards we used inside large product organizations.',
    scope: [
      'Full-stack Next.js or React SPA',
      'TypeScript strict — no shortcuts',
      'Auth, database, and API design',
      'Component library setup',
      'CI/CD pipeline and deployment',
      'Documentation and handoff',
    ],
    timeline: '6–14 weeks',
    startingPriceEur: 9000,
    ceilingPriceEur: 40000,
    startingPriceUsd: 10000,
    ceilingPriceUsd: 44000,
    recurring: false,
  },
  {
    slug: 'automation-workflow',
    name: 'Automation Workflow',
    category: 'automate',
    oneLiner: 'AI-native automation workflows that save your team real hours every week.',
    description:
      'We build the internal automations that agencies charge a premium for and then call "AI strategy." Weekly reporting, lead scoring, content pipelines, client comms — built and documented so your team can run them.',
    scope: [
      'Automation audit (what to build first)',
      'Full workflow design and build',
      'Integration with your existing stack',
      'Documentation and training',
      'Handoff to your team',
    ],
    timeline: '1–3 weeks',
    startingPriceEur: 1500,
    ceilingPriceEur: 8000,
    startingPriceUsd: 1700,
    ceilingPriceUsd: 9000,
    recurring: false,
  },
  {
    slug: 'ai-readiness-sprint',
    name: 'AI Readiness Sprint',
    category: 'automate',
    oneLiner: 'A focused audit of where AI agents and MCP create real ROI — with a build roadmap.',
    description:
      'One week to map where AI actually earns its keep in your business. We audit your tools, data, and workflows, then deliver a prioritized roadmap of agent and MCP opportunities scored by effort and impact — no hype, just what is worth building.',
    scope: [
      'Workflow + tooling audit (where AI fits, where it does not)',
      'Agent + MCP opportunity map, scored by effort/impact',
      'Recommended architecture and model choices',
      'Prioritized build roadmap with rough costs',
      'Optional: we build the first one (credited toward the build)',
    ],
    timeline: '1 week',
    startingPriceEur: 1500,
    startingPriceUsd: 1700,
    recurring: false,
  },
  {
    slug: 'ai-agent-build',
    name: 'AI Agent Development',
    category: 'automate',
    oneLiner:
      'A task-specific AI agent — lead research, support triage, content ops — wired into your stack.',
    description:
      'We design and build a production AI agent that does one job well: lead research, support triage, content operations, internal Q&A over your docs. Built on Claude and the AI SDK with proper evals, guardrails, and observability — not a brittle prompt in a Zapier step.',
    scope: [
      'Use-case scoping and success metrics',
      'Agent design — tools, memory, guardrails',
      'Integration with your stack (CRM, docs, APIs)',
      'Evals and a test harness so quality is measurable',
      'Deployment, monitoring, and team handoff',
    ],
    timeline: '3–8 weeks',
    startingPriceEur: 6000,
    ceilingPriceEur: 25000,
    startingPriceUsd: 6500,
    ceilingPriceUsd: 28000,
    recurring: false,
  },
  {
    slug: 'mcp-server-build',
    name: 'Custom MCP Server',
    category: 'automate',
    oneLiner:
      'A bespoke MCP server that connects your tools and data to Claude, Cursor, and any AI client.',
    description:
      'We build a Model Context Protocol server that exposes your internal tools, data, and actions to any MCP-compatible AI client — Claude, Cursor, or your own agents. Typed tool definitions, auth done right, and a codebase your team can extend without reverse-engineering it.',
    scope: [
      'MCP server in Node + TypeScript (tools, resources, prompts)',
      'Auth and secrets handled to production standard',
      'Zod-validated tool args at every boundary',
      'Local + remote (HTTP) transport setup',
      'Documentation and handoff to your team',
    ],
    timeline: '2–4 weeks',
    startingPriceEur: 4500,
    ceilingPriceEur: 14000,
    startingPriceUsd: 5000,
    ceilingPriceUsd: 15000,
    recurring: false,
  },
  {
    slug: 'meta-ads',
    name: 'Meta Ads Management',
    category: 'grow',
    oneLiner: 'Paid social that pays for itself. Monthly management, weekly reporting.',
    description:
      'We run Meta campaigns for DTC and SaaS brands. Strategy, creative briefs, audience architecture, testing frameworks, and weekly optimization — all managed by someone who does this at operator level, not as a managed service checkbox.',
    scope: [
      'Campaign strategy and architecture',
      'Creative briefs (your team or ours)',
      'Weekly optimization and reporting',
      'A/B testing framework',
      'Attribution setup (if needed)',
      'Monthly strategy call',
    ],
    timeline: 'Ongoing (3-month minimum)',
    startingPriceEur: 1800,
    ceilingPriceEur: 4000,
    startingPriceUsd: 2000,
    ceilingPriceUsd: 4500,
    recurring: true,
  },
  {
    slug: 'google-ads',
    name: 'Google Ads Management',
    category: 'grow',
    oneLiner: 'Search and Shopping campaigns managed by someone who reads the data.',
    description:
      "We manage Google Search, Shopping, and Performance Max campaigns. We set up conversion tracking properly, optimize for real revenue metrics, and tell you the truth about what's working.",
    scope: [
      'Campaign structure and keyword strategy',
      'Ad copy and extension setup',
      'Conversion tracking verification',
      'Weekly bid optimization',
      'Monthly reporting and strategy call',
    ],
    timeline: 'Ongoing (3-month minimum)',
    startingPriceEur: 1800,
    ceilingPriceEur: 4000,
    startingPriceUsd: 2000,
    ceilingPriceUsd: 4500,
    recurring: true,
  },
  {
    slug: 'seo-audit',
    name: 'SEO Audit + Optimization',
    category: 'grow',
    oneLiner: 'A real SEO audit — technical, on-page, and content — with a fix plan.',
    description:
      'We audit your site end-to-end: technical health, on-page signals, content gaps, and backlink profile. You get a prioritized punch list and the option to have us implement the fixes.',
    scope: [
      'Technical SEO audit (Core Web Vitals, crawl, index)',
      'On-page audit (meta, heading structure, internal linking)',
      'Content gap analysis vs. top 3 competitors',
      'Prioritized fix list with effort/impact scoring',
      'Implementation (optional add-on)',
    ],
    timeline: '3 weeks',
    startingPriceEur: 2200,
    startingPriceUsd: 2500,
    recurring: false,
  },
  {
    slug: 'content-calendar',
    name: 'Content Calendar + Social',
    category: 'grow',
    oneLiner: 'A monthly content operation — strategy, calendar, and distribution.',
    description:
      'We plan and manage a monthly content operation for LinkedIn, Twitter/X, and email. Strategy, calendar, copy briefs, and distribution — aligned with your paid acquisition so everything tells the same story.',
    scope: [
      'Content strategy and ICP messaging',
      'Monthly editorial calendar',
      'Copy briefs (your team writes) or copy (we write)',
      'LinkedIn + Twitter/X scheduling',
      'Monthly performance review',
    ],
    timeline: 'Ongoing (3-month minimum)',
    startingPriceEur: 1800,
    startingPriceUsd: 2000,
    recurring: true,
  },
  {
    slug: 'design-sprint',
    name: 'Design Sprint',
    category: 'design',
    oneLiner: 'Focused design work — brand refresh, UX audit, or visual system.',
    description:
      "One to four weeks of focused design work. Whether it's a brand identity refresh, a UX audit of your product, a new visual system, or a suite of ad creatives — we lead it design-systems-first, research before pixels.",
    scope: [
      'Scope aligned to your need in kickoff',
      'Delivered in Figma with handoff-ready specs',
      'Feedback loops every 2–3 days',
      'Final assets exported and documented',
    ],
    timeline: '1–4 weeks',
    startingPriceEur: 1500,
    ceilingPriceEur: 6000,
    startingPriceUsd: 1700,
    ceilingPriceUsd: 7000,
    recurring: false,
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug)
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return services.filter((s) => s.category === category)
}
