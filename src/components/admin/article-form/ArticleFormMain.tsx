import { Upload, Trophy, Building2, HardHat, Heart, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// ─── Sport Form Section ───────────────────────────────────────────────────────
function SportFormSection({ formData, setFormData }: any) {
  const sport = formData.sport || {};
  const [showLineup, setShowLineup] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const update = (patch: any) => setFormData({ ...formData, sport: { ...sport, ...patch } });

  return (
    <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-800/40 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">Dane sportowe</h3>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input type="checkbox" checked={!!sport.enabled} onChange={e => update({ enabled: e.target.checked })} className="rounded" />
          Włącz sekcję sportową
        </label>
      </div>

      {sport.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Dyscyplina</label>
              <select value={sport.sportType || "pilka_nozna"} onChange={e => update({ sportType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="pilka_nozna">⚽ Piłka nożna</option>
                <option value="zuzel">🏍️ Żużel</option>
                <option value="siatkowka">🏐 Siatkówka</option>
                <option value="inne">🏆 Inne</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Styl wyświetlania</label>
              <select value={sport.styleVariant || "dynamic"} onChange={e => update({ styleVariant: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="dynamic">Dynamiczny</option>
                <option value="modern">Nowoczesny</option>
                <option value="classic">Klasyczny</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={!!sport.isMatchReport} onChange={e => update({ isMatchReport: e.target.checked })} className="rounded" />
            To jest relacja meczowa
          </label>

          {sport.isMatchReport && (
            <div className="space-y-4 border-t border-blue-200/50 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Liga / Rozgrywki</label>
                  <input type="text" value={sport.league || ""} onChange={e => update({ league: e.target.value })} placeholder="np. Ekstraklasa" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Kolejka / Runda</label>
                  <input type="text" value={sport.round || ""} onChange={e => update({ round: e.target.value })} placeholder="np. 15. kolejka" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Data meczu</label>
                  <input type="datetime-local" value={sport.matchDate || ""} onChange={e => update({ matchDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Miejsce</label>
                  <input type="text" value={sport.matchLocation || ""} onChange={e => update({ matchLocation: e.target.value })} placeholder="np. Stadion Zawisza" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Status meczu</label>
                <select value={sport.matchStatus || "zaplanowany"} onChange={e => update({ matchStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="zaplanowany">Zaplanowany</option>
                  <option value="trwa">Trwa (NA ŻYWO)</option>
                  <option value="zakonczony">Zakończony</option>
                  <option value="odwolany">Odwołany</option>
                </select>
              </div>

              {/* Teams & Score */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold">Gospodarz</label>
                  <input type="text" value={sport.homeTeam?.name || ""} onChange={e => update({ homeTeam: { ...sport.homeTeam, id: "home", name: e.target.value, type: "home" } })} placeholder="Nazwa drużyny" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" value={sport.homeTeam?.shortName || ""} onChange={e => update({ homeTeam: { ...sport.homeTeam, id: "home", shortName: e.target.value, type: "home" } })} placeholder="Skrót (np. ZAW)" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="text-center space-y-2">
                  <label className="block text-xs font-semibold">Wynik</label>
                  <div className="flex items-center gap-1">
                    <input type="text" value={sport.homeScore || ""} onChange={e => update({ homeScore: e.target.value })} placeholder="0" className="w-12 px-2 py-2 rounded-xl border border-border bg-background text-sm text-center font-black outline-none focus:ring-2 focus:ring-primary/20" />
                    <span className="font-black text-muted-foreground">:</span>
                    <input type="text" value={sport.awayScore || ""} onChange={e => update({ awayScore: e.target.value })} placeholder="0" className="w-12 px-2 py-2 rounded-xl border border-border bg-background text-sm text-center font-black outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold">Gość</label>
                  <input type="text" value={sport.awayTeam?.name || ""} onChange={e => update({ awayTeam: { ...sport.awayTeam, id: "away", name: e.target.value, type: "away" } })} placeholder="Nazwa drużyny" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" value={sport.awayTeam?.shortName || ""} onChange={e => update({ awayTeam: { ...sport.awayTeam, id: "away", shortName: e.target.value, type: "away" } })} placeholder="Skrót (np. GKS)" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              {/* Scorers */}
              <div>
                <label className="block text-xs font-semibold mb-1">Strzelcy goli (po przecinku)</label>
                <input type="text" value={(sport.scorers || []).join(", ")} onChange={e => update({ scorers: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} placeholder="np. Kowalski 23', Nowak 67'" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-xs font-semibold mb-1">Najważniejsze momenty (po przecinku)</label>
                <textarea value={(sport.matchHighlights || []).join("\n")} onChange={e => update({ matchHighlights: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) })} placeholder="Każdy moment w nowej linii..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20" />
              </div>

              {/* Collapsible: Match Stats */}
              <button type="button" onClick={() => setShowStats(!showStats)} className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                {showStats ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                Statystyki meczu (opcjonalne)
              </button>
              {showStats && (
                <div className="space-y-2">
                  {(sport.matchStats || []).map((stat: any, i: number) => (
                    <div key={i} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-center">
                      <input type="text" value={stat.homeValue} onChange={e => { const s = [...(sport.matchStats || [])]; s[i] = { ...s[i], homeValue: e.target.value }; update({ matchStats: s }); }} placeholder="Wartość" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                      <input type="text" value={stat.label} onChange={e => { const s = [...(sport.matchStats || [])]; s[i] = { ...s[i], label: e.target.value }; update({ matchStats: s }); }} placeholder="Statystyka" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none text-center" />
                      <input type="text" value={stat.awayValue} onChange={e => { const s = [...(sport.matchStats || [])]; s[i] = { ...s[i], awayValue: e.target.value }; update({ matchStats: s }); }} placeholder="Wartość" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                      <button type="button" onClick={() => { const s = (sport.matchStats || []).filter((_: any, j: number) => j !== i); update({ matchStats: s }); }} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => update({ matchStats: [...(sport.matchStats || []), { label: "", homeValue: "", awayValue: "" }] })} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                    <Plus className="h-3.5 w-3.5" /> Dodaj statystykę
                  </button>
                </div>
              )}

              {/* Collapsible: Lineup */}
              <button type="button" onClick={() => setShowLineup(!showLineup)} className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                {showLineup ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                Składy drużyn (opcjonalne)
              </button>
              {showLineup && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold mb-2">Skład Gospodarzy</p>
                    {(sport.homeLineup || []).map((p: any, i: number) => (
                      <div key={i} className="flex gap-1 mb-1">
                        <input type="text" value={p.number || ""} onChange={e => { const l = [...(sport.homeLineup || [])]; l[i] = { ...l[i], number: e.target.value }; update({ homeLineup: l }); }} placeholder="#" className="w-10 px-2 py-1 rounded-lg border border-border bg-background text-xs outline-none" />
                        <input type="text" value={p.name || ""} onChange={e => { const l = [...(sport.homeLineup || [])]; l[i] = { ...l[i], id: `h${i}`, name: e.target.value }; update({ homeLineup: l }); }} placeholder="Zawodnik" className="flex-1 px-2 py-1 rounded-lg border border-border bg-background text-xs outline-none" />
                        <button type="button" onClick={() => { const l = (sport.homeLineup || []).filter((_: any, j: number) => j !== i); update({ homeLineup: l }); }} className="p-1 rounded-lg bg-red-50 text-red-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => update({ homeLineup: [...(sport.homeLineup || []), { id: `h${Date.now()}`, name: "" }] })} className="text-xs font-bold text-blue-600 flex items-center gap-1"><Plus className="h-3 w-3" /> Dodaj</button>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-2">Skład Gości</p>
                    {(sport.awayLineup || []).map((p: any, i: number) => (
                      <div key={i} className="flex gap-1 mb-1">
                        <input type="text" value={p.number || ""} onChange={e => { const l = [...(sport.awayLineup || [])]; l[i] = { ...l[i], number: e.target.value }; update({ awayLineup: l }); }} placeholder="#" className="w-10 px-2 py-1 rounded-lg border border-border bg-background text-xs outline-none" />
                        <input type="text" value={p.name || ""} onChange={e => { const l = [...(sport.awayLineup || [])]; l[i] = { ...l[i], id: `a${i}`, name: e.target.value }; update({ awayLineup: l }); }} placeholder="Zawodnik" className="flex-1 px-2 py-1 rounded-lg border border-border bg-background text-xs outline-none" />
                        <button type="button" onClick={() => { const l = (sport.awayLineup || []).filter((_: any, j: number) => j !== i); update({ awayLineup: l }); }} className="p-1 rounded-lg bg-red-50 text-red-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => update({ awayLineup: [...(sport.awayLineup || []), { id: `a${Date.now()}`, name: "" }] })} className="text-xs font-bold text-blue-600 flex items-center gap-1"><Plus className="h-3 w-3" /> Dodaj</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Politics Form Section ────────────────────────────────────────────────────
function PoliticsFormSection({ formData, setFormData }: any) {
  const politics = formData.politics || {};
  const [showTimeline, setShowTimeline] = useState(false);

  const update = (patch: any) => setFormData({ ...formData, politics: { ...politics, ...patch } });

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-slate-50/40 dark:bg-slate-900/20 dark:border-slate-700/40 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="h-4 w-4 text-slate-600" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide">Dane polityczne</h3>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
        <input type="checkbox" checked={!!politics.enabled} onChange={e => update({ enabled: e.target.checked })} className="rounded" />
        Włącz sekcję polityczną
      </label>

      {politics.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Temat</label>
              <input type="text" value={politics.topic || ""} onChange={e => update({ topic: e.target.value })} placeholder="np. Budżet miasta 2025" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Styl wyświetlania</label>
              <select value={politics.styleVariant || "editorial"} onChange={e => update({ styleVariant: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="editorial">Editorial</option>
                <option value="news">Newsy</option>
                <option value="analysis">Analiza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Kontekst polityczny</label>
            <textarea value={politics.politicalContext || ""} onChange={e => update({ politicalContext: e.target.value })} placeholder="Krótki kontekst polityczny artykułu..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Powiązane ugrupowania (po przecinku)</label>
            <input type="text" value={(politics.parties || []).join(", ")} onChange={e => update({ parties: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} placeholder="np. Koalicja Obywatelska, PiS" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Powiązane akty prawne</label>
            <input type="text" value={politics.relatedLegislation || ""} onChange={e => update({ relatedLegislation: e.target.value })} placeholder="np. Uchwała nr 123/2025" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          {/* Politicians */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold">Politycy w artykule</label>
              <button type="button" onClick={() => update({ politicians: [...(politics.politicians || []), { id: `p${Date.now()}`, fullName: "" }] })} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-800">
                <Plus className="h-3.5 w-3.5" /> Dodaj polityka
              </button>
            </div>
            {(politics.politicians || []).map((p: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                <input type="text" value={p.fullName || ""} onChange={e => { const arr = [...(politics.politicians || [])]; arr[i] = { ...arr[i], fullName: e.target.value }; update({ politicians: arr }); }} placeholder="Imię i nazwisko" className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="text" value={p.party || ""} onChange={e => { const arr = [...(politics.politicians || [])]; arr[i] = { ...arr[i], party: e.target.value }; update({ politicians: arr }); }} placeholder="Partia" className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                <button type="button" onClick={() => { const arr = (politics.politicians || []).filter((_: any, j: number) => j !== i); update({ politicians: arr }); }} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            {(politics.politicians || []).length > 0 && (
              <div className="mt-1">
                <label className="block text-xs font-semibold mb-1">Główny polityk (ID)</label>
                <select value={politics.mainPoliticianId || ""} onChange={e => update({ mainPoliticianId: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Wybierz głównego polityka</option>
                  {(politics.politicians || []).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Timeline */}
          <button type="button" onClick={() => setShowTimeline(!showTimeline)} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-400">
            {showTimeline ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Oś czasu wydarzeń (opcjonalne)
          </button>
          {showTimeline && (
            <div className="space-y-2">
              {(politics.timeline || []).map((ev: any, i: number) => (
                <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start">
                  <input type="date" value={ev.date || ""} onChange={e => { const t = [...(politics.timeline || [])]; t[i] = { ...t[i], date: e.target.value }; update({ timeline: t }); }} className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                  <input type="text" value={ev.title || ""} onChange={e => { const t = [...(politics.timeline || [])]; t[i] = { ...t[i], id: `ev${i}`, title: e.target.value }; update({ timeline: t }); }} placeholder="Tytuł zdarzenia" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                  <select value={ev.type || "inne"} onChange={e => { const t = [...(politics.timeline || [])]; t[i] = { ...t[i], type: e.target.value }; update({ timeline: t }); }} className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none">
                    <option value="wypowiedz">Wypowiedź</option>
                    <option value="decyzja">Decyzja</option>
                    <option value="glosowanie">Głosowanie</option>
                    <option value="inne">Inne</option>
                  </select>
                  <button type="button" onClick={() => { const t = (politics.timeline || []).filter((_: any, j: number) => j !== i); update({ timeline: t }); }} className="p-1.5 rounded-lg bg-red-50 text-red-600"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <button type="button" onClick={() => update({ timeline: [...(politics.timeline || []), { id: `ev${Date.now()}`, date: "", title: "", type: "inne" }] })} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800">
                <Plus className="h-3.5 w-3.5" /> Dodaj zdarzenie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Investment Form Section ──────────────────────────────────────────────────
function InvestmentFormSection({ formData, setFormData }: any) {
  const investment = formData.investment || {};
  const [showTimeline, setShowTimeline] = useState(false);

  const update = (patch: any) => setFormData({ ...formData, investment: { ...investment, ...patch } });

  return (
    <div className="rounded-2xl border border-orange-200/60 bg-orange-50/40 dark:bg-orange-950/20 dark:border-orange-800/40 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <HardHat className="h-4 w-4 text-orange-600" />
        <h3 className="text-sm font-bold text-orange-900 dark:text-orange-300 uppercase tracking-wide">Dane inwestycji</h3>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
        <input type="checkbox" checked={!!investment.enabled} onChange={e => update({ enabled: e.target.checked })} className="rounded" />
        Włącz sekcję inwestycji
      </label>

      {investment.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Nazwa projektu *</label>
            <input type="text" value={investment.projectName || ""} onChange={e => update({ projectName: e.target.value })} placeholder="np. Modernizacja ul. Fordońskiej" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Status projektu</label>
              <select value={investment.projectStatus || "planowana"} onChange={e => update({ projectStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="planowana">Planowana</option>
                <option value="w_trakcie">W trakcie</option>
                <option value="zakonczona">Zakończona</option>
                <option value="wstrzymana">Wstrzymana</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Styl wyświetlania</label>
              <select value={investment.styleVariant || "technical"} onChange={e => update({ styleVariant: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="technical">Techniczny</option>
                <option value="visual">Wizualny</option>
                <option value="report">Raport</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Lokalizacja</label>
              <input type="text" value={investment.location || ""} onChange={e => update({ location: e.target.value })} placeholder="np. ul. Fordońska, Bydgoszcz" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Budżet</label>
              <input type="text" value={investment.budget || ""} onChange={e => update({ budget: e.target.value })} placeholder="np. 12 mln zł" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Data rozpoczęcia</label>
              <input type="date" value={investment.startDate || ""} onChange={e => update({ startDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Planowane zakończenie</label>
              <input type="date" value={investment.estimatedEndDate || ""} onChange={e => update({ estimatedEndDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Wykonawca</label>
              <input type="text" value={investment.contractor || ""} onChange={e => update({ contractor: e.target.value })} placeholder="np. Budimex S.A." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Inwestor</label>
              <input type="text" value={investment.investor || ""} onChange={e => update({ investor: e.target.value })} placeholder="np. Miasto Bydgoszcz" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Postęp realizacji: {investment.progressPercent || 0}%</label>
            <input type="range" min="0" max="100" value={investment.progressPercent || 0} onChange={e => update({ progressPercent: Number(e.target.value) })} className="w-full accent-orange-600" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Opis wpływu na miasto</label>
            <textarea value={investment.impactDescription || ""} onChange={e => update({ impactDescription: e.target.value })} placeholder="Jak ta inwestycja wpłynie na mieszkańców..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20" />
          </div>

          {/* Timeline */}
          <button type="button" onClick={() => setShowTimeline(!showTimeline)} className="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-400">
            {showTimeline ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Etapy realizacji (opcjonalne)
          </button>
          {showTimeline && (
            <div className="space-y-2">
              {(investment.timeline || []).map((phase: any, i: number) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-start">
                  <input type="date" value={phase.date || ""} onChange={e => { const t = [...(investment.timeline || [])]; t[i] = { ...t[i], date: e.target.value }; update({ timeline: t }); }} className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                  <input type="text" value={phase.title || ""} onChange={e => { const t = [...(investment.timeline || [])]; t[i] = { ...t[i], id: `ph${i}`, title: e.target.value }; update({ timeline: t }); }} placeholder="Etap" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                  <select value={phase.status || "upcoming"} onChange={e => { const t = [...(investment.timeline || [])]; t[i] = { ...t[i], status: e.target.value }; update({ timeline: t }); }} className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none">
                    <option value="completed">Zakończony</option>
                    <option value="current">Bieżący</option>
                    <option value="upcoming">Planowany</option>
                  </select>
                  <button type="button" onClick={() => { const t = (investment.timeline || []).filter((_: any, j: number) => j !== i); update({ timeline: t }); }} className="p-1.5 rounded-lg bg-red-50 text-red-600"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <button type="button" onClick={() => update({ timeline: [...(investment.timeline || []), { id: `ph${Date.now()}`, date: "", title: "", status: "upcoming" }] })} className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700">
                <Plus className="h-3.5 w-3.5" /> Dodaj etap
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Our Actions Form Section ─────────────────────────────────────────────────
function OurActionsFormSection({ formData, setFormData }: any) {
  const ourActions = formData.ourActions || {};
  const [showMilestones, setShowMilestones] = useState(false);
  const [showPartners, setShowPartners] = useState(false);

  const update = (patch: any) => setFormData({ ...formData, ourActions: { ...ourActions, ...patch } });

  return (
    <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-800/40 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Heart className="h-4 w-4 text-rose-600" />
        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wide">Nasze Działania</h3>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
        <input type="checkbox" checked={!!ourActions.enabled} onChange={e => update({ enabled: e.target.checked })} className="rounded" />
        Włącz sekcję działań
      </label>

      {ourActions.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Typ działania</label>
              <select value={ourActions.actionType || "akcja"} onChange={e => update({ actionType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="akcja">Akcja</option>
                <option value="projekt">Projekt</option>
                <option value="kampania">Kampania</option>
                <option value="wspolpraca">Współpraca</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select value={ourActions.actionStatus || "aktywna"} onChange={e => update({ actionStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="aktywna">Aktywna</option>
                <option value="planowana">Planowana</option>
                <option value="zakonczona">Zakończona</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Data rozpoczęcia</label>
              <input type="date" value={ourActions.startDate || ""} onChange={e => update({ startDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Data zakończenia</label>
              <input type="date" value={ourActions.endDate || ""} onChange={e => update({ endDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Styl wyświetlania</label>
            <select value={ourActions.styleVariant || "storytelling"} onChange={e => update({ styleVariant: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
              <option value="storytelling">Storytelling</option>
              <option value="brand">Brand</option>
              <option value="impact">Impact</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Wyniki / Efekty</label>
            <textarea value={ourActions.results || ""} onChange={e => update({ results: e.target.value })} placeholder="Co osiągnęliśmy dzięki tej akcji..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Uczestnicy</label>
            <input type="text" value={ourActions.participants || ""} onChange={e => update({ participants: e.target.value })} placeholder="np. 500 uczestników, 20 wolontariuszy" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Wpływ na społeczność</label>
            <textarea value={ourActions.impact || ""} onChange={e => update({ impact: e.target.value })} placeholder="Jak ta akcja wpłynęła na mieszkańców..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-16" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">CTA - Etykieta przycisku</label>
              <input type="text" value={ourActions.ctaLabel || ""} onChange={e => update({ ctaLabel: e.target.value })} placeholder="np. Dołącz do akcji" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">CTA - Link</label>
              <input type="text" value={ourActions.ctaUrl || ""} onChange={e => update({ ctaUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {/* Partners */}
          <button type="button" onClick={() => setShowPartners(!showPartners)} className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
            {showPartners ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Partnerzy (opcjonalne)
          </button>
          {showPartners && (
            <div className="space-y-2">
              {(ourActions.partners || []).map((p: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input type="text" value={p.name || ""} onChange={e => { const arr = [...(ourActions.partners || [])]; arr[i] = { ...arr[i], id: `p${i}`, name: e.target.value }; update({ partners: arr }); }} placeholder="Nazwa partnera" className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none" />
                  <input type="text" value={p.url || ""} onChange={e => { const arr = [...(ourActions.partners || [])]; arr[i] = { ...arr[i], url: e.target.value }; update({ partners: arr }); }} placeholder="URL (opcjonalne)" className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none" />
                  <button type="button" onClick={() => { const arr = (ourActions.partners || []).filter((_: any, j: number) => j !== i); update({ partners: arr }); }} className="p-2 rounded-xl bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button type="button" onClick={() => update({ partners: [...(ourActions.partners || []), { id: `p${Date.now()}`, name: "" }] })} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700">
                <Plus className="h-3.5 w-3.5" /> Dodaj partnera
              </button>
            </div>
          )}

          {/* Milestones */}
          <button type="button" onClick={() => setShowMilestones(!showMilestones)} className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
            {showMilestones ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Kamienie milowe (opcjonalne)
          </button>
          {showMilestones && (
            <div className="space-y-2">
              {(ourActions.milestones || []).map((m: any, i: number) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-2 items-start">
                  <input type="date" value={m.date || ""} onChange={e => { const arr = [...(ourActions.milestones || [])]; arr[i] = { ...arr[i], date: e.target.value }; update({ milestones: arr }); }} className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                  <input type="text" value={m.title || ""} onChange={e => { const arr = [...(ourActions.milestones || [])]; arr[i] = { ...arr[i], id: `m${i}`, title: e.target.value }; update({ milestones: arr }); }} placeholder="Kamień milowy" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs outline-none" />
                  <button type="button" onClick={() => { const arr = (ourActions.milestones || []).filter((_: any, j: number) => j !== i); update({ milestones: arr }); }} className="p-1.5 rounded-lg bg-red-50 text-red-600"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <button type="button" onClick={() => update({ milestones: [...(ourActions.milestones || []), { id: `m${Date.now()}`, date: "", title: "" }] })} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700">
                <Plus className="h-3.5 w-3.5" /> Dodaj kamień milowy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ArticleFormMain({
  formData,
  setFormData,
  isUploading,
  handleFileUpload,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Tytuł artykułu</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          placeholder="Wprowadź chwytliwy tytuł..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Zajawka (Krótki opis)
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none h-20"
          placeholder="Krótkie streszczenie widoczne na listach..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Treść artykułu</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y min-h-[360px]"
          placeholder="Pełna treść artykułu..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Zdjęcie główne (URL lub wgraj)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="https://..."
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="article-image-upload"
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = await handleFileUpload(file);
                if (url) setFormData({ ...formData, imageUrl: url });
              }
            }}
          />
          <label
            htmlFor="article-image-upload"
            className={`bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl font-semibold cursor-pointer flex items-center gap-2 transition-colors ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Upload className="w-4 h-4" /> Wgraj
          </label>
        </div>
        {formData.imageUrl && (
          <div className="mt-4 h-40 rounded-xl overflow-hidden border border-border relative w-fit">
            <img src={formData.imageUrl} alt="Podgląd" className="h-full object-cover" />
          </div>
        )}
      </div>

      {/* Basic category fields */}
      {formData.category === "bydgoszczanie" && (
        <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 p-4">
          <label className="block text-sm font-semibold mb-2">
            Imię i nazwisko / Pseudonim osoby (Bydgoszczanie)
          </label>
          <input
            type="text"
            value={formData.personName || ""}
            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="np. Pawbeats"
          />
        </div>
      )}

      {formData.category === "medyczna" && (
        <div className="rounded-2xl border border-teal-200/60 bg-teal-50/60 p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Źródło / Instytucja</label>
            <input
              type="text"
              value={formData.sourceName || ""}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="np. Uniwersytet Medyczny"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Link do źródła</label>
            <input
              type="text"
              value={formData.sourceUrl || ""}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Cytat eksperta</label>
            <textarea
              value={formData.expertQuote || ""}
              onChange={(e) => setFormData({ ...formData, expertQuote: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none h-20"
              placeholder="Krótka wypowiedź eksperta..."
            />
          </div>
        </div>
      )}

      {/* Advanced category sections */}
      {formData.category === "sport" && (
        <SportFormSection formData={formData} setFormData={setFormData} />
      )}

      {formData.category === "polityka" && (
        <PoliticsFormSection formData={formData} setFormData={setFormData} />
      )}

      {formData.category === "inwestycje" && (
        <InvestmentFormSection formData={formData} setFormData={setFormData} />
      )}

      {formData.category === "nasze_dzialania" && (
        <OurActionsFormSection formData={formData} setFormData={setFormData} />
      )}
    </div>
  );
}