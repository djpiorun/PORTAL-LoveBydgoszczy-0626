import { useEffect, useMemo, useState } from "react";
import { fetchArticles, type Article } from "@/lib/articles-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  LayoutPanelLeft,
  Newspaper,
  RotateCcw,
  Send,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

type AssistantMode = "news" | "sponsored" | "press_release" | "quiz" | "updates";
type AssistantTone = "portalowy" | "formalny" | "lekki" | "sprzedazowy";

type DraftForm = {
  mode: AssistantMode;
  tone: AssistantTone;
  topic: string;
  rawNotes: string;
  keyFacts: string;
  quote: string;
  partnerName: string;
  cta: string;
  selectedArticleId: string;
  includeSeo: boolean;
};

type DraftResult = {
  title: string;
  lead: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  update: string;
  social: string;
};

const MODE_OPTIONS: Array<{
  id: AssistantMode;
  label: string;
  description: string;
  icon: typeof Newspaper;
  accent: string;
}> = [
  { id: "news", label: "Wiadomosc", description: "Klasyczny draft portalu", icon: Newspaper, accent: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "sponsored", label: "Sponsorowany", description: "Material partnerski z CTA", icon: Sparkles, accent: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "press_release", label: "Komunikat", description: "Styl komunikatu prasowego", icon: Send, accent: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "quiz", label: "Quiz", description: "Wstep i oprawa quizowa", icon: Wand2, accent: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  { id: "updates", label: "Aktualizacja", description: "Krotka forma pod feed", icon: Zap, accent: "bg-amber-50 text-amber-700 border-amber-200" },
];

const TONE_OPTIONS: Array<{ id: AssistantTone; label: string }> = [
  { id: "portalowy", label: "Portalowy" },
  { id: "formalny", label: "Formalny" },
  { id: "lekki", label: "Lekki" },
  { id: "sprzedazowy", label: "Sprzedazowy" },
];

const DEFAULT_FORM: DraftForm = {
  mode: "news",
  tone: "portalowy",
  topic: "",
  rawNotes: "",
  keyFacts: "",
  quote: "",
  partnerName: "",
  cta: "",
  selectedArticleId: "",
  includeSeo: true,
};

const SAMPLE_PRESETS: Record<AssistantMode, Partial<DraftForm>> = {
  news: {
    topic: "Miasto uruchamia nowy punkt konsultacyjny dla mieszkancow",
    rawNotes: "Uruchomienie punktu w centrum miasta.\nObsluga od poniedzialku do piatku.\nMieszkancy moga zalatwic sprawy urzedowe i konsultacyjne w jednym miejscu.",
    keyFacts: "- punkt startuje od przyszlego tygodnia\n- lokalizacja: centrum miasta\n- obsluga od 8:00 do 16:00\n- uproszczenie kontaktu z mieszkancami",
  },
  sponsored: {
    topic: "Nowa inwestycja mieszkaniowa otwiera pokazowe apartamenty",
    rawNotes: "Partner zaprasza na dni otwarte.\nNa miejscu beda doradcy i prezentacja standardu wykonania.\nOferta promocyjna dla pierwszych klientow.",
    keyFacts: "- dni otwarte w weekend\n- pokazowe mieszkania do obejrzenia\n- doradcy finansowi na miejscu\n- promocja dla pierwszych rezerwacji",
    partnerName: "Partner materialu",
    cta: "Sprawdz szczegoly oferty i umow spotkanie.",
  },
  press_release: {
    topic: "Instytucja publikuje harmonogram wydarzen na najblizszy miesiac",
    rawNotes: "Program obejmuje wydarzenia edukacyjne i kulturalne.\nOrganizator podkresla bezplatny charakter czesci spotkan.\nZapisy ruszaja online.",
    keyFacts: "- program na caly miesiac\n- wydarzenia edukacyjne i kulturalne\n- czesc spotkan bezplatna\n- rejestracja przez formularz online",
  },
  quiz: {
    topic: "Bydgoszcz w 10 pytaniach",
    rawNotes: "Lekki material lifestyle.\nQuiz ma byc szybki, miejski i przyjazny.\nDobrze, by pasowal do sociali i rolek.",
    keyFacts: "- miejski klimat\n- lekki ton\n- szybki format\n- zachęta do dzielenia sie wynikiem",
  },
  updates: {
    topic: "Trwa utrudnienie w ruchu przy glownej arterii miasta",
    rawNotes: "Zwężenie jednego pasa.\nSluzby pracuja na miejscu.\nKierowcy proszeni o omijanie odcinka.",
    keyFacts: "- utrudnienie drogowe\n- sluzby na miejscu\n- mozliwe opoznienia\n- zalecany objazd",
  },
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => cleanText(line.replace(/^[-*]\s*/, "")))
    .filter(Boolean);
}

function trimTo(text: string, limit: number) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}...`;
}

function firstLine(value: string, fallback: string) {
  return splitLines(value)[0] || fallback;
}

function sentence(value: string, fallback: string) {
  const prepared = cleanText(value || fallback);
  if (!prepared) return fallback;
  return /[.!?]$/.test(prepared) ? prepared : `${prepared}.`;
}

function buildTitle(form: DraftForm, contextTitle?: string) {
  const topic = cleanText(form.topic) || firstLine(form.rawNotes, "") || contextTitle || "Nowy material";

  if (form.mode === "updates") return trimTo(topic, 70);
  if (form.mode === "quiz") return trimTo(`${topic}: sprawdz, co wiesz`, 75);
  if (form.mode === "sponsored") return trimTo(`${topic} - co warto wiedziec`, 80);
  if (form.mode === "press_release") return trimTo(`${topic} - komunikat`, 78);

  return trimTo(topic, 80);
}

function buildLead(form: DraftForm, contextTitle?: string) {
  const facts = splitLines(form.keyFacts);
  const topic = cleanText(form.topic) || contextTitle || "Material";
  const firstFact = facts[0] || firstLine(form.rawNotes, "Zebrane informacje stanowia punkt wyjscia do dalszego opracowania.");

  if (form.mode === "quiz") {
    return sentence(`Lekki material redakcyjny o temacie "${topic}", przygotowany tak, aby czytelnik mogl szybko wejsc w quiz i sprawdzic swoja wiedze`, "");
  }

  if (form.mode === "sponsored") {
    const partner = cleanText(form.partnerName) || "partner materialu";
    return sentence(`${topic}. Material przygotowany we wspolpracy z ${partner}; w leadzie akcentujemy korzysc dla odbiorcy oraz najwazniejszy konkret: ${firstFact}`, "");
  }

  if (form.mode === "press_release") {
    return sentence(`${topic}. Komunikat porzadkujacy najwazniejsze informacje i fakty: ${firstFact}`, "");
  }

  if (form.mode === "updates") {
    return sentence(`${topic}. Najwazniejsza aktualizacja w jednym, szybkim akapicie: ${firstFact}`, "");
  }

  return sentence(`${topic}. Najwazniejszy punkt materialu: ${firstFact}`, "");
}

function buildBody(form: DraftForm, title: string, lead: string, contextTitle?: string) {
  const facts = splitLines(form.keyFacts);
  const notes = splitLines(form.rawNotes);
  const quote = cleanText(form.quote);
  const partner = cleanText(form.partnerName);
  const cta = cleanText(form.cta);
  const intro = lead;
  const topic = cleanText(form.topic) || contextTitle || title;

  const paragraphs: string[] = [];
  paragraphs.push(intro);

  if (form.mode === "quiz") {
    paragraphs.push(sentence(`Ten quiz zostal osadzony w lekkim, lifestylowym kontekscie i ma szybko wprowadzic czytelnika w temat: ${topic}`, ""));
    if (facts.length > 0) {
      paragraphs.push(`W materiale warto zaakcentowac:\n- ${facts.slice(0, 4).join("\n- ")}`);
    }
    paragraphs.push(sentence("Na koniec zapros czytelnika do rozwiazania quizu i sprawdzenia wyniku bez zbednego formalizmu", ""));
    return paragraphs.join("\n\n");
  }

  if (form.mode === "updates") {
    const updateFacts = facts.length > 0 ? facts : notes.slice(0, 3);
    if (updateFacts.length > 0) {
      paragraphs.push(`Najwazniejsze punkty:\n- ${updateFacts.slice(0, 4).join("\n- ")}`);
    }
    if (quote) {
      paragraphs.push(`Cytat / wypowiedz:\n"${quote}"`);
    }
    return paragraphs.join("\n\n");
  }

  if (facts.length > 0) {
    paragraphs.push(sentence(`W pierwszej czesci tekstu rozwin wartosc informacyjna materialu, opierajac sie na konkretach: ${facts.slice(0, 2).join(", ")}`, ""));
  }

  if (notes.length > 0) {
    paragraphs.push(sentence(`W dalszej czesci uporzadkuj material w bardziej redakcyjna narracje, korzystajac z notatek: ${notes.slice(0, 3).join(", ")}`, ""));
  }

  if (quote) {
    paragraphs.push(`Proponowany cytat do osadzenia w tresci:\n"${quote}"`);
  }

  if (form.mode === "sponsored") {
    paragraphs.push(sentence(`Wydziel sekcje pokazujaca korzysci dla odbiorcy i naturalnie zaznacz wspolprace z ${partner || "partnerem materialu"}`, ""));
    if (cta) {
      paragraphs.push(`CTA partnera:\n${cta}`);
    }
  }

  if (form.mode === "press_release") {
    paragraphs.push(sentence("Zachowaj ton informacyjny, bez publicystycznych dopowiedzen i bez nadmiernego ozdabiania", ""));
  }

  if (contextTitle) {
    paragraphs.push(sentence(`Jesli material ma nawiazywac do istniejacego tekstu "${contextTitle}", zachowaj spojna linie redakcyjna i podobny poziom formalnosci`, ""));
  }

  return paragraphs.join("\n\n");
}

function buildUpdate(title: string, lead: string) {
  return trimTo(`${title}. ${lead}`, 220);
}

function buildSocial(title: string, lead: string) {
  return trimTo(`${title}\n\n${lead}\n\nCzytaj wiecej na Love Bydgoszcz.`, 260);
}

function extractFactsFromNotes(rawNotes: string) {
  const notes = splitLines(rawNotes);
  return notes.slice(0, 4).map((line) => `- ${line}`).join("\n");
}

function generateDraft(form: DraftForm, contextTitle?: string): DraftResult {
  const title = buildTitle(form, contextTitle);
  const lead = buildLead(form, contextTitle);
  const body = buildBody(form, title, lead, contextTitle);
  const seoTitle = trimTo(title, 60);
  const seoDescription = trimTo(lead, 155);
  const update = buildUpdate(title, lead);
  const social = buildSocial(title, lead);

  return {
    title,
    lead,
    body,
    seoTitle: form.includeSeo ? seoTitle : "",
    seoDescription: form.includeSeo ? seoDescription : "",
    update,
    social,
  };
}

function OutputCard({
  title,
  value,
  copied,
  onCopy,
  minHeight = "min-h-[120px]",
}: {
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  minHeight?: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
        <Button variant="outline" size="sm" onClick={onCopy} className="rounded-xl">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Skopiowano" : "Kopiuj"}
        </Button>
      </div>
      <div className={`rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap ${minHeight}`}>
        {value || "Brak danych. Uzupelnij formularz i wygeneruj draft."}
      </div>
    </div>
  );
}

export default function AdminChat() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setArticlesLoading(true);
    fetchArticles({ limit: 20 })
      .then((data) => {
        if (!isMounted) return;
        setRecentArticles(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setRecentArticles([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setArticlesLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [form, setForm] = useState<DraftForm>(DEFAULT_FORM);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedArticle = useMemo(
    () => recentArticles.find((article) => article.id === form.selectedArticleId),
    [recentArticles, form.selectedArticleId],
  );

  const activeMode = MODE_OPTIONS.find((mode) => mode.id === form.mode) || MODE_OPTIONS[0];
  const hasInput = Boolean(cleanText(form.topic) || cleanText(form.rawNotes) || cleanText(form.keyFacts));
  const result = useMemo(
    () => (hasInput ? generateDraft(form, selectedArticle?.title) : null),
    [form, hasInput, selectedArticle?.title],
  );

  function updateForm<K extends keyof DraftForm>(key: K, value: DraftForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleApplySample() {
    setForm((prev) => ({
      ...prev,
      ...SAMPLE_PRESETS[prev.mode],
    }));
  }

  function handleReset() {
    setForm((prev) => ({
      ...DEFAULT_FORM,
      mode: prev.mode,
      tone: prev.tone,
      selectedArticleId: prev.selectedArticleId,
    }));
  }

  function handleExtractFacts() {
    if (!form.rawNotes.trim()) return;
    updateForm("keyFacts", extractFactsFromNotes(form.rawNotes));
  }

  async function handleCopy(field: keyof DraftResult) {
    if (!result?.[field]) return;
    await navigator.clipboard.writeText(result[field]);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1400);
  }

  async function handleCopyPackage() {
    if (!result) return;
    const payload = [
      `TYTUL:\n${result.title}`,
      `LEAD:\n${result.lead}`,
      result.seoTitle ? `SEO TITLE:\n${result.seoTitle}` : "",
      result.seoDescription ? `SEO DESCRIPTION:\n${result.seoDescription}` : "",
      `DRAFT TRESCI:\n${result.body}`,
      `AKTUALIZACJA:\n${result.update}`,
      `SOCIAL:\n${result.social}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    await navigator.clipboard.writeText(payload);
    setCopiedField("package");
    window.setTimeout(() => setCopiedField((current) => (current === "package" ? null : current)), 1400);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_45%,#f8fafc_100%)] p-4 md:p-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#ecfeff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.1fr)_380px]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-sky-700">
                <Bot className="h-3.5 w-3.5" />
                Asystent Redakcyjny
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Lokalny generator draftow bez API
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[15px]">
                Wklejasz material, wybierasz typ tresci i dostajesz gotowy szkic: tytul, lead, draft artykulu, SEO oraz krotka aktualizacje.
                Wszystko dziala lokalnie, bez Codex / ChatGPT i bez kluczy API.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {MODE_OPTIONS.map((mode) => {
                  const Icon = mode.icon;
                  const active = form.mode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateForm("mode", mode.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${active ? mode.accent : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-black">{mode.label}</span>
                      </div>
                      <p className="mt-1 text-xs opacity-80">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-white p-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Praca na zywo</p>
                <p className="mt-1 text-lg font-black text-slate-950">{hasInput ? "Preview aktualizuje sie automatycznie" : "Wklej material, aby ruszyc"}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Bez klikania generatora. Edytujesz wejscie, a pakiet po prawej odswieza sie na biezaco.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Kontekst tekstu</p>
                <select
                  value={form.selectedArticleId}
                  onChange={(e) => updateForm("selectedArticleId", e.target.value)}
                  disabled={articlesLoading}
                  className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
                >
                  <option value="">Bez nawiazania do istniejacego artykulu</option>
                  {recentArticles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {selectedArticle
                    ? `Generator uwzgledni kontekst tekstu: ${selectedArticle.title}`
                    : "Mozesz oprzec draft na istniejacym materiale albo wygenerowac go od zera."}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Ton i akcje</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => updateForm("tone", tone.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                        form.tone === tone.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleApplySample} className="rounded-xl">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Wstaw sample
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset} className="rounded-xl">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Wyczysc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <LayoutPanelLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Wejscie</p>
                <h2 className="text-xl font-black text-slate-950">Material zrodlowy</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Temat</label>
                <Input value={form.topic} onChange={(e) => updateForm("topic", e.target.value)} placeholder="Np. Nowe centrum kultury otwiera sale wystawowa" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Wklejony material / notatki</label>
                <Textarea
                  value={form.rawNotes}
                  onChange={(e) => updateForm("rawNotes", e.target.value)}
                  placeholder="Wklej surowy tekst, mail, notatki po rozmowie albo szkic od partnera."
                  className="min-h-[180px] resize-none"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Najwazniejsze fakty</label>
                  <button
                    type="button"
                    onClick={handleExtractFacts}
                    className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700 transition-colors hover:text-sky-900"
                  >
                    Uzupelnij z notatek
                  </button>
                </div>
                <Textarea
                  value={form.keyFacts}
                  onChange={(e) => updateForm("keyFacts", e.target.value)}
                  placeholder={"Kazdy fakt w nowej linii\n- kto\n- co\n- gdzie\n- kiedy\n- dlaczego to wazne"}
                  className="min-h-[140px] resize-none"
                />
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Opcjonalne dodatki</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Cytat, partner, CTA i SEO</p>
                  </div>
                  {showAdvanced ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>

                {showAdvanced && (
                  <div className="grid gap-4 border-t border-slate-200 px-4 py-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Cytat / wypowiedz</label>
                      <Textarea
                        value={form.quote}
                        onChange={(e) => updateForm("quote", e.target.value)}
                        placeholder="Opcjonalnie: cytat do osadzenia w tresci."
                        className="min-h-[90px] resize-none bg-white"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Partner / Sponsor</label>
                        <Input value={form.partnerName} onChange={(e) => updateForm("partnerName", e.target.value)} placeholder="Np. Partner materialu" className="bg-white" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">CTA</label>
                        <Input value={form.cta} onChange={(e) => updateForm("cta", e.target.value)} placeholder="Np. Sprawdz oferte partnera" className="bg-white" />
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.includeSeo}
                        onChange={(e) => updateForm("includeSeo", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Generuj rowniez SEO title i SEO description
                    </label>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="rounded-[32px] border border-slate-200 bg-white/92 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-white">
                  <FileText className="h-3.5 w-3.5" />
                  Wyjscie
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-950">Pakiet gotowy do wklejenia</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                  Skopiuj osobno tytul, lead, tresc, SEO albo krotka aktualizacje. Ekran zostal uproszczony pod szybkie klejenie materialu do edytora, bez zbednego przeklikiwania.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Tryb</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{activeMode.label}</p>
                </div>
                <Button onClick={handleCopyPackage} disabled={!result} className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                  {copiedField === "package" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copiedField === "package" ? "Skopiowano calosc" : "Kopiuj caly pakiet"}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <OutputCard title="Tytul" value={result?.title || ""} copied={copiedField === "title"} onCopy={() => handleCopy("title")} />
              <OutputCard title="Lead" value={result?.lead || ""} copied={copiedField === "lead"} onCopy={() => handleCopy("lead")} />
              <OutputCard title="SEO Title" value={result?.seoTitle || ""} copied={copiedField === "seoTitle"} onCopy={() => handleCopy("seoTitle")} minHeight="min-h-[96px]" />
              <OutputCard title="SEO Description" value={result?.seoDescription || ""} copied={copiedField === "seoDescription"} onCopy={() => handleCopy("seoDescription")} minHeight="min-h-[96px]" />
              <div className="xl:col-span-2">
                <OutputCard title="Draft tresci" value={result?.body || ""} copied={copiedField === "body"} onCopy={() => handleCopy("body")} minHeight="min-h-[280px]" />
              </div>
              <OutputCard title="Krotka aktualizacja" value={result?.update || ""} copied={copiedField === "update"} onCopy={() => handleCopy("update")} />
              <OutputCard title="Post social / teaser" value={result?.social || ""} copied={copiedField === "social"} onCopy={() => handleCopy("social")} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
