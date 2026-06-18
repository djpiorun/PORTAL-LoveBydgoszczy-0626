import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, ArrowDownUp, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export default function RoutePage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeDirection, setActiveDirection] = useState<number>(0);

  const routeDetails = useQuery(api.gtfs.getRouteDetails, routeId ? { route_short_name: routeId } : "skip");

  if (routeDetails === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {!isMobile && <Navbar />}
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop: isMobile ? "calc(5rem + env(safe-area-inset-top,0px))" : "7rem" }}>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!routeDetails || routeDetails.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {!isMobile && <Navbar />}
        <main className="flex-1 text-center" style={{ paddingTop: isMobile ? "calc(5rem + env(safe-area-inset-top,0px))" : "7rem" }}>
          <h1 className="text-2xl font-bold text-foreground">Nie znaleziono linii</h1>
          <button onClick={() => navigate('/rozklad')} className="mt-4 text-blue-500 hover:underline">Wróć do rozkładu</button>
        </main>
      </div>
    );
  }

  const route = routeDetails[0].route;
  let displayDirections = [...routeDetails[0].directions];
  
  if (displayDirections.length === 1 && displayDirections[0].stops.length > 1) {
    const originalStops = displayDirections[0].stops;
    const reversedStops = [...originalStops].reverse();
    displayDirections.push({
      direction_id: "1",
      headsign: originalStops[0].stop_name,
      stops: reversedStops
    });
  }

  const stops = displayDirections[activeDirection]?.stops || [];
  const isTram = String(route.route_type) === "0";
  const isNight = route.route_short_name.toUpperCase().endsWith('N');
  
  let colorClass = "bg-blue-500";
  let lightColorClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300";
  let borderColorClass = "border-blue-500";
  let hoverBgClass = "hover:bg-blue-500";
  let hoverBorderClass = "hover:border-blue-500";
  
  if (isTram) {
    colorClass = "bg-red-500";
    lightColorClass = "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300";
    borderColorClass = "border-red-500";
    hoverBgClass = "hover:bg-red-500";
    hoverBorderClass = "hover:border-red-500";
  } else if (isNight) {
    colorClass = "bg-slate-700";
    lightColorClass = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    borderColorClass = "border-slate-700";
    hoverBgClass = "hover:bg-slate-700";
    hoverBorderClass = "hover:border-slate-700";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}
      
      <main
        className="flex-1 pb-8 relative z-10"
        style={{ paddingTop: isMobile ? "calc(5rem + env(safe-area-inset-top,0px))" : "7rem" }}
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
            <div className={`${colorClass} p-3 sm:p-4 text-white flex items-center gap-3`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white text-slate-900 flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm shrink-0">
                {route.route_short_name}
              </div>
              <div>
                <h1 className="text-[9px] sm:text-[10px] font-bold opacity-90 uppercase tracking-wider mb-0.5">
                  Linia {isTram ? 'Tramwajowa' : isNight ? 'Autobusowa Nocna' : 'Autobusowa'}
                </h1>
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold">
                  <span>{displayDirections[0]?.headsign || route.route_long_name}</span>
                  {displayDirections.length > 1 && (
                    <>
                      <ArrowDownUp className="w-3 h-3 opacity-70" />
                      <span>{displayDirections[1]?.headsign}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-2 bg-muted/30 border-b border-border/50">
              <div className="flex flex-col sm:flex-row gap-2">
                {displayDirections.map((dir: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDirection(idx)}
                    className={`flex-1 flex items-center justify-center p-3 sm:p-2 rounded-lg border transition-all ${
                      activeDirection === idx 
                        ? `${borderColorClass} ${lightColorClass} shadow-sm font-bold` 
                        : 'border-border hover:border-border/80 bg-card text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-xs sm:text-sm text-center">{dir.headsign}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 sm:p-3">
              <div className="relative">
                <div className={`absolute top-4 bottom-4 left-[21px] sm:left-[17px] w-0.5 ${colorClass} opacity-20 rounded-full`} />
                
                <div className="space-y-0 relative z-10">
                  {stops.map((st: any, idx: number) => {
                    const isFirst = idx === 0;
                    const isLast = idx === stops.length - 1;
                    const isEndpoint = isFirst || isLast;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => navigate(`/rozklad-jazdy/przystanek/${st.stop_id}`, { state: { selectedRoute: route.route_short_name, headsign: displayDirections[activeDirection]?.headsign } })}
                        className={`w-full flex items-center gap-3 p-3 sm:p-2 hover:bg-muted/40 rounded-lg transition-all group text-left relative z-10 ${isEndpoint ? 'bg-muted/20' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-card border-2 ${isEndpoint ? borderColorClass : 'border-border'} flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-sm ${hoverBgClass} ${hoverBorderClass}`}>
                          {isEndpoint ? (
                            <div className={`w-1.5 h-1.5 rounded-full ${colorClass} group-hover:bg-white transition-colors`} />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-white transition-colors" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`font-bold transition-colors text-xs sm:text-sm ${isEndpoint ? 'text-foreground' : 'text-foreground/80'} group-hover:text-blue-600 dark:group-hover:text-blue-400`}>
                            {st.stop_name}
                          </span>
                          {isFirst && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase">Początkowy</span>}
                          {isLast && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase">Końcowy</span>}
                        </div>
                        <div className="text-muted-foreground/40 group-hover:text-blue-500 transition-colors bg-card p-1 rounded-full shadow-sm border border-border/50 opacity-0 group-hover:opacity-100">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {!isMobile && <Footer />}
    </div>
  );
}