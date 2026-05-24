import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2026-01-01',
  token: import.meta.env.SANITY_API_TOKEN,
  useCdn: false,
  // useCdn false = always fresh data on build
  // flip to true later if build times get slow
})