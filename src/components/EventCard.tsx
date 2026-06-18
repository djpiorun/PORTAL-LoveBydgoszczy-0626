import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket, Heart, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    location: string;
    startDate: number;
    endDate?: number;
    price?: string;
    organizer?: string;
  };
  index?: number;
}

function formatEventDate(ts: number) {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysUntil(ts: number) {
  const diff = ts - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return "Dziś";
  if (days === 1) return "Jutro";
  if (days <= 7) return `Za ${days} dni`;
  return null;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dateStr = event.endDate
    ? `${formatEventDate(event.startDate)} – ${formatEventDate(event.endDate)}`
    : formatEventDate(event.startDate);
  const daysUntil = getDaysUntil(event.startDate);

  return (
    <motion.div
      onClick={() => navigate(`/wydarzenie/${event._id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative overflow-hidden border cursor-pointer flex flex-col h-full transition-all duration-500 ${
        isMobile
          ? "rounded-[1.6rem] border-border/60 bg-card/96 shadow-[0_14px_40px_rgba(15,23,42,0.10)] backdrop-blur-sm"
          : "rounded-[1.5rem] bg-card border-border shadow-sm hover:shadow-xl"
      }`}
    >
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden shrink-0 p-2.5">
          <div className="w-full h-full rounded-[1rem] overflow-hidden relative">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Category */}
            <div className="absolute top-2.5 left-2.5">
              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full text-white ${categoryColors[event.category]} shadow-md uppercase tracking-wider`}>
                {categoryLabels[event.category]}
              </span>
            </div>

            {/* Price */}
            {event.price && (
              <div className="absolute top-2.5 right-2.5">
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-foreground shadow-md flex items-center gap-1">
                  <Ticket className="w-2.5 h-2.5 text-primary" />
                  {event.price}
                </span>
              </div>
            )}

            {/* Days until badge */}
            {daysUntil && (
              <div className="absolute bottom-2.5 left-2.5">
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary text-white shadow-md flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {daysUntil}
                </span>
              </div>
            )}

            {/* Favorite */}
            <button
              className={`absolute bottom-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-white/20 text-white hover:bg-white/40"
              }`}
              onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            >
              <Heart className={`w-3 h-3 ${isFavorite ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>
      )}
      <div className={`${isMobile ? "px-4 pb-3 pt-1.5" : "px-4 pb-3 pt-1"} flex flex-col flex-1`}>
        <div className="flex-1 mb-3">
          <h3 className="font-bold text-base leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>
        </div>

        <div className={`space-y-2 text-xs font-medium text-foreground ${isMobile ? "bg-muted/60 p-3 rounded-2xl" : "bg-muted/50 p-2.5 rounded-xl"}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-sm">
              <Calendar className="w-3 h-3 text-primary" />
            </div>
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-sm">
              <MapPin className="w-3 h-3 text-primary" />
            </div>
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}