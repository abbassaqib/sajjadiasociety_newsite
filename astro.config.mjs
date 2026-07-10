// @ts-check
// deploy adapter
import vercel from '@astrojs/vercel';
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import reactCompilerPlugin from "babel-plugin-react-compiler";

const SITE_URL =
  process.env["CONTEXT"] === "production"
    ? process.env["URL"]
    : process.env["DEPLOY_PRIME_URL"];

export default defineConfig({
  site: SITE_URL ?? "http://localhost:4321",
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
      name: "Poppins",
      cssVariable: "--font-poppins",
      provider: fontProviders.google(),
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
