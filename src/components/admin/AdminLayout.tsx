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
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-sm lg:ml-72">
        <div className="h-full px-6 flex items-center justify-end">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <User size={16} className="text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium">Jaloliddin</div>
              <div className="text-xs text-muted-foreground leading-tight">Admin</div>
            </div>
          </div>
        </div>
      </header>

      {}
      <AdminSidebar />

      {}
      <main className="pt-0 lg:pt-16 min-h-screen lg:ml-72 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}