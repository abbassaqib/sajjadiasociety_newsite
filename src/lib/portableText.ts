/**
 * Turns Sanity rich text (Portable Text) into HTML for `set:html`.
 *
 * Handles paragraphs, headings, bold, italic, links, bullet and numbered
 * lists, and inline images. All text is escaped, so a stray "<" or "&"
 * typed in Sanity can't break the page.
 *
 * Used by the Sajjadia Mosque page, and by About Us from Phase 6B.
 */
import { urlFor } from "@/lib/sanity";

export interface PortableTextClasses {
  p: string;
  h3?: string;
  h4?: string;
  ul?: string;
  ol?: string;
  li?: string;
  link?: string;
  /** Leave out to skip images in the text */
  img?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SAFE_HREF = /^(https?:|mailto:|tel:|\/)/;

function renderSpans(block: any, linkClass = ""): string {
  const markDefs: any[] = block.markDefs ?? [];

  return (block.children ?? [])
    .map((child: any) => {
      let text = escapeHtml(child.text ?? "");

      for (const mark of child.marks ?? []) {
        if (mark === "strong") {
          text = `<strong>${text}</strong>`;
        } else if (mark === "em") {
          text = `<em>${text}</em>`;
        } else {
          const def = markDefs.find((d) => d._key === mark);
          if (def?._type === "link" && typeof def.href === "string" && SAFE_HREF.test(def.href)) {
            const external = /^https?:/.test(def.href);
            const target = external ? ' target="_blank" rel="noopener noreferrer"' : "";
            text = `<a href="${escapeHtml(def.href)}" class="${linkClass}"${target}>${text}</a>`;
          }
        }
      }

      return text;
    })
    .join("");
}

export function portableTextToHtml(
  blocks: any[] | null | undefined,
  classes: PortableTextClasses,
): string {
  if (!Array.isArray(blocks)) return "";

  const out: string[] = [];
  let openList: "ul" | "ol" | null = null;

  const closeList = () => {
    if (openList) {
      out.push(`</${openList}>`);
      openList = null;
    }
  };

  for (const block of blocks) {
    // Inline image
    if (block?._type === "image") {
      closeList();
      if (classes.img && block.asset) {
        const src = urlFor(block).width(1200).auto("format").url();
        const alt = escapeHtml(block.alt ?? "");
        out.push(`<img src="${src}" alt="${alt}" class="${classes.img}" loading="lazy" decoding="async" />`);
      }
      continue;
    }

    if (block?._type !== "block") {
      closeList();
      continue;
    }

    const html = renderSpans(block, classes.link);
    if (!html.trim()) {
      closeList();
      continue;
    }

    // Bullet and numbered lists (nested levels are shown flat)
    if (block.listItem) {
      const tag = block.listItem === "number" ? "ol" : "ul";
      if (openList !== tag) {
        closeList();
        out.push(`<${tag} class="${(tag === "ol" ? classes.ol : classes.ul) ?? ""}">`);
        openList = tag;
      }
      out.push(`<li class="${classes.li ?? ""}">${html}</li>`);
      continue;
    }

    closeList();

    if (["h1", "h2", "h3"].includes(block.style) && classes.h3) {
      out.push(`<h3 class="${classes.h3}">${html}</h3>`);
    } else if (block.style === "h4" && classes.h4) {
      out.push(`<h4 class="${classes.h4}">${html}</h4>`);
    } else {
      out.push(`<p class="${classes.p}">${html}</p>`);
    }
  }

  closeList();
  return out.join("");
}
