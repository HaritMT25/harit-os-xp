import { defineConfig } from 'astro/config'

// The blog is its own static site. `npm run build` builds the XP app into
// dist/ first, then this into dist/blog, and Vercel serves both from one
// project: harit-os-xp.vercel.app/blog/. Posts live in src/content/posts and
// are edited through Pages CMS (see /.pages.yml at the repo root).
export default defineConfig({
  site: 'https://harit-os-xp.vercel.app',
  base: '/blog',
  trailingSlash: 'always',
  outDir: '../dist/blog',
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  devToolbar: { enabled: false },
})
