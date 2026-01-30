import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {}
      <header className="fixed top-0 left-0 right-0 z-[60] h-16 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 mr-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors lg:hidden focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-xl">J</span>
            </div>
            <h1 className="font-semibold text-lg hidden sm:block">Portfolio Admin</h1>
          </div>
          
          {}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <User size={16} className="text-primary-foreground" />
              </div>
              <div className="hidden xs:block">
                <div className="text-sm font-medium leading-none">Jaloliddin</div>
                <div className="text-[10px] text-muted-foreground mt-1">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 bg-sidebar border-r border-sidebar-border ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        <AdminSidebar />
      </aside>

      {}
      <main className={`pt-16 min-h-screen transition-all duration-300 lg:ml-72 p-6 lg:p-10 ${
        isOpen ? "blur-sm lg:blur-none pointer-events-none lg:pointer-events-auto" : ""
      }`}>
        {children}
      </main>
    </div>
  );
}