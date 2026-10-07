// Our Story was merged into About Us (Phase 6B). This sends old links and
// search results to the story section there, with or without a trailing slash.
import type { APIRoute } from 'astro'

export const prerender = false

export const ALL: APIRoute = ({ redirect }) => redirect('/about-us#our-story', 301)
