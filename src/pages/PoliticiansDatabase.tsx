import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Search, Building2, Mail, Globe, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { fetchPoliticians } from "@/lib/politicians-api";
import { toast } from "sonner";

const normalizePolitician = (politician: any) => ({
  _id: String(politician?.id ?? politician?._id ?? ""),
  slug: politician?.slug ?? "",
  fullName: politician?.fullName ?? politician?.full_name ?? "",
  photo: politician?.photo ?? politician?.photo_url ?? null,
  party: politician?.party ?? null,
  position: politician?.position ?? null,
  facebookUrl: politician?.facebookUrl ?? politician?.facebook_url ?? null,
  twitterUrl: politician?.twitterUrl ?? politician?.twitter_url ?? null,
  websiteUrl: politician?.websiteUrl ?? politician?.website_url ?? null,
  bio: politician?.bio ?? null,
  email: politician?.email ?? null,
});

const normalizePoliticiansPayload = (payload: any) => {
  const data = payload?.data ?? payload?.politicians ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizePolitician) : [];
};

export default function PoliticiansDatabase() {
  const [politicians, setPoliticians] = useState<any[] | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;
    fetchPoliticians()
      .then((payload) => {
        if (!active) return;
        setPoliticians(normalizePoliticiansPayload(payload));
      })
      .catch(() => {
        if (!active) return;
        setPoliticians([]);
        toast.warning("Nie udało się pobrać bazy polityków.");
      });

    return () => {
      active = false;
    };
  }, []);

  // Get unique parties
  const parties = Array.from(
    new Set(politicians?.map(p => p.party).filter(Boolean) || [])
  );

  const filteredPoliticians = politicians?.filter(politician => {
    const matchesSearch = !searchTerm ||
      politician.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      politician.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesParty = partyFilter === "all" || politician.party === partyFilter;

    return matchesSearch && matchesParty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50 py-16 dark:from-slate-950/20 dark:via-slate-900 dark:to-gray-950/20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800">
              <User className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-300">
                Baza Polityków
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-black text-foreground md:text-5xl">
              Politycy Bydgoszczy
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Kompletna baza polityków działających w Bydgoszczy
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="border-b border-border bg-card/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj polityka..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Party Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPartyFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  partyFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Wszystkie
              </button>
              {parties.map(party => party && (
                <button
                  key={party}
                  onClick={() => setPartyFilter(party)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    partyFilter === party
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {party}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Politicians Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!filteredPoliticians ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : filteredPoliticians.length === 0 ? (
          <div className="py-20 text-center">
            <User className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-bold text-foreground">Brak wyników</h3>
            <p className="text-muted-foreground">
              Nie znaleziono polityków spełniających kryteria wyszukiwania.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPoliticians.map((politician, index) => (
              <motion.div
                key={politician._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group overflow-hidden rounded-3xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg dark:border-border/30"
              >
                {/* Photo */}
                {politician.photo ? (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={politician.photo}
                      alt={politician.fullName}
                      className="h-32 w-32 rounded-2xl object-cover shadow-md ring-4 ring-border/20"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-5xl font-black text-white shadow-md">
                      {politician.fullName[0]}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="text-center">
                  <h3 className="mb-1 text-xl font-black text-foreground">
                    {politician.fullName}
                  </h3>
                  {politician.position && (
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">
                      {politician.position}
                    </p>
                  )}
                  {politician.party && (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold">{politician.party}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {politician.bio && (
                  <p className="mt-4 line-clamp-3 text-sm text-foreground/80">
                    {politician.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="mt-4 flex justify-center gap-2">
                  {politician.facebookUrl && (
                    <a
                      href={politician.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {politician.twitterUrl && (
                    <a
                      href={politician.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {politician.websiteUrl && (
                    <a
                      href={politician.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
