import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { User, LayoutDashboard } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar — faqat mobil va tablet uchun */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 border-b border-white/5 bg-background/90 backdrop-blur-xl shadow-sm flex items-center px-4 pl-16 justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={18} className="text-primary" />
          <span className="font-bold text-sm tracking-tight">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
            <User size={12} className="text-white" />
          </div>
          <span className="text-xs font-semibold">Jaloliddin</span>
        </div>
      </header>

      {/* Desktop top header */}
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

      <AdminSidebar />

      {/* Main content — mobile da top bar uchun pt-14, desktop da pt-16 */}
      <main className="pt-14 lg:pt-16 min-h-screen lg:ml-72 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto pt-4">
          {children}
        </div>
      </main>
    </div>
  );
}