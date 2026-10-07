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

    // Old WordPress site (sajjadiaislamicsociety.org) pages.
    // Phase 6: point the three campaign pages at the Sajjadia Mosque page.
    '/give/new-location-campaign': '/donate',
    '/new-location-fundraising-campaign': '/donate',
    '/new-location-renovation-campaign': '/donate',
    '/recurring-donations': '/donate',
    '/thank-you': '/',
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
