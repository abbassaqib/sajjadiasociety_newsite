// @ts-check
// deploy adapter
import vercel from '@astrojs/vercel';
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import reactCompilerPlugin from "babel-plugin-react-compiler";

export default defineConfig({
  site: "https://sajjadiamosque.org",
  redirects: {
    '/announcements': '/news-events',
    '/programs': '/news-events',
    '/programs/announcements': '/news-events',
    '/programs/events': '/news-events',
    '/about-us/mission': '/about-us',
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
    react({
      babel: {
        plugins: [reactCompilerPlugin],
      },
    }),
    sitemap(),
  ],
  adapter: vercel(),
});
