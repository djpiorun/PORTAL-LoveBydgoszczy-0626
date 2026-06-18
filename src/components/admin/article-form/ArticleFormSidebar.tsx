export default function ArticleFormSidebar({
  formData,
  setFormData,
  categories,
}: any) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-border p-4 bg-muted/20">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
          Ustawienia publikacji
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Kategoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            >
              {categories.map((cat: { value: string; label: string }) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Autor</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Imię i nazwisko lub pseudonim"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Data publikacji</label>
            <input
              type="datetime-local"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tagi (po przecinku)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="np. miasto, inwestycje, kultura"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Stopka Autora</label>
            <select
              value={formData.authorFooterStyle || "default"}
              onChange={(e) => setFormData({ ...formData, authorFooterStyle: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="default">Stopka (domyślna)</option>
              <option value="business">Stopka Wizytówkowa</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
