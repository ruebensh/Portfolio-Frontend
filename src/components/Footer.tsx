import { Github, Linkedin, Send, Instagram, Mail, Heart } from "lucide-react";
import { Link } from "../lib/router";
import { useRef } from "react";

interface FooterProps {
  data?: any;
}

export function Footer({ data }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      window.location.href = "/#/admin";
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 700);
  };

  // Standart / Backend havolalar
  const authorName = data?.author || "Jaloliddin Xalimov";
  const authorRole = data?.description || "Data Science & Machine Learning Engineer";

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: data?.github || "https://github.com/ruebensh",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: data?.linkedin || "https://linkedin.com",
    },
    {
      name: "Telegram",
      icon: Send,
      href: data?.telegram
        ? `https://t.me/${data.telegram.replace("@", "")}`
        : "https://t.me/jaloliddin_xalimov",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: data?.instagram || "https://instagram.com/jaloliddin_xalimov",
    },
    {
      name: "Email",
      icon: Mail,
      href: data?.email ? `mailto:${data.email}` : "mailto:jaloliddinxalimov.0103@example.com",
    },
  ];

  return (
    <footer className="relative z-10 border-t border-white/15 bg-black/80 backdrop-blur-2xl py-14 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Author Avatar & Title */}
        <div className="mb-8 flex flex-col items-center">
          <div
            onClick={handleSecretClick}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 border border-white/20 hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="text-white font-black text-2xl tracking-tighter">
              <Image src="/images/avatar.png" alt="Jaloliddin" />
            </span>
          </div>

          <h3
            className="text-2xl font-bold tracking-tight text-white mb-2 cursor-pointer hover:text-primary transition-colors select-none"
            onClick={handleSecretClick}
          >
            {authorName}
          </h3>

          <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
            {authorRole}
          </p>
        </div>

        {/* Quick Nav Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/certificates"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Certificates
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            About Me
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/resume"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Resume
          </Link>
        </nav>

        {/* Social Link Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              title={social.name}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary hover:scale-110 shadow-lg shadow-black/40 transition-all duration-300 backdrop-blur-md"
            >
              <social.icon size={20} />
            </a>
          ))}
        </div>

        {/* Copyright & Tech Stack */}
        <div className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-xs">
          <p>© {currentYear} {authorName}. All rights reserved.</p>

          <div className="flex items-center gap-1.5 font-medium">
            <span>Built with</span>
            <Heart size={13} className="text-red-400 fill-red-400 animate-pulse" />
            <span>using React, NextJS &amp; TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}