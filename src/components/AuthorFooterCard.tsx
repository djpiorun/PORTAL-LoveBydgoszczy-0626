import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { User, Facebook, Instagram, Twitter, Globe, Mail, Phone } from "lucide-react";

interface AuthorFooterCardProps {
  authorName: string;
  coauthorName?: string;
  coauthor2?: string;
  coauthor3?: string;
  style?: "graphic" | "business" | "none" | "default" | "classic";
}

// ─── STOPKA WIZYTÓWKOWA ───────────────────────────────────────────────────────
export function AuthorFooterCardBusiness({ authorName }: { authorName: string }) {
  const author = useQuery(api.users.getBySlugOrName, { identifier: authorName });
  if (author === undefined) return null;

  const authorSlug = author?.slug || authorName.toLowerCase().replace(/\s+/g, "-");
  const displayName = author?.name || authorName;
  const hasSocials = author && (
    author.facebookUrl || author.instagramUrl || author.twitterUrl ||
    author.websiteUrl || author.contactEmail
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-stretch min-h-[120px]">
        <div className="flex-1 flex flex-col justify-center px-6 py-5 pr-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Autor artykułu</p>
          <Link to={`/autor/${authorSlug}`} className="group inline-block">
            <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">{displayName}</h3>
          </Link>
          {author?.subtitle && <p className="text-sm text-muted-foreground mt-1 font-medium">{author.subtitle}</p>}
          {hasSocials && (
            <div className="flex items-center gap-1.5 mt-4 p-2 rounded-xl border border-border bg-muted/30 w-fit">
              {author.facebookUrl && <a href={author.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-background hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-200 text-muted-foreground border border-border hover:border-blue-600 shadow-sm"><Facebook className="w-3.5 h-3.5" /></a>}
              {author.instagramUrl && <a href={author.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-background hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all duration-200 text-muted-foreground border border-border hover:border-pink-600 shadow-sm"><Instagram className="w-3.5 h-3.5" /></a>}
              {author.twitterUrl && <a href={author.twitterUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-background hover:bg-sky-500 hover:text-white flex items-center justify-center transition-all duration-200 text-muted-foreground border border-border hover:border-sky-500 shadow-sm"><Twitter className="w-3.5 h-3.5" /></a>}
              {author.websiteUrl && <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-background hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200 text-muted-foreground border border-border hover:border-emerald-600 shadow-sm"><Globe className="w-3.5 h-3.5" /></a>}
              {author.contactEmail && <a href={`mailto:${author.contactEmail}`} className="w-8 h-8 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200 text-muted-foreground border border-border hover:border-primary shadow-sm"><Mail className="w-3.5 h-3.5" /></a>}
            </div>
          )}
        </div>
        <Link to={`/autor/${authorSlug}`} className="group relative shrink-0 self-stretch" style={{ width: "140px", marginRight: "-1px" }}>
          <div className="absolute inset-0 rounded-r-2xl overflow-hidden">
            {author?.image ? (
              <img src={author.image} alt={displayName} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><User className="w-12 h-12 text-primary/40" /></div>
            )}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-2xl" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── SINGLE AUTHOR SLOT (graphic style — dark card, overflowing photo) ──
function SingleAuthorSlot({ authorName }: { authorName: string }) {
  const author = useQuery(api.users.getBySlugOrName, { identifier: authorName });

  const authorSlug = author?.slug || authorName.toLowerCase().replace(/\s+/g, "-");
  const displayName = author?.name || authorName;
  const hasLinks = !!(author?.facebookUrl || author?.instagramUrl || author?.twitterUrl || author?.websiteUrl || author?.contactEmail || author?.contactPhone);
  const hasDescription = !!author?.description?.trim();
  const hasStatus = !!author?.status?.trim();

  return (
    <div
      className="group relative flex flex-1 items-stretch rounded-2xl overflow-visible"
      style={{
        minHeight: "118px",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 46%, #ec4899 100%)",
          boxShadow: "0 14px 34px rgba(217,70,239,0.28)",
        }}
      />
      {author?.coverImage && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
          <img src={author.coverImage} alt={displayName} className="h-full w-full object-cover" />
        </div>
      )}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 62%)",
        }}
      />

      <Link
        to={`/autor/${authorSlug}`}
        className="group relative shrink-0 z-10"
        style={{ width: "100px", marginBottom: "-2px", marginLeft: "12px" }}
      >
        <div
          className="rounded-xl overflow-hidden ring-2 ring-white/45 group-hover:ring-white/70 transition-all duration-300"
          style={{
            width: "96px",
            height: "128px",
            marginBottom: "0",
            transform: "translateY(-20px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {author?.image ? (
            <img
              src={author.image}
              alt={displayName}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-700/60 to-purple-900/60">
              <User className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>
      </Link>

      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-4 px-4 pb-4 pt-3 pr-5">
        <div className="min-w-[168px] max-w-[220px] self-center translate-y-2">
          <Link to={`/autor/${authorSlug}`} className="block origin-left">
            <p className="text-lg font-black leading-tight text-white transition-all duration-300 group-hover:scale-[1.03] group-hover:text-white/90">
              {displayName}
            </p>
          </Link>
          {author?.subtitle && (
            <p className="mt-0.5 text-[13px] font-semibold text-white transition-all duration-300 group-hover:scale-[1.03] group-hover:text-white/90">{author.subtitle}</p>
          )}
        </div>
        <div className="min-w-0 flex-1 self-center translate-y-2">
          {hasDescription ? (
            <div className="mx-auto flex min-h-[76px] max-w-sm items-center justify-center text-center">
              <div className="flex items-center gap-2 px-2">
                <span className="shrink-0 text-sm font-black leading-none text-white/90">"</span>
                <p className="line-clamp-2 text-[11px] leading-5 text-white">
                  {author?.description}
                </p>
                <span className="shrink-0 text-sm font-black leading-none text-white/90">"</span>
              </div>
            </div>
          ) : null}
        </div>
        {(hasLinks || hasStatus) && (
          <div className="flex shrink-0 flex-col items-end justify-center gap-3 pt-1.5">
            {hasStatus && (
              <span className="inline-flex items-center rounded-full border border-white/22 bg-gradient-to-r from-white/22 to-white/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                {author?.status}
              </span>
            )}
            {hasLinks && (
              <div className="flex items-center gap-1.5">
                {author?.facebookUrl && <a href={author.facebookUrl} target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/16 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-blue-400 hover:bg-blue-500 hover:shadow-[0_8px_18px_rgba(59,130,246,0.28)]"><Facebook className="h-3.5 w-3.5" /></a>}
                {author?.instagramUrl && <a href={author.instagramUrl} target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/16 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-pink-400 hover:bg-pink-500 hover:shadow-[0_8px_18px_rgba(236,72,153,0.28)]"><Instagram className="h-3.5 w-3.5" /></a>}
                {author?.twitterUrl && <a href={author.twitterUrl} target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/16 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-sky-400 hover:bg-sky-500 hover:shadow-[0_8px_18px_rgba(14,165,233,0.28)]"><Twitter className="h-3.5 w-3.5" /></a>}
                {author?.websiteUrl && <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/16 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-emerald-400 hover:bg-emerald-500 hover:shadow-[0_8px_18px_rgba(16,185,129,0.28)]"><Globe className="h-3.5 w-3.5" /></a>}
                {author?.contactEmail && <a href={`mailto:${author.contactEmail}`} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/16 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-amber-300 hover:bg-amber-400 hover:shadow-[0_8px_18px_rgba(251,191,36,0.28)]"><Mail className="h-3.5 w-3.5" /></a>}
                {author?.contactPhone && <a href={`tel:${author.contactPhone}`} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/16 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-cyan-300 hover:bg-cyan-400 hover:shadow-[0_8px_18px_rgba(34,211,238,0.28)]"><Phone className="h-3.5 w-3.5" /></a>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GRAPHIC FOOTER (purple cards, each author in own frame) ─────────────────
function GraphicFooter({
  authorName,
  coauthorName,
  coauthor2,
  coauthor3,
}: {
  authorName: string;
  coauthorName?: string;
  coauthor2?: string;
  coauthor3?: string;
}) {
  const authors = [authorName, coauthorName, coauthor2, coauthor3].filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div className="mb-2 flex justify-center">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          {authors.length > 1 ? "Autorzy artykułu" : "Autor artykułu"}
        </p>
      </div>
      {/* Author cards — each in its own purple-pink frame, side by side */}
      <div className="flex flex-wrap gap-3 justify-start">
        {authors.map((name) => (
          <SingleAuthorSlot key={name} authorName={name} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── CLASSIC FOOTER (light gradient) ─────────────────────────────────────────
function ClassicFooter({
  authorName,
  coauthorName,
  coauthor2,
  coauthor3,
}: {
  authorName: string;
  coauthorName?: string;
  coauthor2?: string;
  coauthor3?: string;
}) {
  const authors = [authorName, coauthorName, coauthor2, coauthor3].filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, transparent 60%)" }} />
      <div className="relative z-10 px-5 pt-4 pb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {authors.length > 1 ? "Autorzy artykułu" : "Autor artykułu"}
        </p>
      </div>
      <div className="relative z-10 px-5 pb-5 flex flex-wrap sm:flex-nowrap gap-4">
        {authors.map((name) => {
          const authorSlug = name.toLowerCase().replace(/\s+/g, "-");
          return (
            <ClassicAuthorSlot key={name} authorName={name} authorSlug={authorSlug} />
          );
        })}
      </div>
    </motion.div>
  );
}

function ClassicAuthorSlot({ authorName, authorSlug }: { authorName: string; authorSlug: string }) {
  const author = useQuery(api.users.getBySlugOrName, { identifier: authorName });
  const displayName = author?.name || authorName;
  const slug = author?.slug || authorSlug;

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Link to={`/autor/${slug}`} className="group shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all duration-300">
          {author?.image ? (
            <img src={author.image} alt={displayName} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User className="w-6 h-6 text-primary/40" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-col gap-0.5 min-w-0">
        <Link to={`/autor/${slug}`} className="group">
          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{displayName}</p>
        </Link>
        {author?.subtitle && <p className="text-xs text-muted-foreground truncate">{author.subtitle}</p>}
        <div className="flex items-center gap-1 mt-0.5">
          {author?.facebookUrl && <a href={author.facebookUrl} target="_blank" rel="noreferrer" className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"><Facebook className="w-3 h-3" /></a>}
          {author?.instagramUrl && <a href={author.instagramUrl} target="_blank" rel="noreferrer" className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-pink-600 transition-colors"><Instagram className="w-3 h-3" /></a>}
          {author?.twitterUrl && <a href={author.twitterUrl} target="_blank" rel="noreferrer" className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-sky-500 transition-colors"><Twitter className="w-3 h-3" /></a>}
          {author?.websiteUrl && <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-emerald-600 transition-colors"><Globe className="w-3 h-3" /></a>}
          {author?.contactEmail && <a href={`mailto:${author.contactEmail}`} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Mail className="w-3 h-3" /></a>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AuthorFooterCard({ authorName, coauthorName, coauthor2, coauthor3, style }: AuthorFooterCardProps) {
  if (!authorName) return null;
  if (style === "none") return null;

  if (style === "business") {
    const allAuthors = [authorName, coauthorName, coauthor2, coauthor3].filter(Boolean) as string[];
    return (
      <div className="mt-10 mb-6 space-y-4">
        {allAuthors.map(name => (
          <AuthorFooterCardBusiness key={name} authorName={name} />
        ))}
      </div>
    );
  }

  if (style === "classic") {
    return (
      <div className="mt-10 mb-6">
        <ClassicFooter
          authorName={authorName}
          coauthorName={coauthorName}
          coauthor2={coauthor2}
          coauthor3={coauthor3}
        />
      </div>
    );
  }

  // default / graphic
  return (
      <div className="mt-8 mb-3">
        <GraphicFooter
          authorName={authorName}
          coauthorName={coauthorName}
          coauthor2={coauthor2}
        coauthor3={coauthor3}
      />
    </div>
  );
}
