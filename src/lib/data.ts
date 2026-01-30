export interface SiteSettings {}
export interface Project {}

export const siteSettings: SiteSettings = {
  title: "Mening Portfoliom",
  description: "Dasturchi va muhandis",
  author: "Ismingiz",
  socials: {
    github: "",
    linkedin: "",
    twitter: "",
    email: "",
  },
  cvUrl: "",
};

export const profileStats: ProfileStats = {
  projects: 0,
  experience: "0 yil",
  mainStack: "Frontend / Backend",
};

export const projects: Project[] = [];

export const techStack: TechStack[] = [];

export const skills: Skill[] = [];

export const experience: Experience[] = [];

export const aboutContent: AboutContent = {
  story: "Bu yerga o'z tarixingizni yozasiz...",
  education: [],
  certificates: [],
  values: [],
  currentlyLearning: [],
  currentlyWorking: [],
};

export const contactMessages: ContactMessage[] = [];