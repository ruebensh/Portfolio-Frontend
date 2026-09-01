"use client";

import React, { useState } from "react";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import {
  TelegramLogo, PaperPlaneRight, EnvelopeSimple,
  Phone, InstagramLogo, CheckCircle, Spinner,
} from "@phosphor-icons/react/dist/ssr";
import { sendAIChatMessage, sendMessage } from "@/lib/api";

// ── Input base style ───────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-card-border bg-card-bg/60 backdrop-blur-md text-foreground font-sans text-sm " +
  "px-4 py-3 outline-none focus:border-accent transition-colors placeholder:text-muted " +
  "focus:ring-0 rounded-xl";

const textareaCls =
  "w-full resize-none border border-card-border bg-card-bg/60 backdrop-blur-md text-foreground font-sans text-sm " +
  "px-4 py-3 outline-none focus:border-accent transition-colors placeholder:text-muted rounded-xl";

import { useLanguage } from "@/context/LanguageContext";

export const ContactSection = ({ settings }: { settings: any }) => {
  const { td } = useLanguage();
  const [form,       setForm]       = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [formError,  setFormError]  = useState("");

  const [aiInput,    setAiInput]    = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      await sendMessage(form.name, form.email, form.message);
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setFormError("Xabar yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    const res = await sendAIChatMessage(aiInput, "homepage-widget");
    setAiResponse(res);
    setAiLoading(false);
    setAiInput("");
  };

  // ── Helper: social link row ────────────────────────────────────────────────
  const SocialRow = ({
    href, label, sub, icon,
  }: { href: string; label: string; sub: string; icon: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 border border-card-border bg-card-bg/60 backdrop-blur-md hover:bg-card-bg/80 hover:border-accent group transition-colors rounded-xl"
    >
      <div className="w-9 h-9 border border-card-border rounded-lg flex items-center justify-center text-muted group-hover:border-accent group-hover:text-accent transition-colors shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-foreground">{td(label)}</p>
        <p className="font-mono text-[10px] text-muted truncate">{sub}</p>
      </div>
      <span className="ml-auto font-mono text-[10px] text-muted group-hover:text-accent transition-colors">↗</span>
    </a>
  );

  return (
    <section id="contact" className="px-6 py-28 md:px-8 md:py-36 bg-card-bg/60 backdrop-blur-xl border-t border-card-border/80">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection>
          {/* Header */}
          <AnimatedItem className="mb-20">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/20 px-3 py-1 inline-block mb-6 rounded-full">
              {td("Aloqa")}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tighter text-foreground">
              {td("Bog'lanish")}
            </h2>
            <p className="mt-4 text-muted font-sans text-base max-w-lg">
              {td("Loyiha, hamkorlik yoki savol bo'yicha — eng qulay kanal orqali muloqot qiling.")}
            </p>
          </AnimatedItem>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Column 1: Direct links ──────────────────────────────────── */}
            <AnimatedItem>
              <div className="card-surface p-8 h-full flex flex-col gap-4">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {td("Aloqa manbalari")}
                </h3>

                {settings?.telegram && (
                  <SocialRow
                    href={settings.telegram.startsWith("http") ? settings.telegram : `https://t.me/${settings.telegram.replace("@", "")}`}
                    label="Telegram"
                    sub={settings.telegram}
                    icon={<TelegramLogo size={18} weight="fill" />}
                  />
                )}
                {settings?.email && (
                  <SocialRow
                    href={`mailto:${settings.email}`}
                    label="Email"
                    sub={settings.email}
                    icon={<EnvelopeSimple size={18} weight="fill" />}
                  />
                )}
                {settings?.phone && (
                  <SocialRow
                    href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                    label="Telefon"
                    sub={settings.phone}
                    icon={<Phone size={18} weight="fill" />}
                  />
                )}
                {settings?.instagram && (
                  <SocialRow
                    href={settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram.replace("@", "")}`}
                    label="Instagram"
                    sub={settings.instagram}
                    icon={<InstagramLogo size={18} weight="fill" />}
                  />
                )}
              </div>
            </AnimatedItem>

            {/* ── Column 2: Contact form ──────────────────────────────────── */}
            <AnimatedItem>
              <div className="card-surface p-8 h-full flex flex-col">
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  {td("Xabar qoldirish")}
                </h3>
                <p className="font-mono text-[10px] text-muted mb-6 uppercase tracking-widest">
                  {td("Forma orqali to'g'ridan-to'g'ri yetib boradi")}
                </p>

                {submitted ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <CheckCircle size={40} weight="fill" className="text-accent mb-3" />
                    <h4 className="font-display font-bold text-foreground mb-1">{td("Xabar yuborildi!")}</h4>
                    <p className="font-mono text-[10px] text-muted mb-4 uppercase tracking-widest">
                      {td("Tez orada bog'lanaman.")}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/20 px-4 py-2 hover:bg-accent/10 transition-colors"
                    >
                      {td("Yangi xabar →")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col gap-3">
                    <input
                      type="text" required
                      placeholder={td("Ismingiz")}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="email" required
                      placeholder={td("Email manzilingiz")}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
                    />
                    <textarea
                      required rows={4}
                      placeholder={td("Xabaringiz...")}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={textareaCls}
                    />
                    {formError && (
                      <p className="font-mono text-[10px] text-rose-400">{td(formError)}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-auto w-full bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-colors font-bold"
                    >
                      {submitting
                        ? <Spinner size={14} className="animate-spin" />
                        : <PaperPlaneRight size={14} weight="fill" />}
                      {td("Yuborish")}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedItem>

            {/* ── Column 3: AI widget ─────────────────────────────────────── */}
            <AnimatedItem>
              <div className="card-surface p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[10px] text-accent border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-widest">AI</span>
                  <h3 className="font-display text-lg font-bold text-foreground">{td("AI ga so'rang")}</h3>
                </div>
                <p className="font-mono text-[10px] text-muted mb-6 uppercase tracking-widest">
                  {td("Tajriba va loyihalar haqida tezkor savol")}
                </p>

                <div className="flex-1 flex flex-col">
                  <div className="flex-1 mb-4 p-4 border border-card-border bg-card-bg/60 backdrop-blur-md rounded-xl min-h-[100px] flex items-start">
                    {aiResponse ? (
                      <p className="text-sm text-foreground/80 font-sans italic leading-relaxed">
                        "{td(aiResponse)}"
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
                        {td("Savol bering — AI javob beradi...")}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleAsk} className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder={td("Savolingiz...")}
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      type="submit"
                      disabled={!aiInput.trim() || aiLoading}
                      className="bg-accent text-accent-foreground px-4 rounded-xl flex items-center justify-center hover:bg-accent/90 disabled:opacity-40 transition-colors"
                    >
                      {aiLoading
                        ? <Spinner size={14} className="animate-spin" />
                        : <PaperPlaneRight size={14} weight="fill" />}
                    </button>
                  </form>
                </div>
              </div>
            </AnimatedItem>

          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
