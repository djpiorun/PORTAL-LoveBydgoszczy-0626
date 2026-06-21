import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-client";
import { Facebook, Instagram, Youtube, Twitter, Mail, MapPin, Phone, Newspaper, Users, Heart, FileText } from "lucide-react";
import { toast } from "sonner";

type FooterSettings = {
  portalName?: string;
  footerDescription?: string;
  footerLocationLine1?: string;
  footerLocationLine2?: string;
  contactEmail?: string;
  contactPhone?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
};

type FooterPage = {
  _id?: string;
  slug: string;
  title: string;
};

type FooterResponse = {
  settings?: FooterSettings;
  footer_pages?: FooterPage[];
  footerPages?: FooterPage[];
};

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFooter = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<FooterResponse>("/settings/footer");
        if (!isMounted) return;
        setSettings(data?.settings ?? null);
        setFooterPages(data?.footer_pages ?? data?.footerPages ?? []);
      } catch (error) {
        if (!isMounted) return;
        setSettings(null);
        setFooterPages([]);
        toast.error("Nie udało się załadować stopki.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFooter();

    return () => {
      isMounted = false;
    };
  }, []);

  const portalName = settings?.portalName || "Love Bydgoszcz";
  const footerDescription =
    settings?.footerDescription ||
    "Twój codzienny przewodnik po Bydgoszczy. Odkrywaj z nami najlepsze miejsca, wydarzenia i historie z życia miasta.";
  const footerLocationLine1 = settings?.footerLocationLine1 || "Bydgoszcz, Polska";
  const footerLocationLine2 = settings?.footerLocationLine2 || "Kujawsko-Pomorskie";
  const contactEmail = settings?.contactEmail || "redakcja@lovebydgoszcz.pl";
  const contactPhone = settings?.contactPhone || "+48 52 335 30 00";
  const facebookUrl = "https://facebook.com/lovebydgoszcz";
  const instagramUrl = "https://instagram.com/lovebydgoszcz";
  const youtubeUrl = settings?.youtubeUrl || "#";
  const twitterUrl = settings?.twitterUrl || "#";

  return (
    <footer className="mt-0 hidden border-t-0 bg-transparent md:block">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(248,250,252,0.9)_42%,rgba(255,248,240,0.84))] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 dark:border-border/40 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.75),rgba(30,41,59,0.85)_42%,rgba(15,23,42,0.65))] dark:shadow-[0_28px_80px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 -translate-x-1/4 -translate-y-1/4 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/12" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-36 w-36 translate-x-1/4 translate-y-1/4 rounded-full bg-amber-200/35 blur-3xl dark:bg-amber-500/12" />
          <div className="pointer-events-none absolute inset-y-0 right-6 hidden items-center opacity-[0.06] lg:flex">
            <img src="/logo-love-bydgoszcz.png" alt="" className="h-52 w-auto object-contain" />
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

          <div className="relative z-10 mb-6 flex items-center gap-3">
            <div className="rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-rose-600 shadow-sm dark:border-primary/30 dark:bg-primary/10 dark:text-primary">
              Portal miejski
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-rose-200 via-slate-200 to-transparent dark:from-primary/30 dark:via-border/30 dark:to-transparent" />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1fr]">
            <div className="space-y-5">
              <Link to="/" className="inline-flex items-center">
                <img src="/logo-love-bydgoszcz.png" alt={portalName} className="h-16 w-auto object-contain sm:h-20" />
              </Link>
              <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-muted-foreground">{footerDescription}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white dark:border-border dark:text-foreground/70 dark:hover:border-[#1877F2]"><Facebook className="h-4 w-4" /></a>
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all hover:border-[#E4405F] hover:bg-[linear-gradient(135deg,#F58529,#E4405F,#8A3AB9)] hover:text-white dark:border-border dark:text-foreground/70 dark:hover:border-[#E4405F]"><Instagram className="h-4 w-4" /></a>
                <a href={youtubeUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white dark:border-border dark:text-foreground/70 dark:hover:border-[#FF0000]"><Youtube className="h-4 w-4" /></a>
                <a href={twitterUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white dark:border-border dark:text-foreground/70 dark:hover:border-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-900"><Twitter className="h-4 w-4" /></a>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-muted-foreground">Sekcje</h4>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-foreground/80">
                <li><Link to="/miasto" className="flex items-center gap-2 hover:text-primary"><Newspaper className="h-4 w-4" /> Miasto</Link></li>
                <li><Link to="/bydgoszczanie" className="flex items-center gap-2 hover:text-primary"><Users className="h-4 w-4" /> Bydgoszczanie</Link></li>
                <li><Link to="/nekrolog" className="flex items-center gap-2 hover:text-primary"><Heart className="h-4 w-4" /> Strefa Pamięci</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-muted-foreground">Informacje</h4>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-foreground/80">
                {footerPages.length > 0 ? footerPages.map((page) => (
                  <li key={page._id ?? page.slug}>
                    <Link to={`/${page.slug}`} className="flex items-start gap-2 transition-colors duration-150 hover:text-primary">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{page.title}</span>
                    </Link>
                  </li>
                )) : isLoading ? (
                  <li className="text-sm text-muted-foreground">Ładowanie stopki...</li>
                ) : (
                  <li className="text-sm text-muted-foreground">Brak dodatkowych stron w stopce.</li>
                )}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/75 p-5 backdrop-blur-sm dark:border-border/40 dark:bg-card/50">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-muted-foreground">Kontakt</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-700 dark:text-foreground/80">
                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span>{footerLocationLine1}<br />{footerLocationLine2}</span></li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><a href={`mailto:${contactEmail}`} className="hover:text-primary">{contactEmail}</a></li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="hover:text-primary">{contactPhone}</a></li>
              </ul>
              {isAuthenticated ? (
                <Link
                  to="/profil"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                >
                  <Users className="h-4 w-4" />
                  Profil
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between dark:border-border/40 dark:text-muted-foreground">
            <p>2013 - {new Date().getFullYear()} Redakcja Love Bydgoszcz</p>
            <p className="inline-flex items-center gap-1.5">Stworzone z <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 dark:fill-primary dark:text-primary" /> dla Bydgoszczy</p>
          </div>
        </div>
      </div>
    </footer>
  );
}