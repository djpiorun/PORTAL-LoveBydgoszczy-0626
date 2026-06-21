import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, User, ArrowLeft, Share2, Heart, Ticket, Info } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  miasto: "bg-blue-500",
  rozrywka: "bg-purple-500",
  kultura: "bg-amber-500",
  biznes: "bg-emerald-500",
  gastronomia: "bg-orange-500",
};

const categoryLabels: Record<string, string> = {
  miasto: "Miasto",
  rozrywka: "Rozrywka",
  kultura: "Kultura",
  biznes: "Biznes",
  gastronomia: "Gastronomia",
};

function formatEventDate(ts: number) {
  return new Date(ts).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const normalizeEvent = (event: any) => ({
  _id: String(event?.id ?? event?._id ?? ""),
  title: event?.title ?? "",
  description: event?.description ?? "",
  category: event?.category ?? "miasto",
  imageUrl: event?.imageUrl ?? event?.image_url ?? null,
  location: event?.location ?? "",
  startDate: event?.startDate ?? event?.start_date ?? Date.now(),
  endDate: event?.endDate ?? event?.end_date ?? null,
  price: event?.price ?? null,
  organizer: event?.organizer ?? null,
});

const normalizeEventPayload = (payload: any) => {
  const data = payload?.data ?? payload?.event ?? payload;
  return data ? normalizeEvent(data) : null;
};

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Guard against invalid IDs (e.g. literal ":id" from template URLs)
  const isValidId = id && id !== ":id" && !id.startsWith(":");

  useEffect(() => {
    if (!isValidId) return;
    let active = true;
    setIsLoading(true);

    apiFetch(`/events/${id}`)
      .then((payload) => {
        if (!active) return;
        const normalized = normalizeEventPayload(payload);
        setEvent(normalized && normalized._id ? normalized : null);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
        toast.error("Nie udało się pobrać wydarzenia.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isValidId]);

  if (!isValidId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground mb-2">Nie znaleziono wydarzenia</p>
            <p className="text-muted-foreground mb-4">Podany identyfikator jest nieprawidłowy.</p>
            <button onClick={() => navigate("/")} className="text-primary font-semibold hover:underline">Wróć na stronę główną</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Ładowanie wydarzenia...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground mb-2">Nie znaleziono wydarzenia</p>
            <p className="text-muted-foreground mb-4">Wydarzenie jest niedostępne lub zostało usunięte.</p>
            <button onClick={() => navigate("/")} className="text-primary font-semibold hover:underline">Wróć na stronę główną</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title={event.title} 
        description={event.description} 
        image={event.imageUrl}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <article className="max-w-5xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Wróć
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${categoryColors[event.category]} uppercase tracking-wider`}>
                    {categoryLabels[event.category]}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6 text-foreground">
                  {event.title}
                </h1>
              </motion.div>

              {event.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full h-[300px] sm:h-[400px] rounded-[2rem] overflow-hidden mb-8 shadow-xl"
                >
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="prose prose-lg dark:prose-invert max-w-none"
              >
                <h2 className="text-2xl font-bold mb-4">O wydarzeniu</h2>
                <p className="text-foreground leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-[2rem] p-6 shadow-lg sticky top-28">
                <h3 className="text-xl font-bold mb-6">Szczegóły</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Data i czas</p>
                      <p className="font-semibold text-foreground">{formatEventDate(event.startDate)}</p>
                      {event.endDate && (
                        <p className="text-sm text-muted-foreground mt-1">do {formatEventDate(event.endDate)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Lokalizacja</p>
                      <p className="font-semibold text-foreground">{event.location}</p>
                    </div>
                  </div>

                  {event.price && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Ticket className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Bilety</p>
                        <p className="font-semibold text-foreground">{event.price}</p>
                      </div>
                    </div>
                  )}

                  {event.organizer && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Organizator</p>
                        <p className="font-semibold text-foreground">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full mt-8 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  Zapisz się / Kup bilet
                </button>
              </div>
            </motion.div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}