import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NotFound() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/szukaj?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isMobile) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center"
        style={{
          paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom,0px))",
          paddingTop: "calc(4.5rem + env(safe-area-inset-top,0px))",
          background: "linear-gradient(160deg, #0f1117 0%, #131a2e 45%, #0d1117 100%)",
        }}
      >
        {/* Background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Ambient blobs */}
          <div className="absolute -left-20 top-[8%] h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
          <div className="absolute -right-16 bottom-[12%] h-56 w-56 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)" }} />
          <div className="absolute left-[20%] top-[50%] h-40 w-40 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)" }} />
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Decorative rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ border: "1px dashed rgba(255,255,255,0.06)" }}
          />
          {/* Floating dots */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[15%] top-[30%] h-2 w-2 rounded-full"
            style={{ background: "rgba(99,102,241,0.5)" }}
          />
          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute right-[18%] top-[35%] h-1.5 w-1.5 rounded-full"
            style={{ background: "rgba(236,72,153,0.5)" }}
          />
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute left-[60%] bottom-[30%] h-2 w-2 rounded-full"
            style={{ background: "rgba(14,165,233,0.4)" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <img
              src="/logo-love-bydgoszcz.png"
              alt="Love Bydgoszcz"
              className="h-9 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1) opacity(0.85)" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </motion.div>

          {/* 404 visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-7"
          >
            <div
              className="relative flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 60px -20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="absolute inset-4 rounded-full"
                style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
              />
              <span
                className="relative text-[2.6rem] font-black tracking-[-0.08em]"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 40px rgba(99,102,241,0.6)",
                }}
              >
                404
              </span>
            </div>
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-full -z-10 scale-150 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }}
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mb-6"
          >
            <h1
              className="mb-2 text-[21px] font-black tracking-tight leading-tight"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              Nie znaleziono strony
            </h1>
            <p
              className="text-[13px] leading-relaxed max-w-[240px] mx-auto"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Link może być nieaktualny lub treść została przeniesiona.
            </p>
          </motion.div>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            onSubmit={handleSearch}
            className="mb-5 w-full max-w-[280px]"
          >
            <div
              className="flex items-center gap-2 rounded-[1.25rem] px-3.5"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Search className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj na portalu..."
                className="h-11 flex-1 bg-transparent text-[13px] font-medium outline-none"
                style={{
                  color: "rgba(255,255,255,0.85)",
                }}
              />
            </div>
          </motion.form>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="flex gap-2.5 w-full max-w-[280px]"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-bold active:scale-95 transition-all duration-150"
              style={{
                borderRadius: "1.1rem",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Wróć
            </button>
            <Link
              to="/"
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-bold active:scale-95 transition-all duration-150"
              style={{
                borderRadius: "1.1rem",
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                color: "#ffffff",
                boxShadow: "0 8px 24px -8px rgba(99,102,241,0.55)",
              }}
            >
              <Home className="h-3.5 w-3.5" />
              Strona główna
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_52%,#f7fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-16 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute right-[12%] top-20 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-12 left-[24%] h-32 w-32 rounded-full bg-rose-100/50 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="order-2 text-center lg:order-1 lg:text-left"
          >
            <img
              src="/logo-love-bydgoszcz.png"
              alt="Love Bydgoszcz"
              className="mx-auto mb-6 h-14 w-auto object-contain sm:h-16 lg:mx-0"
              onError={e => { (e.target as HTMLImageElement).src = "/logo.png"; }}
            />

            <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Nie znaleziono tej strony.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
              Link może być nieaktualny albo treść została przeniesiona. Wróć na stronę główną lub skorzystaj z wyszukiwarki.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-7 max-w-xl lg:mx-0">
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-white/90 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Szukaj na portalu..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <Search className="h-4 w-4" />
                  Szukaj
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(244,114,182,0.22)] transition-all hover:-translate-y-0.5"
              >
                <Home className="h-4 w-4" />
                Strona główna
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="order-1 flex items-center justify-center lg:order-2 lg:justify-end"
          >
            <div className="relative flex h-[15rem] w-[15rem] items-center justify-center rounded-full border border-white/80 bg-white/75 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:h-[18rem] sm:w-[18rem] lg:h-[24rem] lg:w-[24rem]">
              <div className="absolute inset-5 rounded-full border border-dashed border-slate-200" />
              <div className="text-[4.5rem] font-black leading-none tracking-[-0.08em] text-slate-900 sm:text-[5.5rem] lg:text-[7.5rem]">
                404
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}