import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileText, Image as ImageIcon, Calendar, Users, TrendingUp, MessageSquare, Heart, Zap, Megaphone, Database, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const articles = useQuery(api.articles.getAll);
  const stories = useQuery(api.stories.getAll);
  const events = useQuery(api.events.getAll);
  const comments = useQuery(api.comments.getAll);
  const obituaries = useQuery(api.obituaries.getAdminObituaries);
  const seedMaster = useMutation(api.seedMaster.seedMasterAll);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedMaster({});
      setSeedDone(true);
      toast.success("Dane testowe zostały załadowane! Odśwież stronę kategorii.");
    } catch (e: any) {
      toast.error("Błąd podczas ładowania danych: " + (e?.message || "Nieznany błąd"));
    } finally {
      setSeeding(false);
    }
  };

  const stats = [
    { label: "Artykuły", value: articles?.length || 0, icon: FileText, color: "bg-blue-500", link: "/panel/artykuly" },
    { label: "Relacje", value: stories?.length || 0, icon: ImageIcon, color: "bg-pink-500", link: "/panel/stories" },
    { label: "Wydarzenia", value: events?.length || 0, icon: Calendar, color: "bg-orange-500", link: "/panel/wydarzenia" },
    { label: "Komentarze", value: comments?.length || 0, icon: MessageSquare, color: "bg-green-500", link: "/panel/komentarze" },
    { label: "Nekrologi", value: obituaries?.length || 0, icon: Heart, color: "bg-rose-500", link: "/panel/nekrologi" },
  ];

  const quickLinks = [
    { label: "Aktualizacje", icon: Zap, color: "text-yellow-600 bg-yellow-50 border-yellow-200", link: "/panel/aktualizacje" },
    { label: "Użytkownicy", icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-200", link: "/panel/uzytkownicy" },
    { label: "Reklama", icon: Megaphone, color: "text-purple-600 bg-purple-50 border-purple-200", link: "/panel/reklama" },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Pulpit</h1>
        <p className="text-slate-500 mt-1">Witaj w panelu zarządzania portalem Love Bydgoszcz.</p>
      </div>

      {/* Seed panel */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Database className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-blue-900 text-sm">Dane demonstracyjne</p>
          <p className="text-xs text-blue-700 mt-0.5">Załaduj artykuły, polityków, drużyny sportowe, inwestycje i wyniki meczów do kategorii Sport, Polityka i Inwestycje.</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding || seedDone}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all"
        >
          {seeding ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Ładowanie...</>
          ) : seedDone ? (
            <><CheckCircle className="w-4 h-4" /> Załadowano!</>
          ) : (
            <><Database className="w-4 h-4" /> Załaduj dane demo</>
          )}
        </button>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-6">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.link} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col gap-3 group">
            <div className={`w-10 h-10 rounded-xl ${stat.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-8">
        {quickLinks.map((ql, i) => (
          <Link key={i} to={ql.link} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm hover:-translate-y-0.5 ${ql.color}`}>
            <ql.icon className="w-4 h-4" />
            {ql.label}
          </Link>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Ostatnie artykuły
            </h2>
            <Link to="/panel/artykuly" className="text-sm font-semibold text-primary hover:underline">Zobacz wszystkie</Link>
          </div>
          <div className="space-y-4">
            {!articles ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
              </div>
            ) : articles.slice(0, 5).map(article => (
              <div key={article._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 group">
                <div>
                  <p className="font-semibold text-sm line-clamp-1 text-slate-900 group-hover:text-primary transition-colors">{article.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
                <Link to="/panel/artykuly" className="text-xs font-bold text-slate-400 hover:text-primary bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">Edytuj</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Najnowsze komentarze
            </h2>
            <Link to="/panel/komentarze" className="text-sm font-semibold text-primary hover:underline">Zarządzaj</Link>
          </div>
          <div className="space-y-4">
            {!comments ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
              </div>
            ) : comments.slice(0, 5).map(comment => (
              <div key={comment._id} className="flex flex-col p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm text-slate-900">{comment.authorName}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (!comment.status || comment.status === 'approved') ? 'bg-green-100 text-green-700' :
                    comment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {(!comment.status || comment.status === 'approved') ? 'Zatwierdzony' : comment.status === 'rejected' ? 'Odrzucony' : 'Oczekujący'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}