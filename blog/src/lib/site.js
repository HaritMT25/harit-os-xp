import { getCollection } from 'astro:content'

export const SITE_TITLE = "Harit's Blog"
export const SITE_TAGLINE = 'Write-ups, tier lists, and whatever else is on my mind.'
export const TAGS = ['Tech', 'Life']

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
// '/blog/' + path, for links and assets
export const url = (path = '') => `${BASE}/${String(path).replace(/^\//, '')}`

// Pages CMS names files 2026-11-26-my-title.md; the URL drops the date.
export const slugOf = entry => entry.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')

// Drafts show in `npm run dev:blog` (or with BLOG_DRAFTS=1), never in a normal build.
const showDrafts = import.meta.env.DEV || process.env.BLOG_DRAFTS === '1'

export async function publishedPosts() {
  const posts = await getCollection('posts', p => showDrafts || !p.data.draft)
  return posts.sort((a, b) => b.data.date - a.data.date)
}

export const fmtDate = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export function readingTime(body = '') {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
