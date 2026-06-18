import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, User, ShieldCheck, ChevronRight, Pen, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

// Gradient palette for author cards (cycles through)
const CARD_GRADIENTS = [
  { from: "#6366f1", to: "#8b5cf6" },
  { from: "#ec4899", to: "#f43f5e" },
  { from: "#0ea5e9", to: "#2563eb" },
  { from: "#059669", to: "#0d9488" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#7c3aed", to: "#9333ea" },
];

export default function AuthorsListPage() {
  const authors = useQuery(api.users.getAuthors);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredAuthors = authors?.filter(author => {
    const searchLower = searchQuery.toLowerCase();
    return (
      author.name?.toLowerCase().includes(searchLower) ||
      author.subtitle?.toLowerCase().includes(searchLower)
    );
  });

  if (isMobile) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: "hsl(var(--background))",
          paddingTop: "calc(4.5rem + env(safe-area-inset-top,0px))",
          paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom,0px))",
        }}
      >
        {/* Hero header with gradient */}
        <div className="relative overflow-hidden px-4 pt-4 pb-5">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-12 -top-8 h-40 w-40 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
          <div className="pointer-events-none absolute -left-8 top-8 h-32 w-32 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-[0.6rem]" style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }}>
                <Pen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Redakcja</span>
            </div>
            <h1 className="text-[28px] font-black tracking-tight text-foreground leading-tight">
              Nasi <span style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Autorzy</span>
            </h1>
            <p className="mt-1 text-[12px] font-medium text-muted-foreground/70">
              Poznaj zespół redakcyjny Love Bydgoszcz
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative mt-4 z-10"
          >
            <div
              className="flex items-center gap-2.5 rounded-[1.4rem] px-4"
              style={{
                background: "hsl(var(--card))",
                border: "1.5px solid hsl(var(--border)/0.5)",
                boxShadow: "0 4px 16px -4px rgba(0,0,0,0.08)",
              }}
            >
              <Search className="h-4 w-4 shrink-0 text-primary/60" />
              <input
                type="text"
                placeholder="Szukaj autora..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 flex-1 bg-transparent text-[13px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/45"
              />
            </div>
          </motion.div>
        </div>

        {/* Authors grid — 2 columns */}
        <div className="px-4">
          {!authors ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[160px] rounded-[1.5rem] bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredAuthors?.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-foreground/40">
              <User className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-bold text-[14px]">Brak wyników</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredAuthors?.map((author, i) => {
                const slug = author.slug || (author.name ? author.name.toLowerCase().replace(/\s+/g, '-') : "nieznany");
                const grad = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                return (
                  <motion.div
                    key={author._id}
                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={`/autor/${slug}`}
                      className="relative flex flex-col items-center overflow-hidden rounded-[1.5rem] p-4 pb-3.5 active:scale-[0.96] transition-transform duration-150 text-center"
                      style={{
                        background: `linear-gradient(145deg, ${grad.from}, ${grad.to})`,
                        boxShadow: `0 10px 28px -8px ${grad.from}55`,
                        minHeight: "9.5rem",
                      }}
                    >
                      {/* Shine overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,transparent_50%)] pointer-events-none" />
                      {/* Decorative circle */}
                      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-15 pointer-events-none" style={{ background: "rgba(255,255,255,0.7)" }} />

                      {/* Avatar */}
                      <div className="relative z-10 mb-2.5">
                        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/40 bg-white/20 shadow-lg">
                          {author.image ? (
                            <img src={author.image} alt={author.name ?? ""} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-6 w-6 text-white/80" />
                            </div>
                          )}
                        </div>
                        {author.isLoveBydgoszczTeam && (
                          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                            <Star className="h-2.5 w-2.5" style={{ color: grad.from }} />
                          </div>
                        )}
                      </div>

                      {/* Name & subtitle */}
                      <div className="relative z-10 w-full">
                        <p className="text-[13px] font-black text-white leading-tight line-clamp-1 drop-shadow-sm">{author.name}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-white/65 line-clamp-1">{author.subtitle || "Autor"}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-background z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight text-foreground">
              Nasi <span className="text-primary">Autorzy</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-muted-foreground">
              Poznaj zespół redakcyjny oraz twórców współpracujących z Love Bydgoszcz.
            </p>
            
            <div className="max-w-xl mx-auto relative group mt-8">
              <div className="relative flex items-center w-full">
                <div className="absolute left-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Szukaj autora..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-16 pr-8 py-4 rounded-full border-2 border-border bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-lg shadow-lg placeholder:text-muted-foreground text-foreground"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {!authors ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-3xl bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : filteredAuthors?.length === 0 ? (
          <div className="py-24 rounded-3xl text-center bg-card border border-border">
            <User className="w-16 h-16 mx-auto mb-4 opacity-20 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Brak wyników</h3>
            <p className="text-muted-foreground">Nie znaleziono autorów pasujących do wyszukiwania.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuthors?.map((author, i) => (
              <motion.div
                key={author._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link to={`/autor/${author.slug || (author.name ? author.name.toLowerCase().replace(/\s+/g, '-') : "nieznany")}`} className="block group h-full">
                  <div className="rounded-3xl bg-card border border-border overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="px-6 pt-8 pb-6 flex-1 flex flex-col relative items-center text-center justify-start">
                      <div className="w-28 h-28 mb-6 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center shadow-lg relative z-10 shrink-0">
                        {author.image ? (
                          <img src={author.image} alt={author.name ?? ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground group-hover:scale-110 transition-transform duration-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 w-full flex flex-col items-center justify-start">
                        <div className="flex flex-col items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {author.name}
                          </h3>
                          {author.isLoveBydgoszczTeam && (
                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                              <ShieldCheck className="w-3 h-3" />
                              Zespół
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium text-primary mb-3">{author.subtitle || "Autor"}</p>
                        
                        {author.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 px-2">{author.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic line-clamp-3 mb-4 px-2">Brak opisu profilu.</p>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-border/50 mt-auto w-full flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                        <span>Zobacz profil</span>
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}