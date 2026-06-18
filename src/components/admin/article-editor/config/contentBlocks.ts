import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  MessageSquareQuote,
  Minus,
  Image,
  Images,
  Video,
  AudioLines,
  Share2,
  MapPinned,
  Info,
  AlertTriangle,
  BookmarkPlus,
  BadgeCheck,
  HelpCircle,
  Scale,
  Clock3,
  Library,
  BookOpen,
  MousePointerClick,
  Newspaper,
  Radio,
  Trophy,
  BarChart3,
  CalendarRange,
  UserRound,
  MapPin,
  Users,
  Vote,
  Handshake,
  MailPlus,
  Code2,
} from "lucide-react";

export type ContentBlockGroup =
  | "podstawowe"
  | "media"
  | "redakcyjne"
  | "portalowe"
  | "seo";

export type ContentBlock = {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  group: ContentBlockGroup;
  color?: string;
  keywords?: string[];
};

export const CONTENT_BLOCKS: ContentBlock[] = [
  // Podstawowe
  { type: "paragraph", label: "Paragraf", icon: Pilcrow, desc: "Podstawowy akapit treści artykułu", group: "podstawowe", color: "bg-muted", keywords: ["tekst", "akapit", "paragraph"] },
  { type: "heading", label: "Nagłówek", icon: Heading1, desc: "Główny śródtytuł sekcji", group: "podstawowe", color: "bg-muted", keywords: ["h1", "h2", "tytul"] },
  { type: "subheading", label: "Podtytuł", icon: Heading2, desc: "Mniejszy śródtytuł lub rozwinięcie sekcji", group: "podstawowe", color: "bg-muted", keywords: ["h3", "h4", "subtitle"] },
  { type: "lead", label: "Lead / Intro", icon: Heading3, desc: "Wyróżnione otwarcie artykułu", group: "podstawowe", color: "bg-primary/10", keywords: ["intro", "lead", "zajawka"] },
  { type: "list", label: "Lista punktowana", icon: List, desc: "Lista faktów lub punktów", group: "podstawowe", color: "bg-muted", keywords: ["bullet", "lista"] },
  { type: "orderedlist", label: "Lista numerowana", icon: ListOrdered, desc: "Lista kroków lub kolejności", group: "podstawowe", color: "bg-muted", keywords: ["ordered", "numerowana"] },
  { type: "quote", label: "Cytat", icon: Quote, desc: "Klasyczny cytat w tekście", group: "podstawowe", color: "bg-primary/10", keywords: ["blockquote", "cytat"] },
  { type: "pullquote", label: "Pull quote", icon: MessageSquareQuote, desc: "Duży cytat przyciągający uwagę", group: "podstawowe", color: "bg-primary/10", keywords: ["pull", "duzy cytat"] },
  { type: "separator", label: "Separator", icon: Minus, desc: "Podział sekcji artykułu", group: "podstawowe", color: "bg-muted", keywords: ["linia", "divider"] },
  { type: "code", label: "Kod / snippet", icon: Code2, desc: "Blok kodu lub techniczny fragment", group: "podstawowe", color: "bg-muted", keywords: ["kod", "snippet"] },

  // Media
  { type: "image", label: "Obraz", icon: Image, desc: "Zdjęcie z podpisem, autorem i źródłem", group: "media", color: "bg-primary/10", keywords: ["image", "foto", "zdjecie"] },
  { type: "gallery", label: "Galeria", icon: Images, desc: "Galeria zdjęć jako blok pierwszej klasy", group: "media", color: "bg-primary/10", keywords: ["gallery", "slajdy"] },
  { type: "embed_video", label: "Wideo", icon: Video, desc: "Osadzony materiał YouTube lub Vimeo", group: "media", color: "bg-primary/10", keywords: ["youtube", "video", "embed"] },
  { type: "social_embed", label: "Social embed", icon: Share2, desc: "Osadzenie posta z social mediów", group: "media", color: "bg-primary/10", keywords: ["facebook", "instagram", "x", "twitter"] },
  { type: "audio", label: "Audio", icon: AudioLines, desc: "Podcast, nagranie lub player audio", group: "media", color: "bg-primary/10", keywords: ["audio", "podcast"] },
  { type: "map_embed", label: "Mapa", icon: MapPinned, desc: "Osadzona mapa miejsca lub trasy", group: "media", color: "bg-primary/10", keywords: ["mapa", "map", "lokacja"] },

  // Redakcyjne
  { type: "info_box", label: "Info box", icon: Info, desc: "Ramka z kontekstem lub wyjaśnieniem", group: "redakcyjne", color: "bg-primary/10", keywords: ["ramka", "info"] },
  { type: "alert", label: "Alert", icon: AlertTriangle, desc: "Ważna informacja lub ostrzeżenie", group: "redakcyjne", color: "bg-primary/10", keywords: ["wazne", "ostrzezenie"] },
  { type: "key_points", label: "Kluczowe punkty", icon: BookmarkPlus, desc: "Najważniejsze wnioski w skrócie", group: "redakcyjne", color: "bg-primary/10", keywords: ["summary", "skrot"] },
  { type: "expertquote", label: "Cytat eksperta", icon: BadgeCheck, desc: "Wyróżniony komentarz eksperta", group: "redakcyjne", color: "bg-primary/10", keywords: ["ekspert", "comment"] },
  { type: "context_box", label: "Kontekst", icon: Library, desc: "Tło sprawy, historia, wyjaśnienie", group: "redakcyjne", color: "bg-primary/10", keywords: ["tlo", "context"] },
  { type: "fact_check", label: "Fact-check", icon: BadgeCheck, desc: "Weryfikacja faktów i źródeł", group: "redakcyjne", color: "bg-primary/10", keywords: ["fakty", "check"] },
  { type: "faq", label: "FAQ", icon: HelpCircle, desc: "Pytania i odpowiedzi", group: "redakcyjne", color: "bg-primary/10", keywords: ["pytania", "faq"] },
  { type: "pros_cons", label: "Plusy / minusy", icon: Scale, desc: "Porównanie argumentów lub cech", group: "redakcyjne", color: "bg-primary/10", keywords: ["za", "przeciw"] },
  { type: "timeline", label: "Timeline", icon: Clock3, desc: "Chronologia wydarzeń", group: "redakcyjne", color: "bg-primary/10", keywords: ["czas", "os czasu"] },
  { type: "sources_list", label: "Lista źródeł", icon: Library, desc: "Bibliografia i źródła artykułu", group: "redakcyjne", color: "bg-primary/10", keywords: ["zrodla", "bibliografia"] },
  { type: "readmore", label: "Czytaj także", icon: BookOpen, desc: "Powiązany materiał lub link", group: "redakcyjne", color: "bg-primary/10", keywords: ["read more", "powiazane"] },
  { type: "cta", label: "CTA", icon: MousePointerClick, desc: "Wezwanie do działania", group: "redakcyjne", color: "bg-primary/10", keywords: ["button", "akcja"] },

  // Portalowe
  { type: "related_articles", label: "Powiązane artykuły", icon: Newspaper, desc: "Lista materiałów powiązanych", group: "portalowe", color: "bg-primary/10", keywords: ["related", "powiazane"] },
  { type: "live_update", label: "Live update", icon: Radio, desc: "Aktualizacja na żywo w newsroomie", group: "portalowe", color: "bg-primary/10", keywords: ["live", "update"] },
  { type: "result_box", label: "Wynik / rezultat", icon: Trophy, desc: "Blok wyniku, werdyktu lub rezultatu", group: "portalowe", color: "bg-primary/10", keywords: ["wynik", "rezultat"] },
  { type: "stats_grid", label: "Statystyki", icon: BarChart3, desc: "Siatka danych i liczb", group: "portalowe", color: "bg-primary/10", keywords: ["stat", "liczby"] },
  { type: "event_card", label: "Karta wydarzenia", icon: CalendarRange, desc: "Wydarzenie z datą i miejscem", group: "portalowe", color: "bg-primary/10", keywords: ["event", "wydarzenie"] },
  { type: "person_card", label: "Karta osoby", icon: UserRound, desc: "Sylwetka osoby lub bohatera materiału", group: "portalowe", color: "bg-primary/10", keywords: ["osoba", "profil"] },
  { type: "location_card", label: "Karta lokalizacji", icon: MapPin, desc: "Miejsce, adres, kontekst lokalny", group: "portalowe", color: "bg-primary/10", keywords: ["lokalizacja", "miejsce"] },
  { type: "author_box", label: "Box autora", icon: Users, desc: "Podpis i bio autora materiału", group: "portalowe", color: "bg-primary/10", keywords: ["autor", "bio"] },
  { type: "poll", label: "Ankieta", icon: Vote, desc: "Interaktywny blok ankiety", group: "portalowe", color: "bg-primary/10", keywords: ["poll", "glosowanie"] },
  { type: "partner", label: "Partner / sponsor", icon: Handshake, desc: "Blok sponsora lub partnera publikacji", group: "portalowe", color: "bg-primary/10", keywords: ["partner", "sponsor"] },
  { type: "newsletter_signup", label: "Newsletter", icon: MailPlus, desc: "Zapis do newslettera", group: "portalowe", color: "bg-primary/10", keywords: ["newsletter", "mail"] },
];

export const CONTENT_BLOCK_GROUPS: { key: ContentBlockGroup; label: string; color: string }[] = [
  { key: "podstawowe", label: "Podstawowe", color: "text-primary" },
  { key: "media", label: "Media", color: "text-primary" },
  { key: "redakcyjne", label: "Bloki redakcyjne", color: "text-primary" },
  { key: "portalowe", label: "Newsroom / portal", color: "text-primary" },
  { key: "seo", label: "SEO i linkowanie", color: "text-primary" },
];

export const DEFAULT_ARTICLE_ELEMENTS = [
  { id: "image", label: "Hero / zdjęcie główne", icon: "IMG", enabled: true, locked: false },
  { id: "author", label: "Autorzy", icon: "AUT", enabled: true, locked: false },
  { id: "excerpt", label: "Lead / zajawka", icon: "LED", enabled: true, locked: false },
  { id: "content", label: "Treść blokowa", icon: "BLK", enabled: true, locked: true },
  { id: "source", label: "Źródła", icon: "SRC", enabled: true, locked: false },
  { id: "expert_quote", label: "Cytat eksperta", icon: "EXP", enabled: true, locked: false },
  { id: "updates", label: "Live / aktualizacje", icon: "UPD", enabled: true, locked: false },
  { id: "patronage", label: "Patronat", icon: "PAT", enabled: true, locked: false },
  { id: "partner", label: "Partner", icon: "PRT", enabled: true, locked: false },
  { id: "tags", label: "Tagi i metadane", icon: "TAG", enabled: true, locked: false },
  { id: "bibliography", label: "Bibliografia / źródła", icon: "BIB", enabled: true, locked: false },
  { id: "comments", label: "Komentarze", icon: "CMT", enabled: true, locked: false },
];