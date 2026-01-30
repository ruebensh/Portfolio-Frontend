import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Mail, MailOpen, Trash2, Loader2, RefreshCw, Send } from "lucide-react";

const API_URL = "http://localhost:3000";

export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [replyLoading, setReplyLoading] = useState<number | null>(null); // Qaysi xabarga javob ketayotganini aniqlash uchun

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/messages`);
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Xabarlarni yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleReply = async (id: number, name: string) => {
    const text = prompt(`${name} uchun javob xatingizni yozing:`);
    if (!text) return;

    setReplyLoading(id);
    try {
      const res = await fetch(`${API_URL}/messages/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        alert("Email muvaffaqiyatli yuborildi! 🚀");
        setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
      } else {
        alert("Xatolik: Email yuborilmadi. Backend sozlamalarini tekshiring.");
      }
    } catch (err) {
      console.error("Yuborishda xato:", err);
      alert("Tarmoq xatosi yuz berdi.");
    } finally {
      setReplyLoading(null);
    }
  };

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/messages/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Ushbu xabar o'chirilsinmi?")) return;
    try {
      const res = await fetch(`${API_URL}/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        if (selectedMessage === id) setSelectedMessage(null);
      }
    } catch (err) { console.error(err); }
  };

  const filteredMessages = messages.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) return (
    <AdminLayout>
      <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">Foydalanuvchilardan kelgan xabarlar</p>
          </div>
          <Button onClick={fetchMessages} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} /> Update
          </Button>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/40 bg-card shadow-sm">
            <div className="text-2xl font-bold">{messages.length}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
          <div className="p-4 rounded-xl border border-border/40 bg-card shadow-sm">
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </div>
        </div>

        {}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search by name, email or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12"
          />
        </div>

        {}
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <AnimatePresence>
            {filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-6 border-b border-border/40 last:border-0 cursor-pointer transition-all ${
                  !msg.read ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"
                } ${selectedMessage === msg.id ? "bg-accent" : ""}`}
                onClick={() => setSelectedMessage(selectedMessage === msg.id ? null : msg.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !msg.read ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {msg.read ? <MailOpen size={20} /> : <Mail size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate">{msg.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-primary mb-2">{msg.email}</div>
                      <div className={`text-sm ${selectedMessage === msg.id ? "" : "line-clamp-2"}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!msg.read && (
                      <Button variant="outline" size="sm" onClick={(e) => handleMarkAsRead(msg.id, e)}>
                        <MailOpen size={16} />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={(e) => handleDelete(msg.id, e)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {selectedMessage === msg.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 pt-6 border-t border-border/40"
                  >
                    <div className="p-4 rounded-lg bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                      {msg.text}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className="gap-2" 
                        onClick={() => handleReply(msg.id, msg.name)}
                        disabled={replyLoading === msg.id}
                      >
                        {replyLoading === msg.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Send size={14} />
                        )}
                        Gmail orqali javob yozish
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${msg.email}`;
                        }}
                      >
                        Pochta ilovasida ochish
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredMessages.length === 0 && (
            <div className="text-center py-20 text-muted-foreground bg-muted/10">
              Xabarlar topilmadi.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}