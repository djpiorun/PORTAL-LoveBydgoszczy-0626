import {
  Newspaper, AlignJustify, Maximize2, Columns, BookMarked, Minus, PanelTop,
  AlignVerticalJustifyStart, LayoutGrid, Layers, Monitor, Smartphone, PanelLeft, PanelRight,
  Star, ImageIcon,
} from "lucide-react";
import { ADMIN_CATEGORY_DEFINITIONS } from "@/lib/adminCategories";

export const CATEGORIES = ADMIN_CATEGORY_DEFINITIONS.map((category) => ({
  value: category.value,
  label: category.label,
  color:
    category.value === "sport" ? "bg-blue-600" :
    category.value === "polityka" ? "bg-slate-700" :
    category.value === "inwestycje" ? "bg-amber-600" :
    category.value === "nasze_dzialania" ? "bg-pink-600" :
    category.value === "miasto" ? "bg-blue-500" :
    category.value === "rozrywka" ? "bg-purple-500" :
    category.value === "kultura" ? "bg-amber-500" :
    category.value === "biznes" ? "bg-emerald-500" :
    category.value === "gastronomia" ? "bg-orange-500" :
    category.value === "bydgoszczanie" ? "bg-rose-500" :
    "bg-teal-500",
}));

export const LAYOUTS = [
  { value: "standard", label: "Standardowy", icon: AlignJustify, desc: "Klasyczny układ z treścią i bocznym paskiem", preview: "bg-white border-2" },
  { value: "wide", label: "Szeroki", icon: Maximize2, desc: "Szeroka treść, mniejszy sidebar", preview: "bg-white border-2" },
  { value: "fullwidth", label: "Pełna szerokość", icon: Columns, desc: "Treść na całą szerokość strony", preview: "bg-white border-2" },
  { value: "magazine", label: "Magazynowy", icon: BookMarked, desc: "Układ inspirowany magazynami", preview: "bg-white border-2" },
  { value: "minimal", label: "Minimalny", icon: Minus, desc: "Czysty, minimalistyczny wygląd", preview: "bg-white border-2" },
  { value: "hero", label: "Hero", icon: PanelTop, desc: "Duże zdjęcie na górze, pełna szerokość", preview: "bg-white border-2" },
];

export const GRAPHICS_LAYOUTS = [
  { value: "default", label: "Grafika domyślna", icon: AlignVerticalJustifyStart, desc: "Obecny, standardowy układ zdjęcia nad treścią" },
  { value: "top_full", label: "Pełna szerokość", icon: Maximize2, desc: "Szeroka grafika otwierająca artykuł" },
  { value: "square_top", label: "Kwadratowa na górze", icon: LayoutGrid, desc: "Kwadratowe zdjęcie nad tytułem lub leadem" },
  { value: "rectangle_top", label: "Prostokątna na górze", icon: AlignVerticalJustifyStart, desc: "Pozioma grafika nad treścią" },
  { value: "portrait_top", label: "Pionowa na górze", icon: Smartphone, desc: "Pionowe zdjęcie jako mocny wizual otwarcia" },
  { value: "left", label: "Zdjęcie po lewej", icon: PanelLeft, desc: "Zdjęcie obok treści po lewej stronie" },
  { value: "right", label: "Zdjęcie po prawej", icon: PanelRight, desc: "Zdjęcie obok treści po prawej stronie" },
  { value: "split", label: "Split 50/50", icon: Columns, desc: "Tytuł i zdjęcie dzielą nagłówek po połowie" },
  { value: "background", label: "Tło", icon: Layers, desc: "Zdjęcie jako tło nagłówka" },
  { value: "background_blur", label: "Tło z blur", icon: Layers, desc: "Zdjęcie w tle z rozmyciem i warstwą tekstu" },
  { value: "card_floating", label: "Karta pływająca", icon: ImageIcon, desc: "Zdjęcie w wyróżnionej karcie nad artykułem" },
  { value: "cinema", label: "Panorama", icon: Monitor, desc: "Bardzo szeroki kadr w stylu hero" },
  { value: "gallery_cover", label: "Okładka galerii", icon: ImageIcon, desc: "Duża grafika z miejscem na serię zdjęć" },
  { value: "none", label: "Bez zdjęcia", icon: ImageIcon, desc: "Artykuł bez zdjęcia głównego" },
];

export const CATEGORY_LAYOUTS = [
  { value: "default", label: "Domyślny", icon: LayoutGrid, desc: "Standardowy układ kategorii" },
  { value: "highlight", label: "Wyróżnienie", icon: Star, desc: "Kolorowe tło kategorii" },
  { value: "minimal", label: "Minimalistyczny", icon: AlignJustify, desc: "Wąski, skupiony układ" },
  { value: "magazine", label: "Magazyn", icon: BookMarked, desc: "Układ magazynowy z bocznym paskiem" },
  { value: "grid", label: "Siatka", icon: Columns, desc: "Artykuły w siatce 3 kolumny" },
  { value: "list", label: "Lista", icon: AlignJustify, desc: "Artykuły w liście pionowej" },
  { value: "featured", label: "Wyróżniony", icon: Star, desc: "Jeden duży artykuł + lista" },
];
