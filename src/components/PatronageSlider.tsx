import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router";
import { getArticleHref } from "@/lib/articleRouting";

export default function PatronageSlider() {
  const patronages = useQuery(api.articles.getPatronages, { limit: 5 });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!patronages || patronages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % patronages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [patronages]);

  if (patronages === undefined) {
    return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  }

  if (patronages.length === 0) {
    return null;
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % patronages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + patronages.length) % patronages.length);

  return (
    <div className="relative mt-4 pt-12 lg:pt-14">
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
        <Star className="w-3 h-3 fill-current" />
        Patronat Redakcji
      </div>
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-1 shadow-lg relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none rounded-2xl"></div>
        
        <div className="bg-card rounded-xl overflow-hidden relative h-[320px]">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Link to={getArticleHref(patronages[currentIndex] as any)} className="block w-full h-full group">
              {patronages[currentIndex].imageUrl ? (
                <img 
                  src={patronages[currentIndex].imageUrl} 
                  alt={patronages[currentIndex].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Star className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h4 className="font-black text-lg leading-tight mb-2 line-clamp-3 group-hover:text-amber-400 transition-colors">
                  {patronages[currentIndex].title}
                </h4>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {patronages.length > 1 && (
          <div className="absolute top-3 right-3 z-20 flex gap-1">
            <button 
              onClick={prevSlide}
              className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-amber-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-amber-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {patronages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
            {patronages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-amber-500' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}