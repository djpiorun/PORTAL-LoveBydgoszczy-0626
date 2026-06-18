import { AlertTriangle, BookmarkPlus, PenTool, Save, ShieldCheck, Zap } from "lucide-react";

export default function ArticleFormManagement({
  formData,
  setFormData,
  isUploading,
  onCancel,
  onSave,
}: any) {
  return (
    <div className="mt-10 rounded-3xl border border-border bg-gradient-to-br from-muted/40 via-background to-muted/30 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-lg font-bold">Centrum zarządzania artykułem</h3>
        <p className="text-sm text-muted-foreground">
          Szybkie oznaczenia, ustawienia widoczności i finalny zapis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-background/70 p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Etykiety artykułu
          </h4>

          <div className="grid gap-3">
            <label className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.labelUrgent || false}
                onChange={(e) => setFormData({ ...formData, labelUrgent: e.target.checked })}
                className="w-5 h-5 rounded border-red-400 text-red-600 focus:ring-red-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block text-red-700">🔴 PILNE</span>
                <span className="text-xs text-red-600/70">Wyróżnienie pilne na czerwono.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.labelImportant || false}
                onChange={(e) => setFormData({ ...formData, labelImportant: e.target.checked })}
                className="w-5 h-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block text-yellow-700">🟡 WAŻNE</span>
                <span className="text-xs text-yellow-600/70">Ważna informacja dla mieszkańców.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.labelOurNews || false}
                onChange={(e) => setFormData({ ...formData, labelOurNews: e.target.checked })}
                className="w-5 h-5 rounded border-blue-400 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block text-blue-700">🔵 NASZ TEKST</span>
                <span className="text-xs text-blue-600/70">Treść redakcji LoveBydgoszcz.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl border border-violet-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.labelMustKnow || false}
                onChange={(e) => setFormData({ ...formData, labelMustKnow: e.target.checked })}
                className="w-5 h-5 rounded border-violet-400 text-violet-600 focus:ring-violet-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block text-violet-700">🟣 MUSISZ WIEDZIEĆ</span>
                <span className="text-xs text-violet-600/70">Podkreślone informacje do zapamiętania.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl border border-teal-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.labelAuthorArticle || false}
                onChange={(e) => setFormData({ ...formData, labelAuthorArticle: e.target.checked })}
                className="w-5 h-5 rounded border-teal-400 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block text-teal-700">🟢 ARTYKUŁ AUTORA</span>
                <span className="text-xs text-teal-600/70">Wyróżnij treść autora.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/70 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Widoczność i promocja
            </h4>

            <label className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-bold block">Wyróżniony artykuł</span>
                <span className="text-xs text-muted-foreground">
                  Pojawi się w sekcji Hero na stronie głównej.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPatronage}
                onChange={(e) => setFormData({ ...formData, isPatronage: e.target.checked })}
                className="w-5 h-5 rounded border-amber-500 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-bold block text-amber-900 dark:text-amber-500">
                  Patronat Medialny
                </span>
                <span className="text-xs text-amber-700/70 dark:text-amber-500/70">
                  Wyróżnienie w dedykowanym sliderze.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hideInReels}
                onChange={(e) => setFormData({ ...formData, hideInReels: e.target.checked })}
                className="w-5 h-5 rounded border-red-500 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-sm font-bold block text-red-900 dark:text-red-500">
                  Ukryj w Rolkach
                </span>
                <span className="text-xs text-red-700/70 dark:text-red-500/70">
                  Artykuł nie będzie widoczny w zakładce Rolki.
                </span>
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-5 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Akcje końcowe
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={onSave}
                disabled={isUploading}
                className={`flex-1 bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Save className="w-5 h-5" />
                Zapisz artykuł
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
