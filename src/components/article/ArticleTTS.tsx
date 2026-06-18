import { useEffect, useMemo, useRef, useState } from "react";
import { AudioLines, Pause, Play, Square, Volume2, Headphones, User, X } from "lucide-react";

function stripHtml(html?: string) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function buildInterviewText(article: any) {
  const blocks = Array.isArray(article?.interview?.blocks) ? article.interview.blocks : [];
  return blocks
    .map((block: any) => {
      const speaker = block?.speakerName || block?.speaker || "";
      const question = stripHtml(block?.question);
      const answer = stripHtml(block?.answer);
      return [speaker && `Prowadzący lub gość: ${speaker}.`, question, answer].filter(Boolean).join(" ");
    })
    .filter(Boolean)
    .join("\n\n");
}

function buildArticleSpeechText(article: any) {
  const bydgoszczanie = article?.bydgoszczanie ?? {};
  const parts = [
    article?.title,
    article?.lead,
    stripHtml(bydgoszczanie?.aboutHero),
    stripHtml(article?.content),
    stripHtml(bydgoszczanie?.storyDescription),
    buildInterviewText(article),
  ];

  return parts
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoChunks(text: string, size = 1100) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > size) {
      if (current) chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

// Voice presets with different characteristics
type VoicePreset = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  pitch: number;
  rate: number;
  preferredVoice?: string;
};

const voicePresets: VoicePreset[] = [
  {
    id: "natural",
    name: "Naturalny HD",
    emoji: "🎙️",
    description: "Najbardziej naturalne brzmienie",
    pitch: 1.0,
    rate: 0.98,
    preferredVoice: "Google",
  },
  {
    id: "professional",
    name: "Profesjonalny",
    emoji: "💼",
    description: "Spokojny, rzeczowy ton newsowy",
    pitch: 0.98,
    rate: 0.92,
    preferredVoice: "Zofia",
  },
  {
    id: "energetic",
    name: "Energiczny",
    emoji: "⚡",
    description: "Żywy, dynamiczny głos",
    pitch: 1.08,
    rate: 1.05,
  },
  {
    id: "calm",
    name: "Spokojny",
    emoji: "🧘",
    description: "Relaksujący, łagodny głos",
    pitch: 0.95,
    rate: 0.88,
  },
  {
    id: "deep",
    name: "Głęboki",
    emoji: "🎭",
    description: "Niski, męski głos",
    pitch: 0.88,
    rate: 0.93,
  },
  {
    id: "clear",
    name: "Wyraźny",
    emoji: "💎",
    description: "Czysta dykcja, idealna artykulacja",
    pitch: 1.02,
    rate: 0.90,
  },
];

export default function ArticleTTS({ article }: { article: any }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("natural");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState("Lektor PL gotowy");
  const [rate, setRate] = useState(0.98);
  const [customPitch, setCustomPitch] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const queueRef = useRef<string[]>([]);
  const currentVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const speechText = useMemo(() => buildArticleSpeechText(article), [article]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      setStatus("Twoja przeglądarka nie obsługuje TTS");
      return;
    }

    setIsSupported(true);
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const available = synth.getVoices();
      setVoices(available);

      // Priorytetyzuj najlepsze polskie głosy
      const polishVoices = available.filter((v) => v.lang?.toLowerCase().startsWith("pl"));

      const preferred =
        // Najpierw szukaj Google Neural/HD
        polishVoices.find((v) => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("pl-pl")) ||
        polishVoices.find((v) => v.name.toLowerCase().includes("wavenet")) ||
        polishVoices.find((v) => v.name.toLowerCase().includes("neural")) ||
        // Potem Microsoft Neural
        polishVoices.find((v) => v.name.includes("Microsoft") && v.name.toLowerCase().includes("online")) ||
        polishVoices.find((v) => v.name.includes("Microsoft") && v.name.includes("Zofia")) ||
        // Potem Google ogólny
        polishVoices.find((v) => v.name.includes("Google")) ||
        // Potem Microsoft ogólny
        polishVoices.find((v) => v.name.includes("Microsoft")) ||
        // Jakikolwiek polski
        polishVoices[0] ||
        // Fallback na pierwszy dostępny
        available[0];

      if (preferred) {
        currentVoiceRef.current = preferred;
        setSelectedVoice(preferred.name);
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.cancel();
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const voice = voices.find((item) => item.name === selectedVoice);
    if (voice) currentVoiceRef.current = voice;
  }, [selectedVoice, voices]);

  // Handle preset change
  const handlePresetChange = (presetId: string) => {
    const preset = voicePresets.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setCustomPitch(preset.pitch);
    setRate(preset.rate);

    // Optionally switch to preferred voice if available
    if (preset.preferredVoice) {
      const preferredVoice = voices.find((v) =>
        v.name.includes(preset.preferredVoice!) && v.lang?.toLowerCase().startsWith("pl")
      );
      if (preferredVoice) {
        setSelectedVoice(preferredVoice.name);
      }
    }
  };

  const stop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    setIsPlaying(false);
    setIsPaused(false);
    setStatus("Odsłuch zatrzymany");
  };

  const speakQueue = (chunks: string[]) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (chunks.length === 0) {
      setIsPlaying(false);
      setIsPaused(false);
      setStatus("Odsłuch zakończony");
      return;
    }

    const synth = window.speechSynthesis;
    const [current, ...rest] = chunks;
    queueRef.current = rest;

    const utterance = new SpeechSynthesisUtterance(current);
    utterance.lang = currentVoiceRef.current?.lang || "pl-PL";
    utterance.voice = currentVoiceRef.current || null;
    utterance.rate = rate;
    utterance.pitch = customPitch;

    utterance.onend = () => {
      if (queueRef.current.length > 0) {
        speakQueue(queueRef.current);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setStatus("Odsłuch zakończony");
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setStatus("Nie udało się odtworzyć lektora");
    };

    synth.speak(utterance);
  };

  const start = () => {
    if (!speechText) {
      setStatus("Brak treści do odczytania");
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const chunks = splitIntoChunks(speechText);
    setIsPlaying(true);
    setIsPaused(false);
    setStatus("Czytam artykuł");
    speakQueue(chunks);
  };

  const togglePause = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (!isPlaying) {
      start();
      return;
    }
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setStatus("Wznowiono odsłuch");
    } else {
      synth.pause();
      setIsPaused(true);
      setStatus("Odsłuch wstrzymany");
    }
  };

  if (!isSupported) return null;

  // Filtruj tylko polskie głosy i posortuj: najwyższa jakość najpierw
  const polishVoices = voices
    .filter((v) => v.lang?.toLowerCase().startsWith("pl"))
    .sort((a, b) => {
      // Priorytet: Neural/HD/Premium > Google > Microsoft > reszta
      const getQualityScore = (voice: SpeechSynthesisVoice) => {
        const name = voice.name.toLowerCase();
        if (name.includes("neural") || name.includes("premium") || name.includes("hd")) return 10;
        if (name.includes("google") && name.includes("pl-pl")) return 8;
        if (name.includes("google")) return 7;
        if (name.includes("microsoft") && name.includes("online")) return 6;
        if (name.includes("microsoft")) return 5;
        if (name.includes("wavenet") || name.includes("studio")) return 9;
        return 3;
      };
      return getQualityScore(b) - getQualityScore(a);
    });

  const hasPolishVoice = polishVoices.length > 0;

  // Sprawdź czy są dostępne wysokiej jakości głosy
  const hasHighQualityVoice = polishVoices.some((v) => {
    const name = v.name.toLowerCase();
    return name.includes("neural") ||
           name.includes("premium") ||
           name.includes("hd") ||
           name.includes("wavenet") ||
           name.includes("online") ||
           (name.includes("google") && name.includes("pl-pl"));
  });

  // Funkcja do ekstrakcji imienia lektora z oznaczeniem jakości
  const getVoiceLabel = (voice: SpeechSynthesisVoice) => {
    const name = voice.name;
    const nameLower = name.toLowerCase();

    // Oznaczenie jakości
    const isHighQuality = nameLower.includes("neural") ||
                          nameLower.includes("premium") ||
                          nameLower.includes("hd") ||
                          nameLower.includes("wavenet") ||
                          nameLower.includes("studio");

    const qualityBadge = isHighQuality ? " ⭐" : "";
    const onlineBadge = nameLower.includes("online") ? " 🌐" : "";

    // Google voices - najwyższa jakość
    if (name.includes("Google")) {
      if (nameLower.includes("pl-pl") || nameLower.includes("wavenet") || nameLower.includes("neural")) {
        return "🎙️ Zofia (Google Premium)" + qualityBadge;
      }
      return "🎙️ Google Naturalny" + qualityBadge;
    }

    // Microsoft voices - dobre głosy neural
    if (name.includes("Microsoft")) {
      if (name.includes("Zofia")) {
        return "👩 Zofia (Microsoft Neural)" + qualityBadge + onlineBadge;
      }
      if (name.includes("Paulina")) {
        return "✨ Paulina (Microsoft)" + qualityBadge + onlineBadge;
      }
      if (name.includes("Marek")) {
        return "👨 Marek (Microsoft)" + qualityBadge + onlineBadge;
      }
      if (nameLower.includes("adam")) {
        return "🗣️ Adam (Microsoft)" + qualityBadge + onlineBadge;
      }
    }

    // Generic Polish voices
    if (nameLower.includes("paulina")) {
      return "✨ Paulina" + qualityBadge;
    }
    if (nameLower.includes("zofia")) {
      return "👩 Zofia" + qualityBadge;
    }
    if (nameLower.includes("marek")) {
      return "👨 Marek" + qualityBadge;
    }
    if (nameLower.includes("jacek")) {
      return "🗣️ Jacek" + qualityBadge;
    }
    if (nameLower.includes("jan")) {
      return "👨 Jan" + qualityBadge;
    }
    if (nameLower.includes("ewa")) {
      return "👩 Ewa" + qualityBadge;
    }
    if (nameLower.includes("maja")) {
      return "👩 Maja" + qualityBadge;
    }

    // Gender-based fallback
    if (nameLower.includes("female") || nameLower.includes("kobieta")) {
      return "👩 Damski głos" + qualityBadge;
    }
    if (nameLower.includes("male") || nameLower.includes("męski")) {
      return "👨 Męski głos" + qualityBadge;
    }

    // Default - clean up the name
    const cleanName = name.replace(/\(.*?\)/g, "").replace(/Microsoft|Google|Online|Natural/gi, "").trim();
    return "🔊 " + cleanName + qualityBadge;
  };

  // Compact button mode (not expanded)
  if (!expanded && !isPlaying) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="group/tts inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 transition-colors group-hover/tts:bg-primary/25">
          <Headphones className="h-4 w-4" />
          <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-primary-foreground">
            PL
          </div>
        </div>
        <span>Posłuchaj artykułu</span>
      </button>
    );
  }

  return (
    <div className="group relative mb-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 shadow-sm transition-all duration-300 hover:border-primary/30">
      <div className="relative px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Headphones className="h-5 w-5 text-primary" />
              <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                PL
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Posłuchaj artykułu</p>
              <p className="text-xs text-muted-foreground truncate">{status}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isPlaying ? (
              <button
                type="button"
                onClick={start}
                disabled={!speechText}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                Odtwórz
              </button>
            ) : (
              <>
                <button type="button" onClick={togglePause} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/5">
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  {isPaused ? "Wznów" : "Pauza"}
                </button>
                <button type="button" onClick={stop} className="inline-flex items-center justify-center rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Square className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`inline-flex items-center justify-center rounded-full border p-2 transition-colors ${showSettings ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <AudioLines className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { stop(); setExpanded(false); }}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-5 space-y-5 border-t-2 border-primary/20 pt-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Voice Character Presets */}
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <AudioLines className="h-4 w-4 text-primary" />
                </div>
                Charakter głosu
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {voicePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetChange(preset.id)}
                    className={`group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                      selectedPreset === preset.id
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background/50 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                    title={preset.description}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{preset.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold transition-colors ${
                          selectedPreset === preset.id ? "text-primary" : "text-foreground"
                        }`}>
                          {preset.name}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                    {selectedPreset === preset.id && (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {hasPolishVoice && polishVoices.length > 0 && (
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  Wybierz lektora
                </label>
                <div className="relative">
                  <select
                    value={selectedVoice}
                    onChange={(event) => setSelectedVoice(event.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-primary/20 bg-background/80 pl-4 pr-10 py-3 text-sm font-medium text-foreground shadow-sm outline-none backdrop-blur-sm transition-all duration-200 hover:border-primary/40 focus:border-primary focus:bg-background focus:shadow-md focus:ring-2 focus:ring-primary/20 sm:w-[280px]"
                  >
                    {polishVoices.length > 0 ? (
                      polishVoices.map((voice) => (
                        <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                          {getVoiceLabel(voice)}
                        </option>
                      ))
                    ) : (
                      <option value="">🔊 Domyślny głos</option>
                    )}
                  </select>
                  <Volume2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                </div>
              </div>
            )}

            <div className="space-y-3.5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-semibold text-foreground">
                  ⚡ Szybkość
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-44">
                    <input
                      type="range"
                      min="0.7"
                      max="1.8"
                      step="0.05"
                      value={rate}
                      onChange={(event) => setRate(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary transition-all duration-200 hover:accent-primary/80"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((rate - 0.7) / (1.8 - 0.7)) * 100}%, hsl(var(--muted)) ${((rate - 0.7) / (1.8 - 0.7)) * 100}%, hsl(var(--muted)) 100%)`
                      }}
                    />
                  </div>
                  <span className="flex min-w-[58px] items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 px-3 py-2 text-sm font-bold tabular-nums text-foreground shadow-sm backdrop-blur-sm">
                    {rate.toFixed(2)}×
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-semibold text-foreground">
                  🎵 Wysokość tonu
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-44">
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={customPitch}
                      onChange={(event) => setCustomPitch(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary transition-all duration-200 hover:accent-primary/80"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((customPitch - 0.8) / (1.3 - 0.8)) * 100}%, hsl(var(--muted)) ${((customPitch - 0.8) / (1.3 - 0.8)) * 100}%, hsl(var(--muted)) 100%)`
                      }}
                    />
                  </div>
                  <span className="flex min-w-[58px] items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 px-3 py-2 text-sm font-bold tabular-nums text-foreground shadow-sm backdrop-blur-sm">
                    {customPitch.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Volume2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Lokalny lektor AI</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Działa w przeglądarce • Zero kosztów API • Bez limitów • Prywatność gwarantowana
                  </p>
                </div>
              </div>

              {!hasHighQualityVoice && hasPolishVoice && (
                <div className="flex items-start gap-3 rounded-xl border-2 border-amber-500/20 bg-amber-500/5 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <span className="text-base">💡</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Chcesz lepszą jakość głosu?</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Windows:</strong> Ustawienia → Czas i język → Mowa → Dodaj głosy → Zainstaluj "Polski (Zofia)" lub "Polski (Marek)"
                      <br />
                      <strong>Chrome:</strong> Użyj przeglądarki Chrome - ma najlepsze wbudowane głosy Google
                      <br />
                      <strong>Edge:</strong> Ma dostęp do neural voices Microsoft (najlepsza jakość)
                    </p>
                  </div>
                </div>
              )}

              {hasHighQualityVoice && (
                <div className="flex items-start gap-3 rounded-xl border-2 border-green-500/20 bg-green-500/5 p-3 shadow-sm backdrop-blur-sm">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-green-500/20">
                    <span className="text-sm">✅</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Wykryto głosy wysokiej jakości (⭐) - najlepsza dostępna jakość audio!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
