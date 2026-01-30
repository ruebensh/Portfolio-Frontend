import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Link bosilganda sidebar yopilishi
  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* OVERLAY: Sidebar ochiq bo'lganda */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR: z-50 ga o'zgartirildi */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -288 }} // 288px = w-72 (18rem)
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 w-72 z-50 bg-sidebar border-r border-sidebar-border shadow-2xl"
      >
        <AdminSidebar onLinkClick={closeSidebar} />
      </motion.aside>

      {/* HEADER: z-30 ga tushirildi */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all focus:outline-none active:scale-95"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">J</span>
            </div>
            <h1 className="font-semibold text-lg hidden xs:block tracking-tight italic text-primary">
              Portfolio Admin
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <User size={14} className="text-primary-foreground" />
              </div>
              <div className="hidden sm:block leading-none text-right">
                <div className="text-sm font-medium">Jaloliddin</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tighter font-bold">
                  Admin Panel
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-16 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}