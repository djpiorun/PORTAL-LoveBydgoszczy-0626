import { Outlet, Link, useLocation, Navigate } from "react-router";
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Calendar, Settings, 
  Users, MessageSquare, LogOut, Menu, X, Megaphone, Zap, Bot,
  ChevronLeft, ChevronRight, Newspaper, Heart, FolderOpen, Tag, Navigation, BookOpen, Film
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface NavGroup {
  label: string;
  items: { path: string; icon: React.ElementType; label: string; exact?: boolean }[];
}

export default function AdminLayout() {
  const location = useLocation();
  const { user: currentUser, isAuthenticated, isLoading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const navGroups: NavGroup[] = [
    {
      label: "Główne",
      items: [
        { path: "/panel", icon: LayoutDashboard, label: "Pulpit", exact: true },
      ]
    },
    {
      label: "Treści",
      items: [
        { path: "/panel/artykuly", icon: FileText, label: "Artykuły" },
        { path: "/panel/strony", icon: BookOpen, label: "Strony" },
        { path: "/panel/aktualizacje", icon: Zap, label: "Aktualizacje" },
        { path: "/panel/stories", icon: ImageIcon, label: "Relacje" },
        { path: "/panel/rolki", icon: Film, label: "Rolki" },
        { path: "/panel/wydarzenia", icon: Calendar, label: "Wydarzenia" },
        { path: "/panel/media", icon: FolderOpen, label: "Biblioteka mediów" },
        { path: "/panel/nekrologi", icon: Heart, label: "Nekrologi" },
        { path: "/panel/kategorie", icon: Tag, label: "Kategorie" },
      ]
    },
    {
      label: "Społeczność",
      items: [
        { path: "/panel/komentarze", icon: MessageSquare, label: "Komentarze" },
        { path: "/panel/uzytkownicy", icon: Users, label: "Użytkownicy" },
      ]
    },
    {
      label: "Monetyzacja",
      items: [
        { path: "/panel/reklama", icon: Megaphone, label: "Reklama" },
      ]
    },
    {
      label: "System",
      items: [
        { path: "/panel/menu", icon: Navigation, label: "Menu" },
        { path: "/panel/chat", icon: Bot, label: "Chat" },
        { path: "/panel/ustawienia", icon: Settings, label: "Ustawienia" },
      ]
    }
  ];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!currentUser) {
    if (isAuthenticated) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    }
    return <Navigate to={`/logowanie?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (currentUser.role !== "admin" && currentUser.role !== "member") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 mb-3">Brak dostępu</p>
          <h1 className="text-2xl font-black text-slate-900 mb-3">To konto nie ma uprawnień do panelu</h1>
          <p className="text-sm text-slate-600 mb-6">
            Zalogowano poprawnie, ale konto ma rolę `{currentUser.role ?? "user"}`. Przydziel rolę `admin` albo `member` w panelu użytkowników lub przez bootstrap pierwszego administratora.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
              Wróć na stronę główną
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Wyloguj i zmień konto
            </button>
          </div>
        </div>
      </div>
    );
  }

  const authedUser = currentUser;

  const sidebarWidth = isCollapsed ? "w-16" : "w-60";
  const mainMargin = isCollapsed ? "lg:ml-16" : "lg:ml-60";

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-3 left-3 z-[60] p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarWidth} bg-slate-900 text-slate-300 flex flex-col fixed h-full z-50 transition-all duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Header */}
        <div className={`flex items-center border-b border-slate-800 mt-10 lg:mt-0 ${isCollapsed ? "justify-center p-3" : "justify-between px-4 py-3"}`}>
          {!isCollapsed && (
            <Link to="/" className="text-white font-black text-base tracking-tight flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">LB</span>
              </div>
              <span className="truncate">Panel Admina</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/" className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">LB</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title={isCollapsed ? "Rozwiń panel" : "Zwiń panel"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Admin profile */}
        {!isCollapsed ? (
          <div className="px-3 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              {authedUser.image ? (
                <img src={authedUser.image} alt={authedUser.name || "Admin"} className="w-8 h-8 rounded-full object-cover border-2 border-slate-700 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-slate-700 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                  {(authedUser.name || authedUser.email || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{authedUser.name || "Administrator"}</p>
                <p className="text-slate-400 text-[10px] truncate">{authedUser.email || ""}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2 border-b border-slate-800">
            {authedUser.image ? (
              <img src={authedUser.image} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-slate-700" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-slate-700 flex items-center justify-center text-primary font-bold text-xs">
                {(authedUser.name || authedUser.email || "A").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2.5 mb-1">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path, item.exact);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${isCollapsed ? "justify-center" : ""} ${
                        active 
                          ? "bg-primary text-white font-semibold shadow-md shadow-primary/20" 
                          : "hover:bg-slate-800 hover:text-white text-slate-400"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                      {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`p-2 border-t border-slate-800 space-y-0.5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          <Link
            to="/"
            title={isCollapsed ? "Wróć do portalu" : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400 ${isCollapsed ? "justify-center w-full" : ""}`}
          >
            <Newspaper className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Wróć do portalu</span>}
          </Link>
          <button
            onClick={handleSignOut}
            title={isCollapsed ? "Wyloguj się" : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-900/40 hover:text-red-400 transition-colors text-slate-500 ${isCollapsed ? "justify-center w-full" : "w-full text-left"}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Wyloguj się</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${mainMargin} w-full bg-slate-50/50 transition-all duration-300 h-screen overflow-y-auto flex flex-col`}>
        <div className="mt-14 lg:mt-0 flex-1 flex flex-col p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
