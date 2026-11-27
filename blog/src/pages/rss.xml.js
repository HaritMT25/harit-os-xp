import rss from '@astrojs/rss'
import { publishedPosts, slugOf, url, SITE_TITLE, SITE_TAGLINE } from '../lib/site.js'

export async function GET(context) {
  const posts = await publishedPosts()
  return rss({
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    site: context.site,
    trailingSlash: true,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      categories: post.data.tags,
      link: url(`${slugOf(post)}/`),
    })),
  })
}
