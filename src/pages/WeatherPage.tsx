import { useEffect, useState } from "react";
import { Cloud, Sun, Moon, CloudRain, Wind, Droplets, Thermometer, Gauge, ArrowLeft, Snowflake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { fetchBydgoszczWeather, toWeatherDetails, type WeatherDetails } from "@/lib/weather";
import { useIsMobile } from "@/hooks/use-mobile";

function WeatherIcon({ icon, isDay = true, size = "md" }: { icon: string; isDay?: boolean; size?: "sm" | "md" | "lg" | "xl" }) {
  const cls = size === "xl" ? "w-20 h-20" : size === "lg" ? "w-14 h-14" : size === "sm" ? "w-4 h-4" : "w-7 h-7";
  if (icon === "sunny") return isDay ? <Sun className={`${cls} text-yellow-300`} /> : <Moon className={`${cls} text-blue-200`} />;
  if (icon === "partly-cloudy") return <Cloud className={`${cls} text-slate-200`} />;
  if (icon === "rainy") return <CloudRain className={`${cls} text-blue-300`} />;
  if (icon === "snowy") return <Snowflake className={`${cls} text-blue-100`} />;
  return <Cloud className={`${cls} text-slate-300`} />;
}

function MobileWeatherSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-56 rounded-[2rem] bg-muted/60" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[1.5rem] bg-muted/50" />)}
      </div>
      <div className="h-48 rounded-[1.75rem] bg-muted/50" />
    </div>
  );
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBydgoszczWeather()
      .then(data => {
        const details = data ? toWeatherDetails(data) : null;
        if (!cancelled && details) setWeatherData(details);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statCards = weatherData ? [
    { label: "Wiatr", value: `${weatherData.wind} km/h`, icon: Wind, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Wilgotność", value: `${weatherData.humidity}%`, icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
    { label: "Ciśnienie", value: `${weatherData.pressure} hPa`, icon: Gauge, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { label: "Odczuwalna", value: `${weatherData.feelsLike}°C`, icon: Thermometer, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  ] : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}

      <main className={`flex-1 ${isMobile ? "pt-[calc(4.8rem+env(safe-area-inset-top,0px))] pb-[calc(5.9rem+env(safe-area-inset-bottom,0px))]" : "pt-28 pb-16"}`}>
        <div className={`${isMobile ? "max-w-md" : "max-w-4xl"} mx-auto px-4 sm:px-6 lg:px-8`}>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </button>

          {loading ? (
            <MobileWeatherSkeleton />
          ) : !weatherData ? (
            <div className="flex flex-col items-center py-20 text-muted-foreground">
              <Cloud className="w-12 h-12 mb-4 opacity-30" />
              <p className="font-bold">Nie udało się załadować pogody</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={isMobile ? "space-y-3" : "space-y-6"}
            >
              {/* Hero card */}
              <div
                className={`relative overflow-hidden ${isMobile ? "rounded-[2rem] p-5" : "rounded-[2.5rem] p-10 shadow-xl"}`}
                style={{
                  background: weatherData.isDay
                    ? "linear-gradient(145deg, #3b82f6, #0ea5e9, #06b6d4)"
                    : "linear-gradient(145deg, #1e293b, #312e81, #1e1b4b)",
                }}
              >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

                <div className="relative z-10">
                  {/* City + condition */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Aktualna pogoda</p>
                      <h1 className={`${isMobile ? "text-3xl" : "text-5xl"} font-black tracking-tight text-white`}>
                        {weatherData.city}
                      </h1>
                      <p className={`${isMobile ? "text-sm" : "text-lg"} text-white/80 font-medium mt-1`}>
                        {weatherData.condition}
                      </p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white/15 backdrop-blur-sm">
                      <WeatherIcon icon={weatherData.icon} isDay={weatherData.isDay} size={isMobile ? "lg" : "xl"} />
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="mt-5 flex items-end gap-4">
                    <span className={`${isMobile ? "text-7xl" : "text-8xl"} font-black tracking-tighter text-white leading-none`}>
                      {weatherData.temp}°
                    </span>
                    <div className="mb-2 flex flex-col gap-1 text-white/70 text-sm font-medium">
                      <span>Odczuwalna: {weatherData.feelsLike}°</span>
                      {weatherData.aqi > 0 && (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${
                            weatherData.aqi < 50 ? "bg-emerald-500/70" : weatherData.aqi < 100 ? "bg-amber-500/70" : "bg-rose-500/70"
                          }`}
                        >
                          AQI: {weatherData.aqi}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className={`grid ${isMobile ? "grid-cols-2 gap-3" : "grid-cols-4 gap-4"}`}>
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-card border border-border rounded-[1.5rem] p-4 flex flex-col items-center text-center gap-2.5 shadow-sm">
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                      <p className={`${isMobile ? "text-lg" : "text-xl"} font-black text-foreground`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Forecast */}
              <div className={`bg-card border border-border shadow-sm ${isMobile ? "rounded-[1.75rem] p-4" : "rounded-3xl p-6"}`}>
                <h3 className={`${isMobile ? "text-base" : "text-xl"} font-black text-foreground mb-4 tracking-[-0.02em]`}>
                  Prognoza na kolejne dni
                </h3>
                <div className={`grid ${isMobile ? "grid-cols-3 gap-2" : "grid-cols-6 gap-3"}`}>
                  {weatherData.forecast.map((day, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center rounded-[1.25rem] ${isMobile ? "bg-muted/30 p-2.5" : "p-4 hover:bg-muted/30 transition-colors"}`}
                    >
                      <span className="font-black text-foreground text-[12px]">{day.day}</span>
                      <span className="text-[10px] text-muted-foreground mb-2">{day.date}</span>
                      <WeatherIcon icon={day.icon} size="sm" />
                      <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                        <span className="font-black text-foreground">{day.high}°</span>
                        <span className="text-muted-foreground">{day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {!isMobile && <Footer />}
    </div>
  );
}