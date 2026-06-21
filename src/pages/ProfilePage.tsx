import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileImageField from "@/components/users/ProfileImageField";
import { useAuth } from "@/hooks/use-auth";
import { useUserMediaUpload } from "@/hooks/use-user-media-upload";
import { BadgeInfo, Save, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router";
import { apiFetch } from "@/lib/api-client";

type ProfileUser = NonNullable<ReturnType<typeof useAuth>["user"]> & {
  username?: string;
  subtitle?: string;
  status?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  image?: string;
  coverImage?: string;
};

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const uploadUserMedia = useUserMediaUpload();
  const [uploadingField, setUploadingField] = useState<"image" | "coverImage" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    subtitle: "",
    status: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    image: "",
    coverImage: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    const profile = user as ProfileUser;
    setForm({
      name: profile.name || "",
      username: profile.username || "",
      subtitle: profile.subtitle || "",
      status: profile.status || "",
      description: profile.description || "",
      contactEmail: profile.contactEmail || "",
      contactPhone: profile.contactPhone || "",
      facebookUrl: profile.facebookUrl || "",
      instagramUrl: profile.instagramUrl || "",
      twitterUrl: profile.twitterUrl || "",
      websiteUrl: profile.websiteUrl || "",
      image: profile.image || "",
      coverImage: profile.coverImage || "",
      password: "",
      confirmPassword: "",
    });
  }, [user]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/logowanie?redirect=%2Fprofil" replace />;
  }

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field: "image" | "coverImage", file: File) => {
    try {
      setUploadingField(field);
      const url = await uploadUserMedia(file);
      setField(field, url);
      toast.success(field === "image" ? "Zdjęcie profilowe zostało dodane" : "Zdjęcie w tle zostało dodane");
    } catch (error: any) {
      toast.error(error?.message || "Nie udało się przesłać pliku");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Imię i nazwisko jest wymagane");
      return;
    }

    if (!form.username.trim()) {
      toast.error("Nazwa użytkownika jest wymagana");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Hasła nie są takie same");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        subtitle: form.subtitle,
        status: form.status,
        description: form.description,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone,
        facebook_url: form.facebookUrl,
        instagram_url: form.instagramUrl,
        twitter_url: form.twitterUrl,
        website_url: form.websiteUrl,
        image: form.image,
        cover_image: form.coverImage,
      };

      await apiFetch("/users/me", {
        method: "PUT",
        body: payload,
      });

      await apiFetch("/users/me/credentials", {
        method: "PUT",
        body: {
          username: form.username.trim(),
          password: form.password.trim() || undefined,
        },
      });
      setField("password", "");
      setField("confirmPassword", "");
      toast.success("Profil został zapisany");
    } catch (error: any) {
      toast.error(error?.message || "Nie udało się zapisać profilu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Profil</h1>
          <p className="mt-2 text-slate-500">Edytuj swój publiczny profil autora i sprawdź ustawienia konta.</p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Profil publiczny autora</h2>
                <p className="text-sm text-slate-500">To jest widoczne na stronie autora i pod Twoimi publikacjami.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Imię i nazwisko</label>
                  <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="np. Anna Kowalska" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nazwa użytkownika</label>
                  <input type="text" value={form.username} onChange={(e) => setField("username", e.target.value.toLowerCase())} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="np. anna-kowalska" />
                  <p className="mt-1 text-xs text-slate-500">Będzie działać jako login zamiast emaila.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Podtytuł / rola redakcyjna</label>
                  <input type="text" value={form.subtitle} onChange={(e) => setField("subtitle", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="np. reporter miejski" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Status publiczny</label>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15">
                    <option value="">Brak</option>
                    <option value="Współpraca">Współpraca</option>
                    <option value="Bloger">Bloger</option>
                    <option value="Redakcja Love Bydgoszcz">Redakcja Love Bydgoszcz</option>
                    <option value="Osoba Publiczna">Osoba Publiczna</option>
                    <option value="UGC">UGC</option>
                    <option value="Autor">Autor</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Opis autora</label>
                  <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="Krótko opisz czym się zajmujesz, o czym piszesz i jak chcesz być przedstawiany czytelnikom." />
                </div>
              </div>

              <div className="space-y-4">
                <ProfileImageField
                  label="Zdjęcie profilowe"
                  value={form.image}
                  onChange={(value) => setField("image", value)}
                  onUpload={(file) => handleImageUpload("image", file)}
                  uploading={uploadingField === "image"}
                  shape="avatar"
                />
                <ProfileImageField
                  label="Zdjęcie w tle (cover)"
                  value={form.coverImage}
                  onChange={(value) => setField("coverImage", value)}
                  onUpload={(file) => handleImageUpload("coverImage", file)}
                  uploading={uploadingField === "coverImage"}
                  shape="cover"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <BadgeInfo className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Kontakt publiczny</h2>
                <p className="text-sm text-slate-500">Opcjonalne dane do wizytówki autora.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email kontaktowy</label>
                <input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="kontakt@..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Telefon</label>
                <input type="text" value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="+48..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Facebook URL</label>
                <input type="text" value={form.facebookUrl} onChange={(e) => setField("facebookUrl", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Instagram URL</label>
                <input type="text" value={form.instagramUrl} onChange={(e) => setField("instagramUrl", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Twitter / X URL</label>
                <input type="text" value={form.twitterUrl} onChange={(e) => setField("twitterUrl", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="https://twitter.com/..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Strona WWW</label>
                <input type="text" value={form.websiteUrl} onChange={(e) => setField("websiteUrl", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" placeholder="https://..." />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-900 bg-slate-950 p-6 text-slate-200 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Dane logowania</h2>
                <p className="text-sm text-slate-400">Oddzielone od profilu publicznego.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">Email konta</label>
                <input type="text" value={user?.email || ""} disabled className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">Login</label>
                <input type="text" value={form.username || ""} onChange={(e) => setField("username", e.target.value.toLowerCase())} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="twoj-login" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">Nowe hasło</label>
                <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="minimum 8 znaków" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">Powtórz hasło</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="powtórz hasło" />
              </div>
            </div>

            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Po zapisaniu możesz logować się emailem albo nazwą użytkownika, a w następnym kroku podać hasło. Kod email może dalej działać awaryjnie, jeśli będzie potrzebny.
            </p>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Zapisywanie..." : "Zapisz profil"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
