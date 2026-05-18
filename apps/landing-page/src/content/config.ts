import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    image: z.string(),
  }),
});

export const collections = { blog };
