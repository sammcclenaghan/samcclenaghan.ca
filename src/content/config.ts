import { defineCollection, z } from "astro:content";

/**
 * Projects collection schema
 *
 * This collection is intended for project markdown files stored under:
 *  - src/content/projects/*.md
 *
 * It validates common frontmatter fields used across the project pages:
 *  - href: optional path/slug used for linking
 *  - title: required project title
 *  - description: short description
 *  - date: freeform string (month/year or ISO) — kept as string to match existing frontmatter
 *  - tech: string or array of strings; coerced to array of strings
 *  - image: local path to image/video preview (allowing paths like "/photograph.png" or "/video.mp4")
 *  - isVideo: whether the `image` is a video preview
 *  - stagger: optional CSS utility name used for stagger animations
 *  - draft / featured: control publishing/visibility
 *  - repo / url: external URLs (validated as URLs if provided)
 *  - tags: optional array of strings
 */

const projects = defineCollection({
  schema: z.object({
    // Required
    title: z.string().min(1, "Project must have a title"),

    // Optional, but commonly used
    href: z.string().optional(), // relative path or slug (e.g. "/projects/gymtrack")
    description: z.string().optional(),

    // Keep date as a string because existing frontmatter uses values like "Jan 2025"
    date: z.string().optional(),

    // Accept either a single string or an array of strings and normalize to an array
    tech: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => {
        if (typeof val === "string") return [val];
        return val;
      })
      .optional(),

    // Local path for image or video preview (do not require full URL)
    image: z.string().optional(),

    // Whether the `image` field points to a video file
    isVideo: z.boolean().optional().default(false),

    // Small util-class used for stagger animations in your UI
    stagger: z.string().optional(),

    // Publishing flags
    draft: z.boolean().optional().default(false),
    featured: z.boolean().optional().default(false),

    // External links — require valid URLs if present
    repo: z.string().url().optional(),
    url: z.string().url().optional(),

    // Tags for filtering / categorization
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  projects,
  work: defineCollection({
    schema: z.object({
      title: z.string().min(1, "Work entry must have a title"),
      role: z.string().optional(),
      description: z.string().optional(),
      // Publishing flags
      draft: z.boolean().optional().default(false),
      featured: z.boolean().optional().default(false),
      date_start: z.string().optional(),
      date_end: z.string().optional(),
    }),
  }),
};
