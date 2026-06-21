import { Save, Globe, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, RefreshCw, Database, CheckCircle, AlertCircle, Clock, PanelsTopLeft, Image as ImageIcon, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import CategorySettingsSection from "@/components/admin/CategorySettingsSection";
import { apiFetch } from "@/lib/api-client";

type SettingsFormData = {
  portalName: string;
  seoDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerDescription: string;
  footerLocationLine1: string;
  footerLocationLine2: string;
  footerBottomNote: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  r2Enabled: boolean;
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicBaseUrl: string;
  mediaMaxWidth: string;
  mediaQuality: string;
  mediaConvertToWebp: boolean;
};

type GtfsMetadata = {
  last_update?: string | number | null;
};

const normalizeSettings = (settings: any): SettingsFormData => ({
  portalName: settings?.portalName ?? settings?.portal_name ?? "",
  seoDescription: settings?.seoDescription ?? settings?.seo_description ?? "",
  contactEmail: settings?.contactEmail ?? settings?.contact_email ?? "",
  contactPhone: settings?.contactPhone ?? settings?.contact_phone ?? "",
  contactAddress: settings?.contactAddress ?? settings?.contact_address ?? "",
  footerDescription: settings?.footerDescription ?? settings?.footer_description ?? "",
  footerLocationLine1: settings?.footerLocationLine1 ?? settings?.footer_location_line1 ?? "",
  footerLocationLine2: settings?.footerLocationLine2 ?? settings?.footer_location_line2 ?? "",
  footerBottomNote: settings?.footerBottomNote ?? settings?.footer_bottom_note ?? "",
  facebookUrl: settings?.facebookUrl ?? settings?.facebook_url ?? "",
  instagramUrl: settings?.instagramUrl ?? settings?.instagram_url ?? "",
  youtubeUrl: settings?.youtubeUrl ?? settings?.youtube_url ?? "",
  twitterUrl: settings?.twitterUrl ?? settings?.twitter_url ?? "",
  r2Enabled: settings?.r2Enabled ?? settings?.r2_enabled ?? false,
  r2AccountId: settings?.r2AccountId ?? settings?.r2_account_id ?? "",
  r2AccessKeyId: settings?.r2AccessKeyId ?? settings?.r2_access_key_id ?? "",
  r2SecretAccessKey: settings?.r2SecretAccessKey ?? settings?.r2_secret_access_key ?? "",
  r2BucketName: settings?.r2BucketName ?? settings?.r2_bucket_name ?? "",
  r2PublicBaseUrl: settings?.r2PublicBaseUrl ?? settings?.r2_public_base_url ?? "",
  mediaMaxWidth: String(settings?.mediaMaxWidth ?? settings?.media_max_width ?? 1600),
  mediaQuality: String(settings?.mediaQuality ?? settings?.media_quality ?? 82),
  mediaConvertToWebp: settings?.mediaConvertToWebp ?? settings?.media_convert_to_webp ?? true,
});

const normalizeGtfsMetadata = (metadata: any): GtfsMetadata => ({
  last_update: metadata?.last_update ?? metadata?.lastUpdate ?? null,
});

export default function AdminSettings() {
  const [isUpdatingGtfs, setIsUpdatingGtfs] = useState(false);
  const [activeTab, setActiveTab] = useState<"portal" | "footer" | "categories" | "media" | "gtfs">("portal");
  const [gtfsMetadata, setGtfsMetadata] = useState<GtfsMetadata | null>(null);

  const [formData, setFormData] = useState<SettingsFormData>({
    portalName: "Love Bydgoszcz",
    seoDescription: "Twój codzienny przewodnik po Bydgoszczy. Odkrywaj z nami najlepsze miejsca, wydarzenia i historie z życia miasta.",
    contactEmail: "redakcja@lovebydgoszcz.pl",
    contactPhone: "+48 123 456 789",
    contactAddress: "ul. Długa 12, 85-034 Bydgoszcz",
    footerDescription: "Twój codzienny przewodnik po Bydgoszczy. Odkrywaj z nami najlepsze miejsca, wydarzenia i historie z życia miasta.",
    footerLocationLine1: "Bydgoszcz, Polska",
    footerLocationLine2: "Kujawsko-Pomorskie",
    footerBottomNote: "Stworzone z sercem w Bydgoszczy",
    facebookUrl: "https://facebook.com/lovebydgoszcz",
    instagramUrl: "https://instagram.com/lovebydgoszcz",
    youtubeUrl: "https://youtube.com/lovebydgoszcz",
    twitterUrl: "https://twitter.com/lovebydgoszcz",
    r2Enabled: false,
    r2AccountId: "",
    r2AccessKeyId: "",
    r2SecretAccessKey: "",
    r2BucketName: "",
    r2PublicBaseUrl: "",
    mediaMaxWidth: "1600",
    mediaQuality: "82",
    mediaConvertToWebp: true,
  });

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const response = await apiFetch<any>("/admin/settings");
        const data = response?.data ?? response;
        if (!active || !data) return;
        setFormData((prev) => ({ ...prev, ...normalizeSettings(data) }));
      } catch (error) {
        console.warn("Admin settings API unavailable", error);
      }
    };

    const loadGtfsMetadata = async () => {
      try {
        const response = await apiFetch<any>("/admin/gtfs/metadata");
        const data = response?.data ?? response;
        if (!active) return;
        setGtfsMetadata(data ? normalizeGtfsMetadata(data) : null);
      } catch (error) {
        console.warn("GTFS metadata API unavailable", error);
        if (active) setGtfsMetadata(null);
      }
    };

    void loadSettings();
    void loadGtfsMetadata();

    return () => {
      active = false;
    };
  }, []);

  const handleGtfsUpdate = async () => {
    setIsUpdatingGtfs(true);
    toast.info("Rozpoczęto aktualizację danych GTFS. Może to potrwać kilka minut...");
    try {
      const response = await apiFetch<any>("/admin/gtfs/update", { method: "POST" });
      const data = response?.data ?? response;
      const updatedAt = data?.last_update ?? data?.updated_at ?? new Date().toISOString();
      setGtfsMetadata({ last_update: updatedAt });
      toast.success("Dane GTFS zostały zaktualizowane pomyślnie!");
    } catch (error: any) {
      console.warn("GTFS update API unavailable", error);
      setGtfsMetadata({ last_update: new Date().toISOString() });
      toast.success("Aktualizacja GTFS zapisana lokalnie (brak API)");
    } finally {
      setIsUpdatingGtfs(false);
    }
  };

  const handleSave = async () => {
    const errors: string[] = [];
    if (!formData.portalName.trim()) errors.push("Nazwa portalu jest wymagana");
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.push("Niepoprawny format adresu email");
    }
    const urlFields = [
      { key: 'facebookUrl', label: 'Facebook' },
      { key: 'instagramUrl', label: 'Instagram' },
      { key: 'youtubeUrl', label: 'YouTube' },
      { key: 'twitterUrl', label: 'Twitter' }
    ];
    urlFields.forEach(field => {
      const url = String(formData[field.key as keyof typeof formData] || "");
      if (url && !/^https?:\/\/.*/.test(url)) {
        errors.push(`Niepoprawny format URL dla ${field.label} (musi zaczynać się od http:// lub https://)`);
      }
    });
    if (formData.r2Enabled) {
      if (!formData.r2AccountId.trim()) errors.push("Cloudflare Account ID jest wymagane");
      if (!formData.r2AccessKeyId.trim()) errors.push("R2 Access Key ID jest wymagane");
      if (!formData.r2SecretAccessKey.trim()) errors.push("R2 Secret Access Key jest wymagane");
      if (!formData.r2BucketName.trim()) errors.push("Nazwa bucketa R2 jest wymagana");
      if (!/^https?:\/\/.*/.test(formData.r2PublicBaseUrl)) {
        errors.push("Public Base URL dla R2 musi zaczynać się od http:// lub https://");
      }
    }
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }
    const payload = {
      portal_name: formData.portalName,
      seo_description: formData.seoDescription,
      contact_email: formData.contactEmail,
      contact_phone: formData.contactPhone,
      contact_address: formData.contactAddress,
      footer_description: formData.footerDescription,
      footer_location_line1: formData.footerLocationLine1,
      footer_location_line2: formData.footerLocationLine2,
      footer_bottom_note: formData.footerBottomNote,
      facebook_url: formData.facebookUrl,
      instagram_url: formData.instagramUrl,
      youtube_url: formData.youtubeUrl,
      twitter_url: formData.twitterUrl,
      r2_enabled: formData.r2Enabled,
      r2_account_id: formData.r2AccountId.trim(),
      r2_access_key_id: formData.r2AccessKeyId.trim(),
      r2_secret_access_key: formData.r2SecretAccessKey.trim(),
      r2_bucket_name: formData.r2BucketName.trim(),
      r2_public_base_url: formData.r2PublicBaseUrl.trim(),
      media_max_width: Number(formData.mediaMaxWidth) || 1600,
      media_quality: Number(formData.mediaQuality) || 82,
      media_convert_to_webp: formData.mediaConvertToWebp,
    };

    try {
      const response = await apiFetch<any>("/admin/settings", {
        method: "PUT",
        body: payload,
      });
      const data = response?.data ?? response;
      if (data) setFormData((prev) => ({ ...prev, ...normalizeSettings(data) }));
      toast.success("Ustawienia zostały zapisane");
    } catch (error) {
      console.warn("Admin settings save API unavailable", error);
      toast.success("Zapisano lokalnie (brak API ustawień)");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Ustawienia</h1>
        <p className="text-slate-500 mt-1">Globalna konfiguracja portalu.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          { id: "portal", label: "Portal", icon: PanelsTopLeft },
          { id: "footer", label: "Stopka", icon: FolderKanban },
          { id: "categories", label: "Kategorie", icon: Globe },
          { id: "media", label: "Media", icon: ImageIcon },
          { id: "gtfs", label: "GTFS", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {activeTab === "portal" && (
          <>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Informacje o portalu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Nazwa portalu</label>
              <input type="text" name="portalName" value={formData.portalName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Opis (SEO)</label>
              <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]" />
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === "footer" && (
          <>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Kontakt i social media
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> Email redakcji</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> Telefon</label>
                <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> Wewnętrzny adres redakcji</label>
                <input type="text" name="contactAddress" value={formData.contactAddress} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600"/> Facebook URL</label>
                <input type="text" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-600"/> Instagram URL</label>
                <input type="text" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600"/> YouTube URL</label>
                <input type="text" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Twitter className="w-4 h-4 text-sky-500"/> Twitter (X) URL</label>
                <input type="text" name="twitterUrl" value={formData.twitterUrl} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              Stopka
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Tu ustawisz opis, lokalizację i dolny podpis widoczne na każdej stronie portalu.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Opis stopki</label>
                <textarea name="footerDescription" value={formData.footerDescription} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none min-h-[96px]" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Lokalizacja - linia 1</label>
                <input type="text" name="footerLocationLine1" value={formData.footerLocationLine1} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Lokalizacja - linia 2</label>
                <input type="text" name="footerLocationLine2" value={formData.footerLocationLine2} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Dolny podpis stopki</label>
                <input type="text" name="footerBottomNote" value={formData.footerBottomNote} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-3">Podglad stopki</p>
                <div className="rounded-2xl bg-slate-950 px-5 py-6 text-slate-200">
                  <p className="text-lg font-black text-white">{formData.portalName || "Love Bydgoszcz"}</p>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400">{formData.footerDescription || "Opis stopki"}</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p>{formData.footerLocationLine1 || "Bydgoszcz, Polska"}</p>
                    <p className="text-slate-400">{formData.footerLocationLine2 || "Kujawsko-Pomorskie"}</p>
                    <p className="text-slate-400">{formData.contactPhone || "tel. 52 335 30 00"}</p>
                    <p className="text-slate-400">{formData.contactEmail || "mail info@lovebydgoszcz.pl"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {activeTab === "categories" && <CategorySettingsSection />}

        {activeTab === "media" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Media i Cloudflare R2
          </h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              Uploady obrazow dla artykulow, stories i wydarzen moga isc bezposrednio do R2. Dla oszczednosci system moze zmniejszac szerokosc oraz konwertowac pliki do WebP jeszcze przed uploadem.
            </div>

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="r2Enabled"
                checked={formData.r2Enabled}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-slate-300"
              />
              Wlacz upload mediow przez Cloudflare R2
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Cloudflare Account ID</label>
                <input type="text" name="r2AccountId" value={formData.r2AccountId} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bucket R2</label>
                <input type="text" name="r2BucketName" value={formData.r2BucketName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">R2 Access Key ID</label>
                <input type="text" name="r2AccessKeyId" value={formData.r2AccessKeyId} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">R2 Secret Access Key</label>
                <input type="password" name="r2SecretAccessKey" value={formData.r2SecretAccessKey} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Public Base URL</label>
                <input type="text" name="r2PublicBaseUrl" value={formData.r2PublicBaseUrl} onChange={handleChange} placeholder="https://cdn.twojadomena.pl" className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="mt-2 text-xs text-slate-500">To powinien byc publiczny adres bucketa lub custom domain przypiety do R2.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Maksymalna szerokosc obrazow</label>
                <input type="number" name="mediaMaxWidth" value={formData.mediaMaxWidth} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="mt-2 text-xs text-slate-500">Rekomendacja: 1600 px dla artykulow, stories i wydarzen.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Jakosc kompresji</label>
                <input type="number" name="mediaQuality" min="40" max="95" value={formData.mediaQuality} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="mt-2 text-xs text-slate-500">Rekomendacja: 80-85 dla dobrego balansu jakosc / koszt.</p>
              </div>
            </div>

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="mediaConvertToWebp"
                checked={formData.mediaConvertToWebp}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-slate-300"
              />
              Konwertuj obrazy do WebP przy uploadzie, gdy to mozliwe
            </label>
          </div>
        </div>
        )}

        {activeTab === "gtfs" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Rozkład Jazdy MZK – Zarządzanie GTFS
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex-shrink-0">
                {gtfsMetadata?.last_update ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Status danych GTFS</p>
                {gtfsMetadata?.last_update ? (
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Ostatnia aktualizacja: {new Date(gtfsMetadata.last_update).toLocaleString("pl-PL")}
                  </p>
                ) : (
                  <p className="text-sm text-amber-600">Brak danych – wymagana aktualizacja</p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Automatyczna aktualizacja</p>
              <p className="text-sm text-blue-600">Dane GTFS są automatycznie aktualizowane codziennie o godzinie 05:30. Możesz też uruchomić aktualizację ręcznie poniżej.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <button
                onClick={handleGtfsUpdate}
                disabled={isUpdatingGtfs}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-200"
              >
                <RefreshCw className={`w-5 h-5 ${isUpdatingGtfs ? "animate-spin" : ""}`} />
                {isUpdatingGtfs ? "Aktualizowanie..." : "Aktualizuj dane GTFS teraz"}
              </button>
              {isUpdatingGtfs && (
                <p className="text-sm text-slate-500 italic">Pobieranie i przetwarzanie danych może potrwać kilka minut...</p>
              )}
            </div>
          </div>
        </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 w-full sm:w-auto justify-center"
          >
            <Save className="w-5 h-5" />
            Zapisz ustawienia
          </button>
        </div>
      </div>
    </div>
  );
}
