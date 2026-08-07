// Compatibility exports for older consumers. Managed content lives in PostgreSQL.
export {
  getPublishedPost as getBlog,
  listPublishedPosts,
} from "./blog.repository";
export const plannedTopics = [
  "Full-stack engineering",
  "AI and machine learning",
  "Data science",
  "Creative development",
  "Student engineering experiences",
] as const;
