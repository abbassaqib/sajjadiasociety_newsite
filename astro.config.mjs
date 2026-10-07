// @ts-check
// deploy adapter
import vercel from '@astrojs/vercel';
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://sajjadiamosque.org",
  redirects: {
    // Template routes folded into other pages
    '/announcements': '/news-events',
    '/programs': '/news-events',
    '/programs/announcements': '/news-events',
    '/programs/events': '/news-events',
    '/about-us/mission': '/about-us',
    '/about-us/faq': '/about-us',

    // Old WordPress site (sajjadiaislamicsociety.org) page.
    // The old pages whose addresses end in a slash are handled by small
    // endpoint files in src/pages instead (see the comment in those files).
    // Phase 6: point the campaign pages at the Sajjadia Mosque page.
    '/give/new-location-campaign': '/donate',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Source Sans 3",
      cssVariable: "--font-source-sans",
      provider: fontProviders.google(),
      weights: [400, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },
    {
      name: "Marcellus",
      cssVariable: "--font-marcellus",
      provider: fontProviders.google(),
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  integrations: [
    react(),
    sitemap(),
  ],
  adapter: vercel(),
});
