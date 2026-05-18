export interface BlogPost {
  id: string;
  data: {
    title: string;
    description: string;
    date: string;
    image: string;
  };
  Content: any;
  headings: Array<{ depth: number; slug: string; text: string }>;
}

export async function getLocalBlogPosts(): Promise<BlogPost[]> {
  // Use Vite's native glob to scan the directory directly
  const modules = import.meta.glob('../content/blog/**/*.{md,mdx}');
  const posts: BlogPost[] = [];

  for (const path in modules) {
    const mod = (await modules[path]()) as any;

    // Extract the filename without the extension to act as our clean ID/Slug
    const id = path.split('/').pop()?.replace(/\.(md|mdx)$/, '') || '';

    posts.push({
      id,
      data: mod.frontmatter,
      Content: mod.default,
      headings: mod.getHeadings ? mod.getHeadings() : [],
    });
  }

  // Sort descending (newest posts first)
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}