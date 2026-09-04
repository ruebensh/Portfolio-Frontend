import { Hero } from "@/components/sections/Hero";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { ProfileCardTransitionSection } from "@/components/sections/ProfileCardTransitionSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProjects, getSkills, getSettings, getExperience } from "@/lib/api";

export default async function Home() {
  const [projects, skills, settings, experience] = await Promise.all([
    getProjects(),
    getSkills(),
    getSettings(),
    getExperience(),
  ]);

  return (
    <main className="min-h-screen">
      {/* 1. Cinematic Hero — 3D frame sequence + floating cards */}
      <Hero settings={settings} />

      {/* 2. ProfileCard with scroll-driven 3D lift → zoom toward camera → settle */}
      <ProfileCardTransitionSection settings={settings} />

      {/* 3. Projects Tunnel — flows from ProfileCard handoff */}
      <ProjectsShowcase projects={projects as any[]} />

      {/* 4. Skills breakdown — video frame sequence scroll */}
      <SkillsSection skills={skills as any[]} />

      {/* 6. Experience timeline */}
      <ExperienceSection experience={experience as any[]} />

      {/* 7. Contact */}
      <ContactSection settings={settings} />
    </main>
  );
}
