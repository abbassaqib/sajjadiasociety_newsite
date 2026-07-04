import { sanityClient } from '@/lib/sanity'

// ── Site Settings ────────────────────────────────────
export async function getSiteSettings() {
  return sanityClient.fetch(`
    *[_type == "siteSettings"][0] {
      name,
      tagline,
      shortDescription,
      heroText,
      displayTitle,
      displayLogo,
      foundedYear,
      ein,
      contact,
      socialMedia,
      locations,
      newsletterHeading,
      newsletterDescription
    }
  `)
}

// ── Prayer Times ─────────────────────────────────────
export async function getPrayerTimesConfig() {
  return sanityClient.fetch(`
    *[_type == "prayerTimes"][0] {
      useAladhanApi,
      calculationMethod,
      location,
      manualOverride,
      jummahDetails,
      notes
    }
  `)
}

// ── Campaign ─────────────────────────────────────────
export async function getCampaign() {
  return sanityClient.fetch(`
    *[_type == "campaign"][0] {
      title,
      tagline,
      isActive,
      goalAmount,
      raisedAmount,
      lastUpdated,
      donorboxLink,
      story,
      milestones,
      callToAction,
      thankYouMessage,
      images[] {
        image,
        caption
      },
      videos[] {
        url,
        title,
        description
      }
    }
  `)
}

// ── Announcements ─────────────────────────────────────
export async function getAnnouncements(limit = 10) {
  return sanityClient.fetch(`
    *[_type == "announcement" && status == "approved"]
    | order(isPinned desc, publishDate desc)
    [0...$limit] {
      _id,
      title,
      slug,
      category,
      publishDate,
      expiryDate,
      isPinned,
      body,
      image
    }
  `, { limit })
}

export async function getAnnouncementBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "announcement"
      && status == "approved"
      && slug.current == $slug][0] {
      _id,
      title,
      slug,
      category,
      publishDate,
      body,
      image
    }
  `, { slug })
}

// ── Programs ──────────────────────────────────────────
export async function getUpcomingPrograms(limit = 10) {
  const now = new Date().toISOString()
  return sanityClient.fetch(`
    *[_type == "program"
      && isPublished == true
      && startDate > $now]
    | order(startDate asc)
    [0...$limit] {
      _id,
      title,
      slug,
      type,
      isRecurring,
      recurrencePattern,
      startDate,
      endDate,
      location,
      speaker,
      description,
      image
    }
  `, { now, limit })
}

export async function getPastPrograms(limit = 20) {
  const now = new Date().toISOString()
  return sanityClient.fetch(`
    *[_type == "program"
      && isPublished == true
      && startDate <= $now]
    | order(startDate desc)
    [0...$limit] {
      _id,
      title,
      slug,
      type,
      startDate,
      location,
      speaker,
      description,
      image
    }
  `, { now, limit })
}

// ── FAQ ───────────────────────────────────────────────
export async function getFAQ() {
  return sanityClient.fetch(`
    *[_type == "faqEntry" && isPublished == true]
    | order(category asc, order asc) {
      _id,
      question,
      answer,
      category,
      order
    }
  `)
}

export async function getChatbotFAQ() {
  // Only entries flagged for chatbot inclusion
  return sanityClient.fetch(`
    *[_type == "faqEntry"
      && isPublished == true
      && includeInChatbot == true]
    | order(category asc, order asc) {
      question,
      answer,
      category
    }
  `)
}

// ── Org Info (for chatbot context) ───────────────────
export async function getOrgInfo() {
  return sanityClient.fetch(`
    *[_type == "orgInfo"][0] {
      mission,
      vision,
      about,
      currentSituation,
      futurePlans,
      denomination,
      nonprofitStatus,
      chatbotPersonality,
      chatbotBoundaries
    }
  `)
}