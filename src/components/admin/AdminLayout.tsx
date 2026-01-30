import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Link bosilganda sahifa o'zgarsa, sidebar yopilishi uchun
  useEffect(() => {
    setIsOpen(false);
  }, [window.location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* HEADER: Har doim eng tepada (z-index: 100) */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all focus:outline-none active:scale-95"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">J</span>
            </div>
            <h1 className="font-semibold text-lg hidden xs:block tracking-tight italic text-primary">Portfolio Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <User size={14} className="text-primary-foreground" />
              </div>
              <div className="hidden sm:block leading-none text-right">
                <div className="text-sm font-medium">Jaloliddin</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tighter font-bold">Admin Panel</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* OVERLAY: Sidebar ochiqligida orqa fonni qoraytirish (z-index: 80) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR: (z-index: 90) Headerdan pastda, Overlaydan tepada */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[90] w-72 transform transition-transform duration-300 ease-in-out bg-sidebar border-r border-sidebar-border shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar />
      </aside>

      {/* ASOSIY KONTENT: Sidebar ochilganda ozroq xiralashadi */}
      <main className={`pt-16 min-h-screen transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
        isOpen ? "blur-sm opacity-60 scale-[0.99] pointer-events-none" : "opacity-100"
      }`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}