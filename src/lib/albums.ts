/**
 * Helpers for photo and video albums from Sanity.
 * Used by PhotoGallery, AlbumBlock and the pages that show albums.
 */
import { urlFor } from "@/lib/sanity";

// Must match the category values in the album schema in Sanity
export const ALBUM_CATEGORIES = {
  programs: "Community programs",
  property: "The property today",
  renderings: "Concept renderings",
  construction: "Construction",
} as const;

export type AlbumCategory = keyof typeof ALBUM_CATEGORIES;

export interface AlbumPhoto {
  _key: string;
  caption?: string;
  alt?: string;
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
  hotspot?: unknown;
  asset?: {
    _id: string;
    metadata?: { lqip?: string; dimensions?: { width: number; height: number } };
  };
}

export interface AlbumVideo {
  _key: string;
  url: string;
  title?: string;
}

export interface Album {
  _id: string;
  title: string;
  category: AlbumCategory;
  date?: string;
  description?: string;
  photos?: AlbumPhoto[];
  videos?: AlbumVideo[];
}

// Longest side of the image opened in the full-screen viewer
const FULL_MAX_WIDTH = 2000;

/** Full-size image for the viewer, with its exact pixel size (after any crop set in Sanity). */
export function photoFull(photo: AlbumPhoto): { src: string; width: number; height: number } | null {
  const dims = photo.asset?.metadata?.dimensions;
  if (!dims?.width || !dims?.height) return null;

  const crop = photo.crop ?? {};
  const croppedWidth = dims.width * (1 - (crop.left ?? 0) - (crop.right ?? 0));
  const croppedHeight = dims.height * (1 - (crop.top ?? 0) - (crop.bottom ?? 0));

  const width = Math.round(Math.min(croppedWidth, FULL_MAX_WIDTH));
  const height = Math.round(croppedHeight * (width / croppedWidth));

  return {
    src: urlFor(photo).width(width).auto("format").url(),
    width,
    height,
  };
}

/** Image cropped to width x height around the hotspot set in Sanity, plus a 2x version for sharp screens. */
export function photoCropped(photo: AlbumPhoto, width: number, height: number): { src: string; srcset: string } {
  const small = urlFor(photo).width(width).height(height).fit("crop").auto("format").url();
  const large = urlFor(photo).width(width * 2).height(height * 2).fit("crop").auto("format").url();
  return { src: small, srcset: `${small} ${width}w, ${large} ${width * 2}w` };
}

/** 4:3 grid thumbnail */
export function photoThumb(photo: AlbumPhoto): { src: string; srcset: string } {
  return photoCropped(photo, 600, 450);
}

/** Alt text: the photo's own alt text, then its caption, then the album title. */
export function photoAlt(photo: AlbumPhoto, album: Album, index: number): string {
  const own = photo.alt?.trim() || photo.caption?.trim();
  if (album.category === "renderings") {
    return own ? `Concept rendering: ${own}` : `Concept rendering of the new Sajjadia Mosque, view ${index + 1}`;
  }
  return own || `${album.title}, photo ${index + 1}`;
}

export function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

/** "September 2026" from a Sanity date like "2026-09-14". */
export function formatMonthYear(value?: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00Z`),
  );
}
