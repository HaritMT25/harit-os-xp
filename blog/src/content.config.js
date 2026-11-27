import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Matches the fields in /.pages.yml. Pages CMS may write an emptied field as
// null or "", so every optional field accepts both.
const list = item => z.array(item).nullish().transform(v => (v ?? []).filter(x => x != null && x !== ''))

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().nullish().transform(v => v ?? ''),
    tags: list(z.string()),
    cover: z.string().nullish().transform(v => v || null),
    cover_alt: z.string().nullish().transform(v => v ?? ''),
    draft: z.boolean().nullish().transform(v => !!v),
    tiers: list(z.object({ tier: z.string(), items: list(z.string()) })),
  }),
})

export const collections = { posts }
