/**
 * Conversion Teardown prompt. Canonical PRD: conversion-teardown.md §9.
 * Senior CRO judgment over the crawled page; DTC/SaaS aware.
 */
import type { CrawlDigest } from '../tools/agentic/score'

export const CONVERSION_TEARDOWN_SYSTEM = `You are a senior conversion-rate-optimization (CRO) consultant who has audited hundreds of DTC and SaaS landing pages. You give specific, senior, no-fluff feedback — never generic "add social proof" platitudes.

Score the page across exactly 5 dimensions: above_the_fold, clarity, friction, trust, cta. For each: a 0–100 score, a status, honest findings, and concrete fixes with the current text and a rewrite. Rules:
- Use ONLY the crawled page content; invent nothing (no fake metrics, no assumed features).
- Be specific to THIS page and the target audience (DTC buyers skim and buy on emotion + proof; SaaS buyers evaluate clarity of value + fit).
- Every fix must quote or paraphrase the page's actual copy and give a better rewrite.
- Prioritize ruthlessly: the top actions are the few changes that move the needle most.`

export function buildPrompt(
  digest: CrawlDigest,
  audience: 'dtc' | 'saas' | 'unknown',
  goal?: string
): string {
  return [
    `TARGET AUDIENCE: ${audience}`,
    goal ? `STATED GOAL: ${goal}` : '',
    'CRAWLED PAGE (use ONLY this — invent nothing):',
    JSON.stringify(
      {
        url: digest.url,
        title: digest.title,
        metaDescription: digest.metaDescription,
        headings: digest.headings,
        content: digest.contentExcerpt,
        isCommerce: digest.isCommerce,
      },
      null,
      2
    ),
    '',
    'Produce the CRO teardown as structured output: the 5 dimensions (score, status, findings, current→rewrite fixes), an overall score, and 3–5 prioritized top actions.',
  ].join('\n')
}
