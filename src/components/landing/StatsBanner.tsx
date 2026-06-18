import { motion } from "framer-motion";
import { Users, Calendar, Sparkles, Clock } from "lucide-react";

export default function StatsBanner() {
  const stats = [
    { icon: Users, value: "120 000+", label: "Czytelników miesięcznie" },
    { icon: Calendar, value: "500+", label: "Wydarzeń każdego miesiąca" },
    { icon: Sparkles, value: "5", label: "Kategorii tematycznych" },
    { icon: Clock, value: "24/7", label: "Aktualizacje na bieżąco" },
  ];

  return (
    <section className="bg-primary py-6 dark:bg-[linear-gradient(120deg,rgba(85,48,16,0.92),rgba(33,22,38,0.92)_42%,rgba(24,43,61,0.9))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-white backdrop-blur-sm dark:border-amber-200/12 dark:bg-black/20"
            >
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-white/70 dark:text-amber-100/75" />
              <p className="text-2xl font-black mb-1">{stat.value}</p>
              <p className="text-xs text-white/70 dark:text-slate-100/70">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
