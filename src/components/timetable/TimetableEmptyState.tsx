import { Bus } from "lucide-react";

export default function TimetableEmptyState() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Bus className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Brak danych rozkładu jazdy</h2>
      <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-6">
        Baza danych rozkładu jazdy jest obecnie pusta. Dane są aktualizowane automatycznie każdego dnia rano.
      </p>
      <div className="inline-flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm font-medium text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200/50">
        <span>Informacja dla administratora: Uruchom pierwszą synchronizację komendą:</span>
        <code className="bg-amber-100/80 px-2 py-1 rounded-md text-amber-800 font-mono">npx convex run gtfsActions:updateGtfsData</code>
      </div>
    </div>
  );
}
