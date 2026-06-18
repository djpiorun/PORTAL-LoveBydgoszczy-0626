import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, Youtube, Target, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

const contactInfo = [
  {
    icon: Mail,
    label: "E-mail",
    value: "redakcja@lovebydgoszcz.pl",
    href: "mailto:redakcja@lovebydgoszcz.pl",
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+48 52 335 30 00",
    href: "tel:+48523353000",
  },
  {
    icon: MapPin,
    label: "Adres",
    value: "Bydgoszcz, Polska",
    sub: "Kujawsko-Pomorskie",
    href: "https://maps.google.com/?q=Bydgoszcz,+Polska",
  },
  {
    icon: Clock,
    label: "Godziny pracy",
    value: "Pon–Pt: 8:00–18:00",
    sub: "Sob: 9:00–14:00",
    href: null,
  },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/lovebydgoszcz", hoverBg: "#1877F2", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/lovebydgoszcz", hoverBg: "#E4405F", label: "Instagram" },
  { icon: Youtube, href: "#", hoverBg: "#FF0000", label: "YouTube" },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    toast.success("Wiadomość wysłana! Odpiszemy wkrótce.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,63,94,0.07),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(14,165,233,0.06),transparent_40%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 leading-tight">
              Napisz do nas
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 mb-3">
              <Mail className="h-3.5 w-3.5" />
              Kontakt z redakcją
            </div>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Masz pytanie, propozycję artykułu lub chcesz nawiązać współpracę? Jesteśmy tu dla Ciebie.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Sidebar */}
            <motion.div className="lg:col-span-2 space-y-4" {...fadeUp(0.1)}>

              {/* Contact info */}
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-wide">Dane kontaktowe</h2>
                <div className="space-y-2">
                  {contactInfo.map(({ icon: Icon, label, value, sub, href }) => (
                    <div key={label} className="group flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 transition-colors duration-150 hover:bg-muted/50 cursor-default">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{value}</p>
                        )}
                        {sub && <p className="text-xs text-muted-foreground leading-none mt-0.5">{sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <h3 className="text-xs font-black text-foreground mb-3 uppercase tracking-wide">Social media</h3>
                <div className="flex gap-2.5">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:scale-105 hover:text-white"
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = label === "Facebook" ? "#1877F2" : label === "Instagram" ? "#E4405F" : "#FF0000"; el.style.borderColor = "transparent"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ""; el.style.borderColor = ""; }}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Nasze Działania CTA */}
              <motion.button
                onClick={() => navigate("/nasze-dzialania")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-left transition-all hover:border-emerald-300 hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-950/20 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Target className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">Nasze Działania</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Poznaj nasze inicjatywy i projekty dla Bydgoszczy. Dołącz do społeczności!
                </p>
              </motion.button>
            </motion.div>

            {/* Form */}
            <motion.div className="lg:col-span-3" {...fadeUp(0.15)}>
              <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-base font-black text-foreground">Wyślij wiadomość</h2>
                  <p className="text-xs text-muted-foreground mt-1">Formularz demonstracyjny — odpowiadamy w ciągu 24h w dni robocze.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Imię i nazwisko <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Jan Kowalski"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Adres e-mail <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jan@example.com"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Temat
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Temat wiadomości"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Wiadomość <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Napisz swoją wiadomość..."
                      rows={6}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Wysyłanie...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Wyślij wiadomość
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}