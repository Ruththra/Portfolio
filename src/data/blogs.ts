export type BlogPost = {
  title: string;
  slug: string;
  summary: string;
  body: readonly string[];
  tags: readonly string[];
  coverImage?: string;
  readingTime: string;
  published: boolean;
  publicationDate?: string;
};

// Add real posts here and set published only when they are publicly ready.
export const blogs: readonly BlogPost[] = [];
export const publishedBlogs = blogs.filter((post) => post.published);
export const getBlog = (slug: string) =>
  publishedBlogs.find((post) => post.slug === slug);
export const plannedTopics = [
  "Full-stack engineering",
  "AI and machine learning",
  "Data science",
  "Creative development",
  "Student engineering experiences",
] as const;
