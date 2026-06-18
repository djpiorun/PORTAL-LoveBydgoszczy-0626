import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { User, Mail, ChevronLeft, ChevronRight, Trash2, Edit2, X, Save, Shield, BadgeInfo } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ProfileImageField from "@/components/users/ProfileImageField";
import { useUserMediaUpload } from "@/hooks/use-user-media-upload";

export default function AdminUsers() {
  const users = useQuery(api.users.getAll);
  const createUser = useMutation(api.users.create);
  const updateRole = useMutation(api.users.updateRole);
  const updateUser = useMutation(api.users.update);
  const adminUpdateCredentials = useMutation(api.users.adminUpdateCredentials);
  const removeUser = useMutation(api.users.remove);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [uploadingField, setUploadingField] = useState<"image" | "coverImage" | null>(null);
  const itemsPerPage = 10;
  const uploadUserMedia = useUserMediaUpload();

  const handleRoleChange = async (id: any, newRole: any) => {
    try {
      await updateRole({ id, role: newRole });
      toast.success("Rola użytkownika zaktualizowana");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji roli. Upewnij się, że masz uprawnienia administratora.");
    }
  };

  const handleDeleteUser = async (id: any) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.")) {
      try {
        await removeUser({ id });
        toast.success("Użytkownik został usunięty");
      } catch (error) {
        toast.error("Błąd podczas usuwania użytkownika. Upewnij się, że masz uprawnienia administratora.");
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      if (!editingUser.email?.trim()) {
        throw new Error("Email konta jest wymagany");
      }
      if (!editingUser.username?.trim()) {
        throw new Error("Nazwa użytkownika jest wymagana");
      }
      if (editingUser.isNew && !editingUser.password?.trim()) {
        throw new Error("Hasło jest wymagane dla nowego konta");
      }

      if (editingUser.isNew) {
        await createUser({
          name: editingUser.name,
          username: editingUser.username,
          email: editingUser.email,
          password: editingUser.password,
          role: editingUser.role || "user",
          image: editingUser.image,
          subtitle: editingUser.subtitle,
          status: editingUser.status,
          description: editingUser.description,
          contactEmail: editingUser.contactEmail,
          contactPhone: editingUser.contactPhone,
          facebookUrl: editingUser.facebookUrl,
          instagramUrl: editingUser.instagramUrl,
          twitterUrl: editingUser.twitterUrl,
          websiteUrl: editingUser.websiteUrl,
          coverImage: editingUser.coverImage,
          isLoveBydgoszczTeam: editingUser.isLoveBydgoszczTeam,
        });
        toast.success("Użytkownik został dodany");
      } else {
        await updateUser({
          id: editingUser._id,
          name: editingUser.name,
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role,
          image: editingUser.image,
          subtitle: editingUser.subtitle,
          status: editingUser.status,
          description: editingUser.description,
          contactEmail: editingUser.contactEmail,
          contactPhone: editingUser.contactPhone,
          facebookUrl: editingUser.facebookUrl,
          instagramUrl: editingUser.instagramUrl,
          twitterUrl: editingUser.twitterUrl,
          websiteUrl: editingUser.websiteUrl,
          coverImage: editingUser.coverImage,
          isLoveBydgoszczTeam: editingUser.isLoveBydgoszczTeam,
        });
        await adminUpdateCredentials({
          id: editingUser._id,
          username: editingUser.username,
          password: editingUser.password?.trim() || undefined,
        });
        toast.success("Dane użytkownika zaktualizowane");
      }
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error?.message || "Błąd podczas zapisu użytkownika.");
    }
  };

  const handleImageUpload = async (field: "image" | "coverImage", file: File) => {
    try {
      setUploadingField(field);
      const url = await uploadUserMedia(file);
      setEditingUser((prev: any) => ({ ...prev, [field]: url }));
      toast.success(field === "image" ? "Zdjęcie profilowe zostało dodane" : "Zdjęcie w tle zostało dodane");
    } catch (error: any) {
      toast.error(error?.message || "Nie udało się przesłać pliku");
    } finally {
      setUploadingField(null);
    }
  };

  const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);
  const paginatedUsers = users?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Użytkownicy</h1>
        <p className="text-slate-500 mt-1">Zarządzanie kontami i uprawnieniami.</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setEditingUser({
            isNew: true,
            name: "",
            username: "",
            email: "",
            password: "",
            role: "user",
            image: "",
            subtitle: "",
            status: "",
            description: "",
            contactEmail: "",
            contactPhone: "",
            facebookUrl: "",
            instagramUrl: "",
            twitterUrl: "",
            websiteUrl: "",
            coverImage: "",
            isLoveBydgoszczTeam: false,
          })}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Dodaj użytkownika
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Użytkownik</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Login</th>
                <th className="p-4 font-semibold">Rola</th>
                <th className="p-4 font-semibold text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {!users ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-4"><div className="h-10 bg-slate-100 rounded-full w-10 animate-pulse inline-block"></div><div className="h-5 bg-slate-100 rounded w-32 animate-pulse inline-block ml-3"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded w-48 animate-pulse"></div></td>
                    <td className="p-4"><div className="h-8 bg-slate-100 rounded w-24 animate-pulse"></div></td>
                    <td className="p-4"><div className="h-8 bg-slate-100 rounded w-8 animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedUsers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Brak użytkowników.
                  </td>
                </tr>
              ) : (
                paginatedUsers?.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{user.name || "Anonim"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        {user.email || "Brak emaila"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                        {user.username || "Brak"}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role || "user"}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border outline-none ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="user">Użytkownik</option>
                        <option value="member">Członek</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edytuj użytkownika"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Usuń użytkownika"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Strona {currentPage} z {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Edytuj użytkownika</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="edit-user-form" onSubmit={handleSaveEdit} className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{editingUser.isNew ? "Nowy użytkownik" : "Profil publiczny autora"}</h4>
                      <p className="text-sm text-slate-500">Te dane sa widoczne na stronie `/autor/...` oraz przy artykułach.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Imię i nazwisko</label>
                        <input type="text" value={editingUser.name || ""} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="np. Anna Kowalska" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Podtytuł / rola redakcyjna</label>
                        <input type="text" value={editingUser.subtitle || ""} onChange={(e) => setEditingUser({...editingUser, subtitle: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="np. reporterka miejska" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Status publiczny</label>
                        <select value={editingUser.status || ""} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white">
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
                        <textarea value={editingUser.description || ""} onChange={(e) => setEditingUser({...editingUser, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px]" placeholder="Krótki opis autora, specjalizacja, styl pracy..." />
                      </div>
                      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="checkbox" checked={editingUser.isLoveBydgoszczTeam || false} onChange={(e) => setEditingUser({...editingUser, isLoveBydgoszczTeam: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                        <span className="text-sm font-semibold text-slate-700">Pokazuj plakietkę „Zespół Love Bydgoszcz”</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <ProfileImageField
                        label="Zdjęcie profilowe"
                        value={editingUser.image || ""}
                        onChange={(value) => setEditingUser({ ...editingUser, image: value })}
                        onUpload={(file) => handleImageUpload("image", file)}
                        uploading={uploadingField === "image"}
                        shape="avatar"
                      />
                      <ProfileImageField
                        label="Zdjęcie w tle (cover)"
                        value={editingUser.coverImage || ""}
                        onChange={(value) => setEditingUser({ ...editingUser, coverImage: value })}
                        onUpload={(file) => handleImageUpload("coverImage", file)}
                        uploading={uploadingField === "coverImage"}
                        shape="cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <BadgeInfo className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">Kontakt publiczny</h4>
                      <p className="text-sm text-slate-500">To pojawi się w wizytówce autora, jeśli wypełnisz pola.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email kontaktowy</label>
                      <input type="email" value={editingUser.contactEmail || ""} onChange={(e) => setEditingUser({...editingUser, contactEmail: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="kontakt@..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Telefon</label>
                      <input type="text" value={editingUser.contactPhone || ""} onChange={(e) => setEditingUser({...editingUser, contactPhone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+48..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Facebook URL</label>
                      <input type="text" value={editingUser.facebookUrl || ""} onChange={(e) => setEditingUser({...editingUser, facebookUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram URL</label>
                      <input type="text" value={editingUser.instagramUrl || ""} onChange={(e) => setEditingUser({...editingUser, instagramUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Twitter / X URL</label>
                      <input type="text" value={editingUser.twitterUrl || ""} onChange={(e) => setEditingUser({...editingUser, twitterUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://twitter.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Strona WWW</label>
                      <input type="text" value={editingUser.websiteUrl || ""} onChange={(e) => setEditingUser({...editingUser, websiteUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white">Dane konta i logowania</h4>
                      <p className="text-sm text-slate-400">Ta sekcja nie jest publiczna. Dotyczy dostępu do panelu.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1">Email konta</label>
                      <input type="email" value={editingUser.email || ""} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="konto@..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1">Nazwa użytkownika (login)</label>
                      <input type="text" value={editingUser.username || ""} onChange={(e) => setEditingUser({...editingUser, username: e.target.value.toLowerCase()})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="login-uzytkownika" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1">Hasło</label>
                      <input type="password" value={editingUser.password || ""} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={editingUser.isNew ? "minimum 8 znaków" : "zostaw puste, aby nie zmieniać"} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1">Rola i dostęp</label>
                      <select value={editingUser.role || "user"} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <option value="user">Użytkownik</option>
                        <option value="member">Członek</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    Użytkownik może logować się emailem albo nazwą użytkownika. Przy edycji zostaw pole hasła puste, jeśli nie chcesz go zmieniać.
                  </p>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                Anuluj
              </button>
              <button type="submit" form="edit-user-form" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
