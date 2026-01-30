// ... (importlar o'zgarishsiz)

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Link bosilganda yopilishi uchun
  useEffect(() => {
    setIsOpen(false);
  }, [window.location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-[60] h-16 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">J</span>
            </div>
            <h1 className="font-semibold text-lg hidden xs:block text-foreground">Portfolio Admin</h1>
          </div>
          
          {/* Profil qismi o'zgarishsiz */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User size={16} className="text-primary-foreground" />
              </div>
              <div className="hidden sm:block text-foreground">
                <div className="text-sm font-medium">Jaloliddin</div>
                <div className="text-[10px] opacity-70">Admin</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]" // Z-index sidebar'dan past
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR: Mana shu yerda 'fixed' va '-translate-x-full' muhim */}
      <aside className={`fixed inset-y-0 left-0 z-[50] w-72 transform transition-transform duration-300 ease-in-out bg-sidebar ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <AdminSidebar />
      </aside>

      {/* MAIN: Eng asosiysi bu yerda lg:ml-72 bo'lmasligi kerak! */}
      <main className={`pt-16 min-h-screen transition-all duration-300 p-4 sm:p-6 lg:p-10 ${
        isOpen ? "blur-md scale-[0.98] pointer-events-none" : ""
      }`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}