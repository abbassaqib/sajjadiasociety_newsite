/**
 * Single source of truth for the site navigation.
 * Used by NavMenu (desktop) and Sidebar (mobile).
 */
export interface NavItem {
  label: string;
  href: string;
  /** Extra path prefixes that should also highlight this item */
  match?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Our Story", href: "/our-story" },
  { label: "News & Events", href: "/news-events", match: ["/programs", "/announcements"] },
  { label: "Support Us", href: "/donate" },
];

export function isCurrentPath(item: NavItem, path?: string): boolean {
  if (!path) return false;
  const clean = path.replace(/\/+$/, "") || "/";
  if (item.href === "/") return clean === "/";
  return [item.href, ...(item.match ?? [])].some((p) => clean === p || clean.startsWith(`${p}/`));
}
