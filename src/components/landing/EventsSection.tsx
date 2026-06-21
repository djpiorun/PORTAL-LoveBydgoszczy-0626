import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";
import { Music, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

type EventFilter = "all" | "today" | "weekend" | "free";

const normalizeEvent = (event: any) => ({
  _id: String(event?.id ?? event?._id ?? ""),
  title: event?.title ?? "",
  description: event?.description ?? "",
  category: event?.category ?? "",
  imageUrl: event?.imageUrl ?? event?.image_url ?? null,
  location: event?.location ?? "",
  startDate: event?.startDate ?? event?.start_date ?? Date.now(),
  endDate: event?.endDate ?? event?.end_date ?? null,
  price: event?.price ?? null,
  organizer: event?.organizer ?? null,
});

const normalizeEventsPayload = (payload: any) => {
  const data = payload?.data ?? payload?.events ?? payload?.results ?? payload ?? [];
  return Array.isArray(data) ? data.map(normalizeEvent) : [];
};

export default function EventsSection() {
  const [events, setEvents] = useState<any[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");

  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      try {
        const payload = await apiFetch("/events?limit=6");
        if (!active) return;
        setEvents(normalizeEventsPayload(payload));
      } catch (error) {
        if (!active) return;
        setEvents([]);
        toast.warning("Wydarzenia są chwilowo niedostępne.");
      }
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  const filters: { key: EventFilter; label: string }[] = [
    { key: "all", label: "Wszystkie" },
    { key: "today", label: "Dziś" },
    { key: "weekend", label: "Weekend" },
    { key: "free", label: "Darmowe" },
  ];

  const filteredEvents = events?.filter((event) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "free") return event.price?.toLowerCase().includes("bezpłat") || event.price?.toLowerCase().includes("darmow") || event.price === "0";
    if (activeFilter === "today") {
      const today = new Date();
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === today.toDateString();
    }
    if (activeFilter === "weekend") {
      const eventDate = new Date(event.startDate);
      const day = eventDate.getDay();
      return day === 0 || day === 6;
    }
    return true;
  });

  return (
    <section id="wydarzenia" className="relative overflow-hidden pt-12 pb-20 bg-[linear-gradient(180deg,rgba(248,250,252,0.84),rgba(248,250,252,0.92)_54%,rgba(255,247,237,0.82)_100%)] scroll-mt-20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_18%_100%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_82%_100%,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,transparent,rgba(255,247,237,0.6))]" />
      <div className="pointer-events-none absolute right-[8%] top-10 h-24 w-24 rounded-full bg-fuchsia-100/20 blur-3xl" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black">Nadchodzące Wydarzenia</h2>
              <p className="text-xs text-muted-foreground">Co dzieje się w Bydgoszczy</p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === f.key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-background border border-border hover:bg-muted text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {!events ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredEvents && filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">Brak wydarzeń w tej kategorii</p>
            <p className="text-xs mt-1">Sprawdź inne filtry</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            initial={false}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {(filteredEvents ?? events ?? []).map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
