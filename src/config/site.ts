export const siteConfig = {
  fullName: "Ruththiragayan Sutharsan",
  brandName: "Ruththra",
  email: "", // Add a public contact email.
  location: "Moratuwa, Sri Lanka",
  availability: "Open to internships and collaborations",
  siteUrl: "", // Add the production origin, without a trailing slash.
  seoDescription:
    "Portfolio of Ruththiragayan Sutharsan, a full-stack developer and Data Science and Engineering undergraduate.",
  resumeUrl: "", // Place the PDF in public/resume and set this to /resume/Ruththiragayan-Sutharsan-Resume.pdf
  socials: {
    linkedin: "",
    github: "",
    instagram: "",
  },
  navigation: [
    { label: "Home", href: "/#home" },
    { label: "Skills", href: "/#skills" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

export type SocialName = keyof typeof siteConfig.socials;
