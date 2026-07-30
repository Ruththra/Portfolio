export type SkillCategory = { title: string; skills: readonly string[] };

export const capabilityPaths = [
  "Software Engineering",
  "AI & Machine Learning",
  "Data Science & Analytics",
] as const;

export const skillCategories: readonly SkillCategory[] = [
  {
    title: "Programming Languages",
    skills: ["Python", "TypeScript", "JavaScript", "Java", "C++", "C", "RPAL"],
  },
  {
    title: "Frontend Development",
    skills: ["React", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "GSAP"],
  },
  {
    title: "Backend Development & APIs",
    skills: ["Node.js", "Express.js", "FastAPI", "Ballerina", "REST APIs"],
  },
  {
    title: "Databases & Backend Services",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase"],
  },
  {
    title: "Artificial Intelligence & Machine Learning",
    skills: [
      "Python",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "Hugging Face",
      "OpenAI API",
      "Gemini API",
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "RAG Systems",
      "Data Preprocessing",
      "Model Training",
      "Model Evaluation",
      "AI Integration",
      "Prompt Engineering",
    ],
  },
  {
    title: "Data Science & Analytics",
    skills: [
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Jupyter Notebook",
      "SQL",
      "Data Cleaning",
      "Exploratory Data Analysis",
      "Data Visualisation",
      "Statistical Analysis",
      "Feature Engineering",
    ],
  },
  {
    title: "UI/UX & Creative Design",
    skills: [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Canva",
      "Wireframing",
      "Prototyping",
      "Responsive Design",
      "Visual Design",
    ],
  },
  {
    title: "Cloud, DevOps & Development Tools",
    skills: [
      "Git",
      "GitHub",
      "Visual Studio Code",
      "Linux",
      "Docker",
      "Vercel",
      "Version Control",
      "Deployment",
      "Containerisation",
    ],
  },
  {
    title: "Currently Exploring",
    skills: [
      "Deep Learning",
      "Natural Language Processing",
      "Generative AI",
      "Cloud Computing",
      "CI/CD",
    ],
  },
] as const;
