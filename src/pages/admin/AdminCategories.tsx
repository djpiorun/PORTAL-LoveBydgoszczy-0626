import CategorySettingsSection from "@/components/admin/CategorySettingsSection";
import { Tag } from "lucide-react";

export default function AdminCategories() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Kategorie</h1>
            <p className="text-slate-500 mt-0.5">Zarządzaj kategoriami artykułów, bazami danych i rozszerzeniami</p>
          </div>
        </div>
      </div>
      <CategorySettingsSection />
    </div>
  );
}
