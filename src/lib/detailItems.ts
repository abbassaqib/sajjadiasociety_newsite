import { urlFor } from "@/lib/sanity";

/**
 * Turns Sanity announcements and programs into one common shape,
 * so every page shows them through the same details view.
 * Runs at build time only.
 */

// Fields to fetch — shared by every query and page
export const ANNOUNCEMENT_FIELDS = `_id, title, slug, category, publishDate, expiryDate, isPinned, body, image`;
export const EVENT_FIELDS = `_id, title, slug, type, isRecurring, recurrencePattern, startDate, endDate, location, locationAddress, speaker, description, image, registrationRequired, registrationLink`;

// Vercel builds run in UTC — always format in the mosque's time zone
const TZ = "America/Los_Angeles";

export type DetailKind = "announcement" | "event";

export interface DetailItem {
  id: string;
  kind: DetailKind;
  path: string;
  title: string;
  category: string;
  summary: string;
  metaDescription: string;
  bodyHtml: string;
  plainText: string;
  imageThumb?: string;
  imageFull?: string;
  imageOg?: string;
  imageAlt: string;
  // events
  dateLabel?: string;
  timeLabel?: string;
  shortDate?: { dow: string; day: string; month: string };
  startISO?: string;
  endISO?: string;
  isPast?: boolean;
  recurrence?: string;
  location?: string;
  locationAddress?: string;
  mapsUrl?: string;
  speaker?: string;
  registrationLink?: string;
  // announcements
  postedLabel?: string;
  isPinned?: boolean;
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  jummah: "Jummah",
  lecture: "Lecture",
  special_event: "Special event",
  quran_class: "Quran class",
  youth: "Youth",
  community_service: "Community service",
  islamic_occasion: "Islamic occasion",
};

const ANNOUNCEMENT_LABEL: Record<string, string> = {
  general: "General",
  jummah: "Jummah",
  program: "Program",
  campaign: "Campaign",
  community: "Community",
  islamic_occasion: "Islamic occasion",
};

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(new Date(iso));
}

function sameDay(a: string, b: string) {
  const o: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
  return fmt(a, o) === fmt(b, o);
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : max).trimEnd() + "…";
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Escaped so text typed in Sanity can never inject markup into the page
export function portableTextToHtml(blocks: any[] = []): string {
  let html = "";
  let openList: "ul" | "ol" | null = null;

  for (const block of blocks ?? []) {
    if (block?._type !== "block") continue;
    const markDefs = block.markDefs ?? [];

    const text = (block.children ?? [])
      .map((child: any) => {
        let t = escapeHtml(child.text ?? "").replace(/\n/g, "<br>");
        for (const mark of child.marks ?? []) {
          if (mark === "strong") t = `<strong>${t}</strong>`;
          else if (mark === "em") t = `<em>${t}</em>`;
          else {
            const def = markDefs.find((d: any) => d._key === mark);
            if (def?._type === "link" && def.href) {
              t = `<a href="${escapeHtml(def.href)}" target="_blank" rel="noopener noreferrer">${t}</a>`;
            }
          }
        }
        return t;
      })
      .join("");

    if (block.listItem) {
      const tag = block.listItem === "number" ? "ol" : "ul";
      if (openList !== tag) {
        if (openList) html += `</${openList}>`;
        html += `<${tag}>`;
        openList = tag;
      }
      html += `<li>${text}</li>`;
      continue;
    }
    if (openList) {
      html += `</${openList}>`;
      openList = null;
    }
    if (!text.trim()) continue;

    const style = block.style ?? "normal";
    if (/^h[1-4]$/.test(style)) html += `<h3>${text}</h3>`;
    else if (style === "blockquote") html += `<blockquote>${text}</blockquote>`;
    else html += `<p>${text}</p>`;
  }
  if (openList) html += `</${openList}>`;
  return html;
}

export function portableTextToPlain(blocks: any[] = []): string {
  return (blocks ?? [])
    .filter((b: any) => b?._type === "block")
    .map((b: any) => (b.children ?? []).map((c: any) => c.text ?? "").join(""))
    .filter((t: string) => t.trim())
    .join("\n\n");
}

function imageFields(image: any, title: string) {
  if (!image?.asset) return { imageAlt: "" };
  return {
    imageThumb: urlFor(image).width(240).height(240).fit("crop").auto("format").url(),
    imageFull: urlFor(image).width(1600).fit("max").auto("format").url(),
    imageOg: urlFor(image).width(1200).fit("max").auto("format").url(),
    imageAlt: image.alt ?? `Flyer for ${title}`,
  };
}

export function eventToItem(p: any): DetailItem {
  const slug = p.slug?.current ?? p._id;
  const title = p.title ?? "Untitled event";
  const start: string | undefined = p.startDate;
  const end: string | undefined = p.endDate;

  let dateLabel = start ? fmt(start, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : undefined;
  let timeLabel = start ? fmt(start, { hour: "numeric", minute: "2-digit" }) : undefined;
  if (start && end) {
    if (sameDay(start, end)) {
      timeLabel = `${timeLabel} – ${fmt(end, { hour: "numeric", minute: "2-digit" })}`;
    } else {
      dateLabel = `${fmt(start, { month: "long", day: "numeric" })} – ${fmt(end, { month: "long", day: "numeric", year: "numeric" })}`;
    }
  }

  const where = [p.location, p.locationAddress].filter(Boolean).join(", ");
  const plain = portableTextToPlain(p.description);
  const whenLine = [dateLabel, timeLabel].filter(Boolean).join(" at ");
  const summary = [timeLabel, p.location].filter(Boolean).join(", ");

  return {
    id: `event-${slug}`,
    kind: "event",
    path: `/programs/${slug}`,
    title,
    category: EVENT_TYPE_LABEL[p.type] ?? "Event",
    summary,
    metaDescription: truncate([whenLine, p.location, plain].filter(Boolean).join(". "), 160),
    bodyHtml: portableTextToHtml(p.description),
    plainText: plain,
    ...imageFields(p.image, title),
    dateLabel,
    timeLabel,
    shortDate: start
      ? { dow: fmt(start, { weekday: "short" }), day: fmt(start, { day: "numeric" }), month: fmt(start, { month: "short" }) }
      : undefined,
    startISO: start,
    endISO: end ?? (start ? new Date(new Date(start).getTime() + 2 * 3600 * 1000).toISOString() : undefined),
    isPast: start ? new Date(end ?? start) < new Date() : false,
    recurrence: p.isRecurring ? p.recurrencePattern || "Repeats regularly" : undefined,
    location: p.location || undefined,
    locationAddress: p.locationAddress || undefined,
    mapsUrl: where ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}` : undefined,
    speaker: p.speaker || undefined,
    registrationLink: p.registrationRequired && p.registrationLink ? p.registrationLink : undefined,
  };
}

export function announcementToItem(a: any): DetailItem {
  const slug = a.slug?.current ?? a._id;
  const title = a.title ?? "Announcement";
  const plain = portableTextToPlain(a.body);
  const postedLabel = a.publishDate ? fmt(a.publishDate, { month: "long", day: "numeric", year: "numeric" }) : undefined;

  return {
    id: `announcement-${slug}`,
    kind: "announcement",
    path: `/announcements/${slug}`,
    title,
    category: ANNOUNCEMENT_LABEL[a.category] ?? "Announcement",
    summary: truncate(plain, 110),
    metaDescription: truncate(plain || title, 160),
    bodyHtml: portableTextToHtml(a.body),
    plainText: plain,
    ...imageFields(a.image, title),
    postedLabel,
    isPinned: Boolean(a.isPinned),
  };
}
