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

export function AdminSidebar() {
  const { currentPath } = useRouter();

  const isActive = (path: string) => {
    if (path === "/admin") return currentPath === "/admin";
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    if (confirm("Haqiqatan ham admin paneldan chiqmoqchimisiz?")) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("admin-logout"));
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border shadow-xl">
      {}
      <div className="hidden lg:flex p-6 border-b border-sidebar-border items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">J</span>
        </div>
        <div>
          <h2 className="font-bold text-sidebar-foreground">Admin Panel</h2>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Portfolio CMS</p>
        </div>
      </div>

      {}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {}
      <div className="p-4 border-t border-sidebar-border space-y-2 mb-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <ExternalLink size={20} />
          <span className="font-medium">View Site</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-destructive hover:bg-destructive/10 transition-colors group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}