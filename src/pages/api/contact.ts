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
    const body = await request.json()
    const { name, email, phone, message, turnstileToken } = body

    // ── Validate required fields ──
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email and message are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── Verify Turnstile token ──
    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: import.meta.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    )
    const turnstileData = await turnstileRes.json()

    if (!turnstileData.success) {
      return new Response(JSON.stringify({ error: 'Human verification failed. Please try again.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── Save to Sanity ──
    await sanityClient.create({
      _type: 'contactSubmission',
      name,
      email,
      phone: phone || '',
      message,
      submittedAt: new Date().toISOString(),
      status: 'new',
    })

    // ── Send email notification via Resend ──
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sajjadia Website <onboarding@resend.dev>',
        to: ['info@sajjadiaislamicsociety.org'],
        subject: `New contact form submission from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr/>
          <p style="color:#666;font-size:12px">View all submissions at <a href="https://sajjadia-cms.sanity.studio">sajjadia-cms.sanity.studio</a></p>
        `,
      }),
    })

    if (!resendRes.ok) {
      console.error('Resend error:', await resendRes.text())
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Contact form error:', err)
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}