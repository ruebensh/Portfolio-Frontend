import { Link, useRouter } from "../../lib/router";
import { LayoutDashboard, Folder, Code, Briefcase, FileText, Inbox, Settings, LogOut, ExternalLink } from "lucide-react";

// NavItems o'zgarishsiz...

export function AdminSidebar() {
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

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* mt-16 header ostidan ko'rinishi uchun */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent"
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2 mb-4">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent">
          <ExternalLink size={20} />
          <span className="font-medium">View Site</span>
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 w-full">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}