import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export default function StopPage() {
  const { stopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const selectedRoute = location.state?.selectedRoute;
  const [activeTab, setActiveTab] = useState<"nearest" | "full">("nearest");

  const stop = useQuery(api.gtfs.getStop, stopId ? { stop_id: stopId } : "skip");
  const stopDepartures = useQuery(api.gtfs.getStopDepartures, stopId ? { stop_id: stopId } : "skip");

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const activeServices = useQuery(api.gtfs.getActiveServices, { date: dateStr });

  const departures = useMemo(() => {
    if (!stopDepartures || !activeServices) return [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const activeServiceSet = new Set(activeServices);
    const validDepartures = stopDepartures.departures.filter((d: any) => activeServiceSet.has(d.service_id));
    return validDepartures.map((d: any) => {
      const [hours, minutes] = d.departure_time.split(':').map(Number);
      const depMinutes = hours * 60 + minutes;
      let diff = depMinutes - currentMinutes;
      if (diff < -12 * 60) diff += 24 * 60;
      const displayHours = hours % 24;
      return {
        ...d,
        diff,
        isPast: diff < 0,
        formattedTime: `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      };
    }).sort((a: any, b: any) => a.diff - b.diff);
  }, [stopDepartures, activeServices]);

  const nearestDepartures = useMemo(() => departures.filter((d: any) => !d.isPast).slice(0, 30), [departures]);

  const firstSelectedDeparture = useMemo(() => {
    if (!selectedRoute) return null;
    return nearestDepartures.find((d: any) =>
      d.route_short_name === selectedRoute &&
      (!location.state?.headsign || d.trip_headsign === location.state.headsign)
    );
  }, [nearestDepartures, selectedRoute, location.state?.headsign]);

  const fullSchedule = useMemo(() => {
    if (!stopDepartures) return {};
    const schedule: Record<string, any[]> = {};
    stopDepartures.departures.forEach((d: any) => {
      const key = `${d.route_short_name}_${d.trip_headsign}`;
      if (!schedule[key]) schedule[key] = [];
      schedule[key].push(d);
    });
    for (const key in schedule) {
      schedule[key].sort((a, b) => {
        const [hA, mA] = a.departure_time.split(':').map(Number);
        const [hB, mB] = b.departure_time.split(':').map(Number);
        return (hA * 60 + mA) - (hB * 60 + mB);
      });
    }
    return schedule;
  }, [stopDepartures]);

  if (stop === undefined || stopDepartures === undefined || activeServices === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {!isMobile && <Navbar />}
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop: isMobile ? "calc(5rem + env(safe-area-inset-top,0px))" : "7rem" }}>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {!isMobile && <Navbar />}
        <main className="flex-1 text-center" style={{ paddingTop: isMobile ? "calc(5rem + env(safe-area-inset-top,0px))" : "7rem" }}>
          <h1 className="text-2xl font-bold text-foreground">Nie znaleziono przystanku</h1>
          <button onClick={() => navigate('/rozklad')} className="mt-4 text-blue-500 hover:underline">Wróć do rozkładu</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}

      <main
        className="flex-1 pb-8 relative z-10"
        style={{ paddingTop: isMobile ? "calc(5rem + env(safe-area-inset-top,0px))" : "7rem", paddingBottom: isMobile ? "calc(6rem + env(safe-area-inset-bottom,0px))" : "2rem" }}
      >
        <div className={`${isMobile ? "max-w-md" : "max-w-2xl"} mx-auto px-4 sm:px-6 relative z-10`}>
          <button
            onClick={() => navigate('/rozklad')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-3 font-medium text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Wróć do spisu linii
          </button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6"
          >
            <div className="bg-blue-600 p-3 sm:p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[9px] sm:text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">Przystanek</h1>
                <h2 className="text-base sm:text-lg font-black">{stop.stop_name}</h2>
              </div>
            </div>

            <div className="flex border-b border-border/50">
              <button
                onClick={() => setActiveTab("nearest")}
                className={`flex-1 py-3 sm:py-2.5 text-center font-bold text-sm transition-colors ${
                  activeTab === "nearest"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                Najbliższe odjazdy
              </button>
              <button
                onClick={() => setActiveTab("full")}
                className={`flex-1 py-3 sm:py-2.5 text-center font-bold text-sm transition-colors ${
                  activeTab === "full"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                Pełny rozkład
              </button>
            </div>

            <div className="p-2 sm:p-3">
              {activeTab === "nearest" ? (
                <div className="space-y-3">
                  {firstSelectedDeparture && (
                    <div className="p-3 sm:p-4 rounded-xl border-2 border-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-orange-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                          {firstSelectedDeparture.route_short_name}
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-0.5">Wybrana linia</div>
                          <div className="font-bold text-sm sm:text-base text-foreground">{firstSelectedDeparture.trip_headsign}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">{firstSelectedDeparture.formattedTime}</div>
                        <div className="text-[10px] sm:text-xs font-bold text-orange-500">za {firstSelectedDeparture.diff} min</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Wszystkie odjazdy</h3>
                    {nearestDepartures.length > 0 ? (
                      nearestDepartures.map((dep: any, idx: number) => {
                        const isTram = dep.route_type === "0";
                        const isNight = dep.route_short_name.toUpperCase().endsWith('N');
                        let colorClass = "bg-blue-500";
                        if (isTram) colorClass = "bg-red-500";
                        else if (isNight) colorClass = "bg-slate-700";
                        return (
                          <div key={idx} className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-md ${colorClass} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                                {dep.route_short_name}
                              </div>
                              <div className="font-bold text-xs sm:text-sm text-foreground">{dep.trip_headsign}</div>
                            </div>
                            <div className="text-right flex items-center gap-3 whitespace-nowrap">
                              <div className="text-sm sm:text-base font-bold text-foreground">{dep.formattedTime}</div>
                              <div className={`text-[10px] sm:text-xs font-bold min-w-[3.5rem] text-right ${dep.diff <= 5 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                                {dep.diff} min
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium">Brak odjazdów w najbliższym czasie</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(fullSchedule).map(([key, deps]) => {
                    const [routeShortName, headsign] = key.split('_');
                    const isTram = deps[0].route_type === "0";
                    const isNight = routeShortName.toUpperCase().endsWith('N');
                    const isSelected = routeShortName === selectedRoute;
                    let colorClass = "bg-blue-500";
                    let lightColorClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300";
                    if (isTram) { colorClass = "bg-red-500"; lightColorClass = "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300"; }
                    else if (isNight) { colorClass = "bg-slate-700"; lightColorClass = "bg-muted text-foreground"; }

                    const byHour: Record<number, { displayHour: string, minutes: string[] }> = {};
                    deps.forEach(d => {
                      const [h, m] = d.departure_time.split(':').map(Number);
                      if (!byHour[h]) byHour[h] = { displayHour: (h % 24).toString().padStart(2, '0'), minutes: [] };
                      byHour[h].minutes.push(m.toString().padStart(2, '0'));
                    });

                    return (
                      <div key={key} className={`border rounded-xl overflow-hidden ${isSelected ? 'border-blue-400 shadow-sm ring-1 ring-blue-400/20' : 'border-border/50'}`}>
                        <div className={`${lightColorClass} p-2 sm:p-3 flex items-center gap-2.5 border-b border-border/30`}>
                          <div className={`w-7 h-7 rounded-md ${colorClass} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                            {routeShortName}
                          </div>
                          <div>
                            <div className="text-[9px] font-bold opacity-70 uppercase tracking-wider">Kierunek</div>
                            <div className="font-bold text-xs sm:text-sm">{headsign}</div>
                          </div>
                        </div>
                        <div className="flex flex-col divide-y divide-border/30">
                          {Object.entries(byHour).sort(([a], [b]) => Number(a) - Number(b)).map(([hour, data]) => (
                            <div key={hour} className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                              <div className="w-10 font-black text-muted-foreground text-base sm:text-lg text-right pr-3 border-r border-border/40">
                                {data.displayHour}
                              </div>
                              <div className="flex-1 flex flex-wrap gap-1.5 pl-3 py-1">
                                {data.minutes.map((m, i) => (
                                  <span key={i} className="px-2 py-1 bg-card border border-border/50 shadow-sm rounded-md font-bold text-foreground text-xs sm:text-sm hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 hover:border-blue-200 transition-colors cursor-default">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {!isMobile && <Footer />}
    </div>
  );
}