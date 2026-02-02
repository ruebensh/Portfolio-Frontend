import { Github, Linkedin, Send, Instagram, Mail } from "lucide-react";
import { Link } from "../lib/router";

interface FooterProps {
  data: any;
}

export function Footer({ data }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: data?.github, show: !!data?.github },
    { icon: Linkedin, href: data?.linkedin, show: !!data?.linkedin },
    { icon: Send, href: data?.telegram ? `https://t.me/${data.telegram.replace('@', '')}` : null, show: !!data?.telegram },
    { icon: Instagram, href: data?.instagram, show: !!data?.instagram },
    { icon: Mail, href: data?.email ? `mailto:${data?.email}` : null, show: !!data?.email },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-md py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
        
        {}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <span className="text-primary-foreground font-bold text-2xl -rotate-3">
                {data?.author?.charAt(0) || "J"}
              </span>
            </div>
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">
            {data?.author || "Jaloliddin"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {data?.description || "Ai Engineer & Developer"}
          </p>
        </div>

        {}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Asosiy menyu-
          </Link>
          <Link href="/projects" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Proyektlar-
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Men haqimda
          </Link>
        </nav>

        {}
        <div className="flex justify-center gap-4 mb-12">
          {socialLinks.map((social, index) => social.show && (
            <a
              key={index}
              href={social.href!}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 transition-all duration-300 bg-card/30 shadow-sm"
            >
              <social.icon size={20} />
            </a>
          ))}
        </div>

        {}
        <div className="w-full pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground tracking-wide">
            © {currentYear} {data?.author || "Jaloliddin"}.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Built with</span>
            <span className="font-bold text-foreground">Figma UI</span>
            <span>&</span>
            <span className="font-bold text-foreground">React</span>
            <span>&</span>
            <span className="font-bold text-foreground">NextJS</span>
            <span>&</span>
            <span className="font-bold text-foreground">TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}