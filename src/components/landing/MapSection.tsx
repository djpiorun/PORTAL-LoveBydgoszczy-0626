import { motion } from "framer-motion";
import { Map as MapIcon, CloudSun } from "lucide-react";

export default function MapSection() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <CloudSun className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black">Mapa Pogodowa</h2>
            <p className="text-xs text-muted-foreground">Sprawdź aktualne warunki atmosferyczne w Bydgoszczy</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full h-[450px] rounded-2xl overflow-hidden border border-border shadow-xl relative"
        >
          <iframe
            src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=10&overlay=wind&product=ecmwf&level=surface&lat=53.123&lon=18.008"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border text-xs font-semibold flex items-center gap-2">
              <CloudSun className="w-3.5 h-3.5 text-primary" />
              Interaktywna mapa pogodowa
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
