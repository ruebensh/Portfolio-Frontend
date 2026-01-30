import { useState, useEffect } from "react";
import { Hero } from "../components/home/Hero";
import { ProfileCard } from "../components/home/ProfileCard";
import { Skills } from "../components/home/Skills";
import { Experience } from "../components/home/Experience";
import { Contact } from "../components/home/Contact";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Xato:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020202] selection:bg-primary/30">
      {}
      <Hero data={settings} />

      {}
      <section className="py-24">
        <ProfileCard data={settings} />
      </section>

      {}
      <section className="py-24 bg-white/[0.01]">
        <Skills />
      </section>

      {}
      <section className="py-24">
        <Experience />
      </section>

      {}
      <section id="contact" className="py-24 bg-white/[0.01]">
        <Contact data={settings} />
      </section>
    </main>
  );
}