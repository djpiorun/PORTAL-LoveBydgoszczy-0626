// src/pages/TimetablePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bus, TrainFront, Moon, Map as MapIcon } from "lucide-react";
import RouteCategory from "@/components/timetable/RouteCategory";
import StopSearch from "@/components/timetable/StopSearch";
import TimetableHero from "@/components/timetable/TimetableHero";
import TimetableEmptyState from "@/components/timetable/TimetableEmptyState";

export default function TimetablePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const metadata = useQuery(api.gtfs.getMetadata);
  const routes = useQuery(api.gtfs.getRoutes);
  const stopResults = useQuery(api.gtfs.searchStops, searchQuery.length > 2 ? { searchQuery } : "skip");

  const uniqueRoutes = routes ? Array.from(new Map(routes.map(r => [r.route_short_name, r])).values()).sort((a, b) => {
    const numA = parseInt(a.route_short_name);
    const numB = parseInt(b.route_short_name);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.route_short_name.localeCompare(b.route_short_name);
  }) : [];

  const tramLines = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
  const intercityLines = ["40", "41", "42", "43", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"];
  
  const trams = uniqueRoutes.filter(r => tramLines.includes(r.route_short_name));
  const nightBuses = uniqueRoutes.filter(r => r.route_short_name.toUpperCase().endsWith('N'));
  const intercityBuses = uniqueRoutes.filter(r => intercityLines.includes(r.route_short_name));
  const dayBuses = uniqueRoutes.filter(r => 
    !tramLines.includes(r.route_short_name) && 
    !intercityLines.includes(r.route_short_name) && 
    !r.route_short_name.toUpperCase().endsWith('N')
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 relative z-10 bg-slate-50/80">
        {/* Background graphics */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img src="https://harmless-tapir-303.convex.cloud/api/storage/279b9aed-06a2-4f90-8ec6-6631b64751e7" alt="" className="absolute left-0 top-1/4 h-[60vh] object-contain opacity-[0.03] -translate-x-1/4" />
          <img src="https://harmless-tapir-303.convex.cloud/api/storage/3fa75e41-1cde-48ef-88ad-cd2da549887a" alt="" className="absolute right-0 bottom-0 h-[50vh] object-contain opacity-[0.03] translate-x-1/4" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Section */}
          <TimetableHero />

          {/* Search */}
          <StopSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} stopResults={stopResults} />

          {!routes && (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {routes && routes.length === 0 && (
            <TimetableEmptyState />
          )}

          {routes && routes.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              <RouteCategory
                title="Tramwaje"
                subtitle="Linie dzienne"
                icon={TrainFront}
                iconColorClass="text-red-500"
                iconBgClass="bg-red-50"
                routes={trams}
                hoverBgClass="hover:bg-red-500"
                hoverTextClass="hover:text-white"
                hoverBorderClass="hover:border-red-500"
              />
              <RouteCategory
                title="Autobusy miejskie"
                subtitle="Linie dzienne"
                icon={Bus}
                iconColorClass="text-blue-500"
                iconBgClass="bg-blue-50"
                routes={dayBuses}
                hoverBgClass="hover:bg-blue-500"
                hoverTextClass="hover:text-white"
                hoverBorderClass="hover:border-blue-500"
              />
              <RouteCategory
                title="Autobusy międzygminne"
                subtitle="Linie podmiejskie"
                icon={MapIcon}
                iconColorClass="text-green-500"
                iconBgClass="bg-green-50"
                routes={intercityBuses}
                hoverBgClass="hover:bg-green-500"
                hoverTextClass="hover:text-white"
                hoverBorderClass="hover:border-green-500"
              />
              <RouteCategory
                title="Autobusy nocne"
                subtitle="Linie nocne"
                icon={Moon}
                iconColorClass="text-white"
                iconBgClass="bg-slate-800"
                routes={nightBuses}
                hoverBgClass="hover:bg-slate-800"
                hoverTextClass="hover:text-white"
                hoverBorderClass="hover:border-slate-800"
              />
            </div>
          )}

          <div className="mt-12 text-center pb-4 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Rozkład Jazdy dostępny dzięki ZDMiKP w Bydgoszczy.
            </p>
            {metadata && (
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span>Stan danych:</span>
                <span className="font-bold text-slate-700">
                  {new Date(metadata.last_update).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}