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
  Menu,
  X,
  ExternalLink,
  Award, // Qo'shildi
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  name: string;
  path: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Projects", path: "/admin/projects", icon: Folder },
  { name: "Certificates", path: "/admin/certificates", icon: Award }, // Qo'shildi
  { name: "Skills", path: "/admin/skills", icon: Code },
  { name: "Experience", path: "/admin/experience", icon: Briefcase },
  { name: "About", path: "/admin/about", icon: FileText },
  { name: "Messages", path: "/admin/messages", icon: Inbox },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { currentPath } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">Admin Panel</h2>
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
              Portfolio CMS
            </p>
          </div>
        </div>
      </div>

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
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <item.icon 
              size={20} 
              strokeWidth={isActive(item.path) ? 2.5 : 2}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-1.5 shrink-0">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
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

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 shadow-lg backdrop-blur-sm"
        aria-label="Toggle Menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside className="hidden lg:block w-72 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-[50]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden w-72 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 bottom-0 z-[55] shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}