import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

interface PartnerLogosStripProps {
  title?: string;
  className?: string;
  maxItems?: number;
}

const normalizePartner = (partner: any) => ({
  _id: String(partner?.id ?? partner?._id ?? ""),
  name: partner?.name ?? "",
  logoUrl: partner?.logoUrl ?? partner?.logo_url ?? partner?.logo ?? null,
  website: partner?.website ?? partner?.website_url ?? null,
});

const normalizePartnersPayload = (payload: any) => {
  const data = payload?.data ?? payload?.partners ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizePartner) : [];
};

export default function PartnerLogosStrip({ title = "Partnerzy portalu", className = "", maxItems = 8 }: PartnerLogosStripProps) {
  const [partners, setPartners] = useState<any[] | null>(null);

  useEffect(() => {
    let active = true;
    const loadPartners = async () => {
      try {
        const payload = await apiFetch(`/ads/partners?limit=${maxItems}`);
        if (!active) return;
        setPartners(normalizePartnersPayload(payload));
      } catch (error) {
        if (!active) return;
        setPartners([]);
        toast.warning("Partnerzy są chwilowo niedostępni.");
      }
    };

    loadPartners();
    return () => {
      active = false;
    };
  }, [maxItems]);

  const marqueePartners = useMemo(() => {
    if (!partners || partners.length === 0) return [];
    return [...partners, ...partners];
  }, [partners]);

  if (partners === null) return null;
  if (partners.length === 0) return null;

  return (
    <section className={`py-5 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">{title}</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-300/70 via-slate-200/60 to-transparent dark:from-slate-600/70 dark:via-slate-700/70" />
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 26, ease: "linear", repeat: Infinity }}
          className="flex w-max items-center gap-10 py-2"
        >
          {marqueePartners.map((partner, index) => (
            <a
              key={`${partner._id}-${index}`}
              href={partner.website || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 min-w-[120px] items-center justify-center text-slate-700 transition-transform duration-300 hover:-translate-y-0.5 dark:text-slate-100"
            >
              {partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-h-10 w-auto max-w-[140px] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100 dark:brightness-110 dark:contrast-110"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
              ) : (
                <span className="truncate text-sm font-semibold tracking-[0.08em] text-slate-600 dark:text-slate-200">
                  {partner.name}
                </span>
              )}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
