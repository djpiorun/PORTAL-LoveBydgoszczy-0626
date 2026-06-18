import { useNavigate } from "react-router";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface RouteCategoryProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  routes: any[];
  hoverBgClass: string;
  hoverTextClass: string;
  hoverBorderClass: string;
}

export default function RouteCategory({
  title,
  subtitle,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  routes,
  hoverBgClass,
  hoverTextClass,
  hoverBorderClass
}: RouteCategoryProps) {
  const navigate = useNavigate();

  if (!routes || routes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
        <div className={`w-10 h-10 sm:w-8 sm:h-8 rounded-xl sm:rounded-lg ${iconBgClass} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-4 sm:h-4 ${iconColorClass}`} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-foreground leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {routes.map((route, i) => (
          <motion.button
            key={route.route_short_name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, delay: i * 0.015 }}
            onClick={() => navigate(`/rozklad-jazdy/linia/${route.route_short_name}`)}
            aria-label={`Linia ${route.route_short_name}`}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-muted border border-border text-foreground font-black text-sm sm:text-base flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 ${hoverBgClass} ${hoverTextClass} ${hoverBorderClass}`}
          >
            {route.route_short_name}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}