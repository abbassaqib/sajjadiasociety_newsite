import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const siteConfig = defineCollection({
  loader: glob({
    pattern: "site.config.json",
    base: "./src/content-collections/",
  }),
  schema: z.object({
    general: z.object({
      name: z.string(),
      description: z.string(),
      logo: z.string().optional(),
      youtube: z.string().optional(),
    }),
    header: z
      .object({
        displayTitle: z.boolean(),
        displayLogo: z.boolean(),
      })
      .optional(),
    body: z
      .object({
        hero: z
          .object({
            text: z.string(),
            bgImage: z.string().optional(),
          })
          .optional(),
        cta: z
          .object({
            text: z.string().optional(),
            link: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    footer: z
      .object({
        left: z
          .object({
            sections: z
              .array(
                z.object({
                  heading: z.string().optional(),
                  description: z.string().optional(),
                }),
              )
              .optional(),
            social: z
              .array(
                z.object({
                  name: z.string(),
                  icon: z.string(),
                  link: z.string(),
                  hint: z.string().optional(),
                }),
              )
              .optional(),
          })
          .optional(),
        form: z
          .object({
            isActive: z.boolean(),
            heading: z.string().optional(),
            description: z.string().optional(),
          })
          .optional(),
        give: z
          .object({
            isActive: z.boolean(),
            heading: z.string().optional(),
            description: z.string().optional(),
            link: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    theme: z
      .object({
        colorScheme: z.string(),
        customCSS: z.string().optional(),
      })
      .optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content-collections/pages" }),
  schema: z.object({
    title: z.string(),
    order: z.number().optional(),
    type: z.enum(["blog", "events", "sermons"]).optional(),
  }),
});

export const collections = {
  config: siteConfig,
  pages: pagesCollection,
};