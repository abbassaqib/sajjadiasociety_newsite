import type { APIRoute } from 'astro'
import { createClient } from '@sanity/client'

export const prerender = false

const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2026-01-01',
  token: import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export const POST: APIRoute = async ({ request }) => {
  try {
    const { fullName, phone } = await request.json()

    if (!fullName || !phone) {
      return new Response(JSON.stringify({ error: 'Name and phone are required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    await sanityClient.create({
      _type: 'subscriber',
      fullName,
      phone,
      submittedAt: new Date().toISOString(),
      status: 'new',
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sajjadia Website <no-reply@sajjadiamosque.org>',
        to: ['info@sajjadiaislamicsociety.org'],
        subject: `New WhatsApp subscriber: ${fullName}`,
        html: `
          <h2>New WhatsApp Group Request</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p>Please add this person to the Sajjadia WhatsApp group.</p>
          <hr/>
          <p style="color:#666;font-size:12px">
            View all subscribers at <a href="https://sajjadia-cms.sanity.studio">sajjadia-cms.sanity.studio</a>
            → WhatsApp Subscribers. Mark as "Added" once done.
          </p>
        `,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Subscribe error:', err)
    return new Response(JSON.stringify({ error: 'Something went wrong.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}