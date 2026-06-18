import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HardHat, Search, TrendingUp, Clock, CheckCircle2, Pause, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InvestmentsTracking() {
  const investments = useQuery(api.investments.list, {});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvestments = investments?.filter(investment => {
    const matchesSearch = !searchTerm ||
      investment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || investment.projectStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "planowana":
        return {
          icon: Clock,
          label: "Planowana",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "w_trakcie":
        return {
          icon: TrendingUp,
          label: "W trakcie",
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/30",
        };
      case "zakonczona":
        return {
          icon: CheckCircle2,
          label: "Zakończona",
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30",
        };
      case "wstrzymana":
        return {
          icon: Pause,
          label: "Wstrzymana",
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/30",
        };
      default:
        return {
          icon: HardHat,
          label: status,
          color: "text-muted-foreground",
          bg: "bg-muted",
        };
    }
  };

  const stats = {
    total: investments?.length || 0,
    planowana: investments?.filter(i => i.projectStatus === "planowana").length || 0,
    w_trakcie: investments?.filter(i => i.projectStatus === "w_trakcie").length || 0,
    zakonczona: investments?.filter(i => i.projectStatus === "zakonczona").length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-16 dark:from-amber-950/20 dark:via-slate-900 dark:to-yellow-950/20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 dark:bg-amber-900/30">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Śledzenie Inwestycji
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-black text-foreground md:text-5xl">
              Wszystkie Inwestycje Miejskie
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Kompleksowy tracking projektów budowlanych w Bydgoszczy
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/50 bg-card p-4 text-center dark:border-border/30">
              <p className="text-2xl font-black text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Wszystkie</p>
            </div>
            <div className="rounded-2xl border border-amber-200/50 bg-amber-50 p-4 text-center dark:border-amber-900/30 dark:bg-amber-950/20">
              <p className="text-2xl font-black text-amber-900 dark:text-amber-300">{stats.w_trakcie}</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">W trakcie</p>
            </div>
            <div className="rounded-2xl border border-blue-200/50 bg-blue-50 p-4 text-center dark:border-blue-900/30 dark:bg-blue-950/20">
              <p className="text-2xl font-black text-blue-900 dark:text-blue-300">{stats.planowana}</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Planowane</p>
            </div>
            <div className="rounded-2xl border border-green-200/50 bg-green-50 p-4 text-center dark:border-green-900/30 dark:bg-green-950/20">
              <p className="text-2xl font-black text-green-900 dark:text-green-300">{stats.zakonczona}</p>
              <p className="text-sm text-green-700 dark:text-green-400">Zakończone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="border-b border-border bg-card/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj inwestycji..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Wszystkie
              </Button>
              <Button
                variant={statusFilter === "planowana" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("planowana")}
              >
                Planowane
              </Button>
              <Button
                variant={statusFilter === "w_trakcie" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("w_trakcie")}
              >
                W trakcie
              </Button>
              <Button
                variant={statusFilter === "zakonczona" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("zakonczona")}
              >
                Zakończone
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!filteredInvestments ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="py-20 text-center">
            <HardHat className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-bold text-foreground">Brak wyników</h3>
            <p className="text-muted-foreground">
              Nie znaleziono inwestycji spełniających kryteria wyszukiwania.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvestments.map((investment, index) => {
              const statusConfig = getStatusConfig(investment.projectStatus);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={investment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group overflow-hidden rounded-3xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md dark:border-border/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-start gap-3">
                        <div className={`mt-1 rounded-full p-2 ${statusConfig.bg}`}>
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground">
                            {investment.projectName}
                          </h3>
                          {investment.location && (
                            <p className="text-sm text-muted-foreground">{investment.location}</p>
                          )}
                        </div>
                      </div>

                      {investment.description && (
                        <p className="mb-3 text-sm text-foreground/80">{investment.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {investment.startDate && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Start: {new Date(investment.startDate).toLocaleDateString("pl-PL")}</span>
                          </div>
                        )}
                        {investment.budget && (
                          <div className="rounded-full bg-muted px-3 py-1 font-semibold">
                            {investment.budget}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Progress */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={`rounded-full px-4 py-2 text-sm font-black ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </div>
                      {investment.progressPercent !== undefined && (
                        <div className="w-32">
                          <div className="mb-1 text-right text-xs font-bold text-muted-foreground">
                            {investment.progressPercent}%
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-600 transition-all"
                              style={{ width: `${investment.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
