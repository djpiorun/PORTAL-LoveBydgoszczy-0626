import { Calendar as CalendarIcon, MapPin, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function EventList({ 
  events, 
  filteredEvents, 
  searchQuery, 
  setSearchQuery, 
  onEdit, 
  onDelete 
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil((filteredEvents?.length || 0) / itemsPerPage);
  const paginatedEvents = filteredEvents?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Szukaj wydarzenia..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-semibold">Wydarzenie</th>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Lokalizacja</th>
              <th className="p-4 font-semibold">Kategoria</th>
              <th className="p-4 font-semibold text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {!events ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="p-4"><div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse"></div></td>
                  <td className="p-4"><div className="h-5 bg-slate-100 rounded w-1/2 animate-pulse"></div></td>
                  <td className="p-4"><div className="h-5 bg-slate-100 rounded w-1/2 animate-pulse"></div></td>
                  <td className="p-4"><div className="h-5 bg-slate-100 rounded w-1/3 animate-pulse"></div></td>
                  <td className="p-4"><div className="h-8 bg-slate-100 rounded w-16 ml-auto animate-pulse"></div></td>
                </tr>
              ))
            ) : paginatedEvents?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Brak wydarzeń spełniających kryteria.
                </td>
              </tr>
            ) : (
              paginatedEvents?.map((event: any) => (
                <tr key={event._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{event.title}</p>
                        {event.featured && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Wyróżnione</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(event.startDate).toLocaleDateString()} {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-4 text-sm text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{event.location}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 capitalize">
                      {event.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(event)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edytuj"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(event._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Usuń"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-sm text-slate-500">
            Strona {currentPage} z {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
