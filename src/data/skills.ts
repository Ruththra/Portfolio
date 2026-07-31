export type TechnologyId =
  | "python"
  | "typescript"
  | "javascript"
  | "java"
  | "cplusplus"
  | "c"
  | "ballerina"
  | "react"
  | "nextjs"
  | "html5"
  | "css3"
  | "tailwind"
  | "gsap"
  | "nodejs"
  | "express"
  | "fastapi"
  | "rest"
  | "postgresql"
  | "mysql"
  | "mongodb"
  | "firebase"
  | "supabase"
  | "pandas"
  | "numpy"
  | "jupyter"
  | "scikitlearn"
  | "huggingface"
  | "openai"
  | "gemini"
  | "machine-learning"
  | "deep-learning"
  | "computer-vision"
  | "rag"
  | "git"
  | "github"
  | "docker"
  | "linux"
  | "vscode"
  | "vercel"
  | "figma"
  | "photoshop"
  | "illustrator"
  | "canva";

export type Technology = {
  id: TechnologyId;
  name: string;
  color?: string;
  featured?: boolean;
  wide?: boolean;
};

export type TechnologyGroup = {
  id: "languages" | "frontend" | "backend" | "data" | "ai" | "tools";
  title: string;
  technologies: readonly Technology[];
};

export const capabilityPaths = [
  {
    title: "Software Engineering",
    description:
      "Building maintainable applications, APIs, and responsive product experiences.",
  },
  {
    title: "AI & Machine Learning",
    description:
      "Developing intelligent workflows, models, and AI-powered application features.",
  },
  {
    title: "Data Science & Analytics",
    description:
      "Transforming structured and unstructured data into useful insights and decisions.",
  },
] as const;

export const technologyGroups: readonly TechnologyGroup[] = [
  {
    id: "languages",
    title: "Languages",
    technologies: [
      { id: "python", name: "Python", color: "#3776ab", featured: true },
      {
        id: "typescript",
        name: "TypeScript",
        color: "#3178c6",
        featured: true,
      },
      { id: "javascript", name: "JavaScript", color: "#f7df1e" },
      { id: "java", name: "Java", color: "#f89820" },
      { id: "cplusplus", name: "C++", color: "#659ad2" },
      { id: "c", name: "C", color: "#a8b9cc" },
      { id: "ballerina", name: "Ballerina", color: "#20b6b0" },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    technologies: [
      { id: "react", name: "React", color: "#61dafb", featured: true },
      { id: "nextjs", name: "Next.js", color: "#ffffff", featured: true },
      { id: "html5", name: "HTML5", color: "#e34f26" },
      { id: "css3", name: "CSS3", color: "#663399" },
      { id: "tailwind", name: "Tailwind CSS", color: "#06b6d4" },
      { id: "gsap", name: "GSAP", color: "#88ce02" },
    ],
  },
  {
    id: "backend",
    title: "Backend & APIs",
    technologies: [
      { id: "nodejs", name: "Node.js", color: "#5fa04e" },
      { id: "express", name: "Express.js", color: "#ffffff" },
      { id: "fastapi", name: "FastAPI", color: "#009688", featured: true },
      { id: "rest", name: "REST APIs", color: "#35d4ff" },
    ],
  },
  {
    id: "data",
    title: "Data & Databases",
    technologies: [
      {
        id: "postgresql",
        name: "PostgreSQL",
        color: "#4169e1",
        featured: true,
      },
      { id: "mysql", name: "MySQL", color: "#4479a1" },
      { id: "mongodb", name: "MongoDB", color: "#47a248" },
      { id: "firebase", name: "Firebase", color: "#ffca28" },
      { id: "supabase", name: "Supabase", color: "#3fcf8e" },
      { id: "pandas", name: "Pandas", color: "#e70488" },
      { id: "numpy", name: "NumPy", color: "#4dabcf" },
      { id: "jupyter", name: "Jupyter", color: "#f37626" },
    ],
  },
  {
    id: "ai",
    title: "AI & Machine Learning",
    technologies: [
      {
        id: "scikitlearn",
        name: "Scikit-learn",
        color: "#f7931e",
        featured: true,
      },
      { id: "huggingface", name: "Hugging Face", color: "#ffd21e" },
      { id: "openai", name: "OpenAI", color: "#74aa9c" },
      { id: "gemini", name: "Gemini", color: "#8e75ff" },
      {
        id: "machine-learning",
        name: "Machine Learning",
        color: "#35d4ff",
        wide: true,
      },
      { id: "deep-learning", name: "Deep Learning", color: "#48a7ff" },
      { id: "computer-vision", name: "Computer Vision", color: "#35d4ff" },
      { id: "rag", name: "RAG Systems", color: "#48a7ff" },
    ],
  },
  {
    id: "tools",
    title: "Tools, Cloud & Design",
    technologies: [
      { id: "git", name: "Git", color: "#f05032", featured: true },
      { id: "github", name: "GitHub", color: "#ffffff" },
      { id: "docker", name: "Docker", color: "#2496ed" },
      { id: "linux", name: "Linux", color: "#fcc624" },
      {
        id: "vscode",
        name: "Visual Studio Code",
        color: "#23a8f2",
        wide: true,
      },
      { id: "vercel", name: "Vercel", color: "#ffffff" },
      { id: "figma", name: "Figma", color: "#a259ff" },
      {
        id: "photoshop",
        name: "Adobe Photoshop",
        color: "#31a8ff",
        wide: true,
      },
      {
        id: "illustrator",
        name: "Adobe Illustrator",
        color: "#ff9a00",
        wide: true,
      },
      { id: "canva", name: "Canva", color: "#00c4cc" },
    ],
  },
] as const;

export const practices = [
  "API Design",
  "Responsive Design",
  "Data Analysis",
  "Model Evaluation",
  "Prompt Engineering",
  "RAG Systems",
  "Prototyping",
  "Deployment",
  "Version Control",
  "CI/CD",
] as const;
