import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { useEffect, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";
import "./types/global.d.ts";

import Landing from "./pages/Landing.tsx";
import AuthPage from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import EventPage from "./pages/EventPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import AuthorPage from "./pages/AuthorPage.tsx";
import DynamicRoute from "./pages/DynamicRoute.tsx";
import ReelsPage from "./pages/ReelsPage.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminArticles from "./pages/admin/AdminArticles.tsx";
import AdminStories from "./pages/admin/AdminStories.tsx";
import AdminReels from "./pages/admin/AdminReels.tsx";
import AdminEvents from "./pages/admin/AdminEvents.tsx";
import AdminComments from "./pages/admin/AdminComments.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminAds from "./pages/admin/AdminAds.tsx";
import AdminObituaries from "./pages/admin/AdminObituaries.tsx";
import AdminChat from "./pages/admin/AdminChat.tsx";
import AdminMedia from "./pages/admin/AdminMedia.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import WeatherPage from "./pages/WeatherPage";
import TimetablePage from "./pages/TimetablePage";
import RoutePage from "./pages/RoutePage";
import StopPage from "./pages/StopPage";
import ObituariesPage from "./pages/ObituariesPage.tsx";
import ObituaryPage from "./pages/ObituaryPage.tsx";
import AuthorsListPage from "./pages/AuthorsListPage.tsx";
import UpdatesPage from "./pages/UpdatesPage.tsx";
import AdminUpdates from "./pages/admin/AdminUpdates.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SportPage from "./pages/SportPage.tsx";
import PoliticsPage from "./pages/PoliticsPage.tsx";
import InvestmentsPage from "./pages/InvestmentsPage.tsx";
import OurActionsPage from "./pages/OurActionsPage.tsx";
import PoliticiansDatabase from "./pages/PoliticiansDatabase.tsx";
import PoliticianProfilePage from "./pages/PoliticianProfilePage.tsx";
import SportTeamProfilePage from "./pages/SportTeamProfilePage.tsx";
import InvestmentProfilePage from "./pages/InvestmentProfilePage.tsx";
import InvestmentsTracking from "./pages/InvestmentsTracking.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import AdminMenu from "./pages/admin/AdminMenu.tsx";
import AdminPages from "./pages/admin/AdminPages.tsx";
import StaticPage from "./pages/StaticPage.tsx";
import MobileBottomNav from "./components/MobileBottomNav.tsx";
import MobileGlobalTopBar from "./components/mobile/MobileGlobalTopBar.tsx";

function RedirectToSlug() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview");
  if (!slug) return <Navigate to="/" replace />;
  // Preserve ?preview=admin for draft preview
  const target = preview ? `/${slug}?preview=${preview}` : `/${slug}`;
  return <Navigate to={target} replace />;
}

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

function ConditionalVlyToolbar() {
  const location = useLocation();

  if (location.pathname.startsWith("/panel")) {
    return null;
  }

  return <VlyToolbar />;
}

function ThemeColorSync() {
  const location = useLocation();
  useEffect(() => {
    const update = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const color = isDark ? "#282838" : "#fafafa";
      let meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = color;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [location.pathname]);
  return null;
}

function MobileViewportPadding() {
  const location = useLocation();

  useEffect(() => {
    const shouldPad =
      !location.pathname.startsWith("/panel") &&
      !location.pathname.startsWith("/auth") &&
      !location.pathname.startsWith("/logowanie");

    document.body.classList.toggle("mobile-app-shell", shouldPad);

    return () => {
      document.body.classList.remove("mobile-app-shell");
    };
  }, [location.pathname]);

  return null;
}

const SITE_DOMAIN = "https://lovebydgoszcz.pl";

// Public pages where copy attribution should be active
function isPublicPage(pathname: string): boolean {
  const adminPaths = ["/panel", "/auth", "/logowanie"];
  return !adminPaths.some((p) => pathname.startsWith(p));
}

function CopyAttribution() {
  const location = useLocation();

  useEffect(() => {
    if (!isPublicPage(location.pathname)) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const selectedText = selection.toString().trim();
      if (selectedText.length < 20) return; // Only for meaningful selections

      // Build canonical URL using the production domain
      const canonicalUrl = `${SITE_DOMAIN}${location.pathname}${location.search}`;
      const attribution = `\n\nCzytaj więcej na Love Bydgoszcz: ${canonicalUrl}`;
      const fullText = selectedText + attribution;

      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", fullText);
        e.clipboardData.setData(
          "text/html",
          `${selectedText}<br><br>Czytaj więcej na Love Bydgoszcz: <a href="${canonicalUrl}">${canonicalUrl}</a>`
        );
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, [location.pathname, location.search]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/wydarzenie/:id" element={<EventPage />} />
          <Route path="/szukaj" element={<SearchPage />} />
          <Route path="/rolka" element={<ReelsPage />} />
          <Route path="/rolka/:category" element={<ReelsPage />} />
          <Route path="/pogoda" element={<WeatherPage />} />
          <Route path="/rozklad" element={<TimetablePage />} />
          <Route path="/rozklad-jazdy" element={<TimetablePage />} />
          <Route path="/rozklad-jazdy/linia/:routeId" element={<RoutePage />} />
          <Route path="/rozklad-jazdy/przystanek/:stopId" element={<StopPage />} />
          <Route path="/nekrolog" element={<ObituariesPage />} />
          <Route path="/nekrolog/:slug" element={<ObituaryPage />} />
          <Route path="/autor" element={<AuthorsListPage />} />
          <Route path="/autor/:name" element={<AuthorPage />} />
          <Route path="/aktualizacje" element={<UpdatesPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/sport" element={<SportPage />} />
          <Route path="/polityka" element={<PoliticsPage />} />
          <Route path="/polityka/politycy" element={<PoliticiansDatabase />} />
          <Route path="/polityka/polityk/:slug" element={<PoliticianProfilePage />} />
          <Route path="/inwestycje" element={<InvestmentsPage />} />
          <Route path="/inwestycje/tracking" element={<InvestmentsTracking />} />
          <Route path="/inwestycje/:slug" element={<InvestmentProfilePage />} />
          <Route path="/sport/druzyna/:slug" element={<SportTeamProfilePage />} />
          <Route path="/nasze-dzialania" element={<OurActionsPage />} />
          <Route path="/nasze_dzialania" element={<OurActionsPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/strona/:slug" element={<RedirectToSlug />} />
          <Route path="/:slug" element={<DynamicRoute />} />
          <Route path="/panel" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="artykuly" element={<AdminArticles />} />
            <Route path="stories" element={<AdminStories />} />
            <Route path="rolki" element={<AdminReels />} />
            <Route path="wydarzenia" element={<AdminEvents />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="komentarze" element={<AdminComments />} />
            <Route path="uzytkownicy" element={<AdminUsers />} />
            <Route path="reklama" element={<AdminAds />} />
            <Route path="nekrologi" element={<AdminObituaries />} />
            <Route path="aktualizacje" element={<AdminUpdates />} />
            <Route path="kategorie" element={<AdminCategories />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="strony" element={<AdminPages />} />
            <Route path="ustawienia" element={<AdminSettings />} />
          </Route>
          <Route path="/logowanie" element={<AuthPage redirectAfterAuth="/panel" />} />
          <Route path="/auth" element={<AuthPage redirectAfterAuth="/panel" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(
  <>
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <ConditionalVlyToolbar />
          <RouteSyncer />
          <MobileViewportPadding />
          <ThemeColorSync />
          <CopyAttribution />
          <Suspense fallback={<RouteLoading />}>
            <AnimatedRoutes />
          </Suspense>
          <MobileGlobalTopBar />
          <MobileBottomNav />
        </BrowserRouter>
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </>,
);