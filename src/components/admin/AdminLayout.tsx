import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { User } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl lg:ml-72 shadow-sm">
        <div className="h-full px-6 flex items-center justify-end">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <User size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Jaloliddin</div>
              <div className="text-[10px] text-primary font-medium tracking-widest uppercase opacity-90 leading-none">Super Admin</div>
            </div>
          </div>
        </div>
      </header>

      {}
      <AdminSidebar />

      {}
      <main className="pt-20 lg:pt-24 min-h-screen lg:ml-72 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}