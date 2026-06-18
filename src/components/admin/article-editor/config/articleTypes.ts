import {
  FileText, Mic, BarChart2, Newspaper, Lightbulb, DollarSign,
  Settings, Tag, BookOpen, Star, Palette, Layout,
  Send, Users, BookMarked, CheckCircle, Clock, Archive,
} from "lucide-react";

export const ARTICLE_TYPES = [
  { value: "news", label: "Wiadomość", icon: Newspaper },
  { value: "interview", label: "Wywiad", icon: Mic },
  { value: "analysis", label: "Analiza", icon: BarChart2 },
  { value: "report", label: "Reportaż", icon: FileText },
  { value: "opinion", label: "Opinia", icon: Lightbulb },
  { value: "dialog", label: "Dialog", icon: Users },
  { value: "quiz", label: "Quiz", icon: BookMarked },
  { value: "press_release", label: "Komunikat", icon: Send },
  { value: "sponsored", label: "Sponsorowany", icon: DollarSign },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Szkic", icon: FileText, color: "text-gray-500" },
  { value: "published", label: "Opublikowany", icon: CheckCircle, color: "text-green-600" },
  { value: "scheduled", label: "Zaplanowany", icon: Clock, color: "text-blue-600" },
  { value: "archived", label: "Zarchiwizowany", icon: Archive, color: "text-orange-500" },
];

export const RIGHT_TABS = [
  { id: "basic", label: "Podstawowe", icon: Settings },
  { id: "labels", label: "Etykiety", icon: Tag },
];

export const BOTTOM_TABS = [
  { id: "settings", label: "Ustawienia", icon: Settings, description: "Główne centrum ustawień artykułu" },
  { id: "appearance", label: "Wygląd", icon: Palette, description: "Wygląd artykułu i stopki autora" },
  { id: "layout", label: "Układ", icon: Layout, description: "Kompozycja artykułu, grafiki i elementów" },
  { id: "sources", label: "Źródła", icon: BookOpen, description: "Źródła główne, dodatkowe i bibliografia" },
  { id: "additional", label: "Dodatkowe", icon: Star, description: "Dodatki i moduły rozwijające artykuł" },
];
