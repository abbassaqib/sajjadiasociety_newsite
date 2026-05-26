import { getEntry } from "astro:content";

export const siteConfig = await getEntry("config", "siteconfig");