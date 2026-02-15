import { FileDown, ArrowLeft, Maximize2, ZoomIn } from "lucide-react";
import { Link } from "../lib/router";

export function ResumePage() {
  // Public papkangizdagi PDF nomi bilan bir xil ekanligiga ishonch hosil qiling
  const resumeUrl = "/Jaloliddin_Xalimov_CV.pdf"; 

  return (
    <div className="min-h-screen bg-[#020202] pt-20 pb-4 px-2 sm:px-6 flex flex-col">
      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
        
        {/* Navigatsiya va Boshqaruv Paneli */}
        <div className="flex flex-wrap justify-between items-center mb-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all group px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Asosiyga qaytish</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-[0.2em] px-4 border-r border-white/10">
              <ZoomIn size={12} /> Full View Mode
            </div>
            
            <a 
              href={resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all text-sm group"
            >
              <Maximize2 size={16} className="group-hover:scale-110 transition-transform" /> 
              <span className="hidden sm:inline">To'liq ekran</span>
            </a>
            
            <a 
              href={resumeUrl} 
              download 
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 transition-all text-sm"
            >
              <FileDown size={18} /> Download CV
            </a>
          </div>
        </div>

        {/* PDF KONTEYNER - EKRANNI TO'LIQ EGALLAYDI */}
        <div className="flex-1 w-full rounded-2xl border border-white/10 overflow-hidden bg-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <iframe 
            src={`${resumeUrl}#view=FitH&navpanes=0&toolbar=1`} 
            className="w-full h-full border-none shadow-inner"
            style={{ 
              height: "calc(100vh - 180px)", // Dinamik balandlik: Ekran balandligi minus header va panel
              display: "block" 
            }}
            title="Jaloliddin Xalimov Resume"
          />
        </div>
        
        {/* Footer info */}
        <div className="py-3 flex justify-center items-center gap-4 opacity-30">
          <div className="h-px w-12 bg-white" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white">Ruebensh AI Engineering</span>
          <div className="h-px w-12 bg-white" />
        </div>
      </div>
    </div>
  );
}