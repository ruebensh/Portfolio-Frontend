// ... (importlar o'zgarishsiz)

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
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border shadow-2xl overflow-hidden">
      {/* Navigatsiya mt-16 bo'lishi kerak, shunda Header uni to'sib qo'ymaydi 
      */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 pt-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2 mb-2 bg-sidebar/50 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <ExternalLink size={20} />
          <span className="font-medium">View Site</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}