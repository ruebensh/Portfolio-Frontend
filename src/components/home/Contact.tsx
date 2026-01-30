import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Mail, Send, CheckCircle, 
  Loader2, Github, Linkedin, Instagram, Phone 
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface ContactProps {
  data: any;
}

export function Contact({ data }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "", 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Xatolik yuz berdi");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error: any) {
      console.error("Xabar yuborishda xato:", error);
      alert(`Xabar yuborilmadi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Bog'lanish</h2>
        <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mb-4" />
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Savollaringiz bormi? Loyihangizni birga muhokama qilishimiz mumkin.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6"
        >
          <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Email</p>
                <a href={`mailto:${data?.email}`} className="font-medium hover:underline">
                  {data?.email || "example@mail.com"}
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm group hover:border-green-500/50 transition-colors">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Telefon</p>
                <a href={`tel:${data?.phone}`} className="font-medium hover:underline">
                  {data?.phone || "+998 90 000 00 00"}
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">Ijtimoiy tarmoqlar</p>
            <div className="flex flex-wrap gap-3">
              {data?.telegram && (
                <a href={`https://t.me/${data.telegram.replace('@', '')}`} target="_blank" className="p-3 rounded-xl bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-all">
                  <Send size={20} />
                </a>
              )}
              {data?.github && (
                <a href={data.github} target="_blank" className="p-3 rounded-xl bg-foreground/10 text-white hover:bg-white hover:text-black transition-all border border-white/10">
                  <Github size={20} />
                </a>
              )}
              {data?.linkedin && (
                <a href={data.linkedin} target="_blank" className="p-3 rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border/40 p-8 rounded-3xl shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1 text-white">Ismingiz</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ismingizni kiriting"
                  className="bg-background/50 h-12 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1 text-white">Email</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Emailingizni kiriting"
                  className="bg-background/50 h-12 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-white">Xabar</label>
              <Textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Xabaringizni yozing..."
                className="min-h-[150px] bg-background/50 resize-none text-white"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-md font-semibold transition-all active:scale-[0.98]"
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 animate-spin" /> Yuborilmoqda...</>
              ) : submitted ? (
                <><CheckCircle className="mr-2" /> Xabar yuborildi!</>
              ) : (
                <><Send className="mr-2" /> Xabar yuborish</>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}