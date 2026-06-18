import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FolderKanban, ImagePlus, LayoutTemplate, LineChart, MessageSquare, Settings, Target, Users } from "lucide-react";

type AdminAdsTab =
  | "dashboard"
  | "instrukcje"
  | "kampanie"
  | "reklamy"
  | "miejsca"
  | "partnerzy"
  | "logotypy"
  | "statystyki"
  | "rezerwacje"
  | "zapytania"
  | "cennik"
  | "biblioteka"
  | "ustawienia";

const SECTION_GUIDE: {
  tab: Exclude<AdminAdsTab, "instrukcje">;
  title: string;
  description: string;
  icon: typeof FolderKanban;
}[] = [
  { tab: "dashboard", title: "Dashboard", description: "Szybki podgląd kampanii, kliknięć, wyświetleń i ogólnej kondycji monetyzacji.", icon: Target },
  { tab: "kampanie", title: "Kampanie", description: "Tutaj tworzysz okres emisji, budżet, limity i status całej akcji reklamowej.", icon: FolderKanban },
  { tab: "reklamy", title: "Reklamy / Kreacje", description: "Materiały reklamowe przypisane do kampanii: grafiki, linki, treść i aktywność emisji.", icon: ImagePlus },
  { tab: "miejsca", title: "Miejsca reklamowe", description: "Definicje slotów w portalu: typ, rozmiar, lokalizacja i liczba reklam w rotacji.", icon: LayoutTemplate },
  { tab: "partnerzy", title: "Partnerzy", description: "Baza reklamodawców, sponsorów i partnerów wraz z danymi kontaktowymi.", icon: Users },
  { tab: "logotypy", title: "Logotypy partnerów", description: "Sekcja do utrzymania ekspozycji partnerów w formie logo na stronie.", icon: ImagePlus },
  { tab: "statystyki", title: "Statystyki", description: "Wyniki emisji, trendy CTR i weryfikacja skuteczności poszczególnych działań.", icon: LineChart },
  { tab: "rezerwacje", title: "Rezerwacje", description: "Planowanie zajętości miejsc reklamowych i kontrola dostępności terminów.", icon: BookOpen },
  { tab: "zapytania", title: "Zapytania", description: "Leadbox dla zapytań od potencjalnych klientów i partnerów.", icon: MessageSquare },
  { tab: "cennik", title: "Cennik", description: "Oferta handlowa dla zespołu sprzedaży i punkt odniesienia do wycen.", icon: Target },
  { tab: "biblioteka", title: "Biblioteka grafik", description: "Repozytorium assetów reklamowych do ponownego wykorzystania.", icon: ImagePlus },
  { tab: "ustawienia", title: "Ustawienia", description: "Parametry ogólne modułu reklamy i konfiguracja działania.", icon: Settings },
];

export function InstructionsTab({ onSelectTab }: { onSelectTab: (tab: AdminAdsTab) => void }) {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase">
              Instrukcje dla admina
            </Badge>
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary shadow-none">
              Pełny przewodnik modułu reklamy
            </Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Jak działa /panel/reklama</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6">
              Moduł reklamy jest zbudowany warstwowo: najpierw definiujesz partnera i kampanię, potem kreacje,
              następnie miejsca emisji, a na końcu monitorujesz wynik oraz obsługujesz rezerwacje i zapytania.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Krok 1</p>
            <p className="mt-2 text-sm font-semibold">Dodaj partnera i kampanię</p>
            <p className="mt-1 text-sm text-muted-foreground">Partner to reklamodawca, kampania określa czas, budżet i cele emisji.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Krok 2</p>
            <p className="mt-2 text-sm font-semibold">Podepnij kreacje do miejsc</p>
            <p className="mt-1 text-sm text-muted-foreground">Kreacja to pojedynczy materiał reklamowy, a miejsce reklamowe określa gdzie może się wyświetlać.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Krok 3</p>
            <p className="mt-2 text-sm font-semibold">Kontroluj wynik i obsługę sprzedaży</p>
            <p className="mt-1 text-sm text-muted-foreground">Statystyki, rezerwacje, cennik i zapytania zamykają operacyjnie cały obieg reklamy.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {SECTION_GUIDE.map((section) => (
          <Card key={section.tab} className="border-border/70 shadow-none">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold">{section.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-auto w-full justify-center sm:w-auto" onClick={() => onSelectTab(section.tab)}>
                Otwórz sekcję
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
