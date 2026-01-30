import { Link, useRouter } from "../../lib/router";
import {
  LayoutDashboard,
  Folder,
  Code,
  Briefcase,
  FileText,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Projects", path: "/admin/projects", icon: Folder },
  { name: "Skills", path: "/admin/skills", icon: Code },
  { name: "Experience", path: "/admin/experience", icon: Briefcase },
  { name: "About", path: "/admin/about", icon: FileText },
  { name: "Messages", path: "/admin/messages", icon: Inbox },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  onLinkClick?: () => void;
}

export function AdminSidebar({ onLinkClick }: AdminSidebarProps) {
  const { currentPath } = useRouter();

  const isActive = (path: string) => {
    if (path === "/admin") return currentPath === "/admin";
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    if (confirm("Chiqmoqchimisiz?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header uchun bo'sh joy */}
      <div className="h-16 shrink-0 border-b border-sidebar-border flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold">J</span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-sidebar-foreground">Admin Panel</h2>
            <p className="text-[9px] uppercase tracking-wider text-sidebar-foreground/50">
              Portfolio CMS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
        <div className="px-3 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Main Menu
          </p>
        </div>
        
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <item.icon 
              size={20} 
              className={`transition-transform duration-200 group-hover:scale-110 ${
                isActive(item.path) ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1.5 bg-sidebar/50 backdrop-blur-sm shrink-0">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
        >
          <ExternalLink size={20} className="group-hover:text-primary transition-colors" />
          <span className="font-medium">View Site</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}