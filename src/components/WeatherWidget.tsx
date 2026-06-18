import { motion } from "framer-motion";
import { Cloud, Sun, Moon, CloudRain, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchBydgoszczWeather, toWeatherSummary, type WeatherSummary } from "@/lib/weather";

function WeatherIcon({ icon, isDay = true, size = "md" }: { icon: string; isDay?: boolean; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-12 h-12" : size === "sm" ? "w-4 h-4" : "w-8 h-8";
  if (icon === "sunny") return isDay ? <Sun className={`${cls} text-yellow-400`} /> : <Moon className={`${cls} text-blue-200`} />;
  if (icon === "partly-cloudy") return isDay ? <Cloud className={`${cls} text-slate-100`} /> : <Cloud className={`${cls} text-slate-300`} />;
  if (icon === "rainy") return <CloudRain className={`${cls} text-blue-200`} />;
  return <Cloud className={`${cls} text-slate-100`} />;
}

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        // Cache weather in sessionStorage for 30 minutes to avoid re-fetching on every navigation
        const CACHE_KEY = "weather_bydgoszcz";
        const CACHE_TTL = 30 * 60 * 1000;
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL && data) {
            if (!cancelled) setWeatherData(data);
            return;
          }
        }
        const raw = await fetchBydgoszczWeather();
        const summary = raw ? toWeatherSummary(raw) : null;
        if (!cancelled && summary) {
          setWeatherData(summary);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: summary, ts: Date.now() }));
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!weatherData) {
    return (
      <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm h-[100px] bg-slate-50 animate-pulse flex items-center justify-center">
        <Cloud className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  const w = weatherData;

  return (
    <motion.div
      onClick={() => navigate("/pogoda")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl overflow-hidden shadow-lg p-5 relative group hover:shadow-xl transition-all cursor-pointer ${w.isDay ? "bg-blue-500 bg-gradient-to-br from-blue-400 to-blue-600 text-white" : "bg-slate-800 bg-gradient-to-br from-slate-800 to-indigo-950 text-white"}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
            <WeatherIcon icon={w.icon} isDay={w.isDay} size="md" />
          </div>
          <div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter leading-none">{w.temp}°</span>
              <span className="text-sm text-white/90 font-medium leading-tight mt-1">{w.condition}</span>
            </div>
            {w.aqi > 0 && (
              <div className="mt-2">
                <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md text-white shadow-sm ${w.aqi < 50 ? "bg-emerald-500" : w.aqi < 100 ? "bg-amber-500" : "bg-rose-500"}`}>
                  Jakosc powietrza: {w.aqi < 50 ? "Dobra" : w.aqi < 100 ? "Srednia" : "Krytyczna"}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0">
          <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
