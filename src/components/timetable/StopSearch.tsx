import { Search, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

interface StopSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stopResults?: any[];
}

export default function StopSearch({ searchQuery, setSearchQuery, stopResults }: StopSearchProps) {
  const navigate = useNavigate();

  return (
    <div className="relative mb-6 sm:mb-10 max-w-3xl mx-auto mt-2 sm:-mt-8 z-30 px-4 sm:px-0">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Wpisz nazwę przystanku... (np. Rondo Jagiellonów)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Szukaj przystanku"
          className="w-full pl-16 sm:pl-20 pr-4 sm:pr-6 py-4 sm:py-5 bg-card border border-border shadow-xl rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-sm sm:text-lg font-medium placeholder:text-muted-foreground text-foreground"
        />
        
        {stopResults && stopResults.length > 0 && (
          <div className="absolute z-40 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {stopResults.map((stop: any) => (
              <button
                key={stop.stop_id}
                onClick={() => navigate(`/rozklad-jazdy/przystanek/${stop.stop_id}`)}
                className="w-full text-left px-6 py-4 hover:bg-muted/50 flex items-center gap-4 border-b border-border/50 last:border-0 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                  <MapPin className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-foreground text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                    {stop.stop_name}
                  </span>
                  {stop.routes && stop.routes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {stop.routes.slice(0, 8).map((r: string) => (
                        <span key={r} className="text-[11px] font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded-md group-hover:bg-blue-100 group-hover:text-blue-700 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-300 transition-colors">
                          {r}
                        </span>
                      ))}
                      {stop.routes.length > 8 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                          +{stop.routes.length - 8}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}