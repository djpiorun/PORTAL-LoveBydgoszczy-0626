import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, BookOpen, Feather, Flower2 } from "lucide-react";

function splitFullName(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  if (!normalized) return { firstName: "", lastName: "" };
  const parts = normalized.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export default function ObituaryForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    type: "nekrolog" as "nekrolog" | "wspomnienie" | "pozegnanie",
    fullName: "",
    age: "",
    deathDate: "",
    city: "",
    profession: "",
    shortDescription: "",
    title: "",
    content: "",
    funeralDate: "",
    funeralTime: "",
    funeralPlace: "",
    cemeteryPlace: "",
    submitterName: "",
    submitterEmail: "",
    submitterPhone: "",
    submitterRelation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { firstName, lastName } = splitFullName(formData.fullName);
      const payload = {
        type: formData.type,
        first_name: firstName,
        last_name: lastName,
        age: formData.age || null,
        death_date: formData.deathDate || null,
        city: formData.city || null,
        profession: formData.profession || null,
        short_description: formData.shortDescription || null,
        title: formData.title || null,
        content: formData.content || null,
        funeral_date: formData.funeralDate || null,
        funeral_time: formData.funeralTime || null,
        funeral_place: formData.funeralPlace || null,
        cemetery_place: formData.cemeteryPlace || null,
        submitter_name: formData.submitterName || null,
        submitter_email: formData.submitterEmail || null,
        submitter_phone: formData.submitterPhone || null,
        submitter_relation: formData.submitterRelation || null,
      };
      await apiFetch("/obituaries", { method: "POST", body: payload });
      toast.success("Wpis został dodany i oczekuje na moderację.");
      onSuccess();
    } catch (error: any) {
      console.warn("Obituaries API unavailable", error);
      toast.error(error?.message || "Wystąpił błąd podczas dodawania wpisu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-8 px-2 py-6 font-serif">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold uppercase tracking-widest mb-3">Wybierz rodzaj wpisu</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto font-sans">
            Wybierz odpowiedni format publikacji, aby przejść do dedykowanego formularza.
          </p>
        </div>

        <div className="rounded-[26px] border border-amber-200 bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_100%)] p-4 text-sm text-slate-600 shadow-sm">
          Formularz jest uproszczony: mozesz dodac sam podstawowy wpis, a tresc glowna oraz dane osoby zglaszajacej pozostawic puste, jesli nie sa potrzebne.
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { id: "nekrolog", title: "Nekrolog", desc: "Tradycyjne zawiadomienie o śmierci i pogrzebie.", icon: BookOpen },
            { id: "wspomnienie", title: "Wspomnienie", desc: "Dłuższy tekst wspominający osobę zmarłą.", icon: Feather },
            { id: "pozegnanie", title: "Pożegnanie", desc: "Krótkie pożegnanie i kondolencje.", icon: Flower2 }
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = formData.type === type.id;
            return (
              <label 
                key={type.id} 
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[28px] border-2 p-6 text-center transition-all duration-300 ${
                  isSelected 
                    ? 'scale-[1.03] border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-white hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <input 
                  type="radio" 
                  name="type" 
                  value={type.id} 
                  checked={isSelected} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} 
                  className="sr-only" 
                />
                <span className="capitalize font-bold tracking-widest text-lg">{type.title}</span>
                <span className="text-xs text-muted-foreground font-sans leading-relaxed">{type.desc}</span>
              </label>
            );
          })}
        </div>

        <div className="pt-8 flex justify-end border-t border-border mt-8">
          <Button 
            type="button" 
            onClick={() => setStep(2)} 
            size="lg"
            className="font-serif tracking-widest uppercase"
          >
            Przejdź dalej <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7 px-2 py-4 font-sans">
      <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-4">
        <Button type="button" onClick={() => setStep(1)} variant="ghost" className="font-serif tracking-widest uppercase text-xs">
          <ArrowLeft className="w-4 h-4 mr-2" /> Wróć
        </Button>
        <div className="text-right">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Wybrany format</span>
          <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-primary">{formData.type}</h3>
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
        Wypelnij tylko to, co chcesz opublikowac. Wpis moze byc bardzo prosty: imie i nazwisko, wiek, kilka slow od bliskich i ewentualnie informacje o pogrzebie.
      </div>

      <div className="space-y-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafaf9_100%)] p-6 shadow-sm">
        <h3 className="flex items-center gap-3 border-b border-border/70 pb-3 text-lg font-serif font-bold uppercase tracking-widest">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
          Dane osoby zmarłej
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2 sm:col-span-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Imię i nazwisko</Label>
            <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Np. Jan Kowalski" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Wiek</Label>
            <Input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Np. 78 lat" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Data śmierci</Label>
            <Input type="date" value={formData.deathDate} onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Miejscowość</Label>
            <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Np. Bydgoszcz" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Zawód (opcjonalnie)</Label>
            <Input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Np. Nauczyciel" />
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafaf9_100%)] p-6 shadow-sm">
        <h3 className="flex items-center gap-3 border-b border-border/70 pb-3 text-lg font-serif font-bold uppercase tracking-widest">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
          Treść wpisu
        </h3>
        <div className="space-y-6 pt-2">
        {formData.type !== "nekrolog" && (
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Tytuł wpisu</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Np. Ostatnie pożegnanie..." />
          </div>
        )}
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-wider">Krótki opis (widoczny na liście)</Label>
          <Textarea value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} rows={2} className="resize-none" placeholder="Krótkie zdanie wprowadzające..." />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-wider">Główna treść</Label>
          <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} className="resize-none font-serif text-base leading-relaxed" placeholder="Opisz historie zmarłego lub napisz informacje od najbliższych." />
        </div>
        </div>
      </div>

      {formData.type === "nekrolog" && (
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafaf9_100%)] p-6 shadow-sm">
          <h3 className="flex items-center gap-3 border-b border-border/70 pb-3 text-lg font-serif font-bold uppercase tracking-widest">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
            Informacje o pogrzebie
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider">Data ceremonii</Label>
              <Input type="date" value={formData.funeralDate} onChange={(e) => setFormData({ ...formData, funeralDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider">Godzina</Label>
              <Input type="time" value={formData.funeralTime} onChange={(e) => setFormData({ ...formData, funeralTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider">Miejsce mszy / ceremonii</Label>
              <Input value={formData.funeralPlace} onChange={(e) => setFormData({ ...formData, funeralPlace: e.target.value })} placeholder="Np. Kościół pw. Św. Trójcy" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider">Miejsce pochówku</Label>
              <Input value={formData.cemeteryPlace} onChange={(e) => setFormData({ ...formData, cemeteryPlace: e.target.value })} placeholder="Np. Cmentarz Komunalny" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafaf9_100%)] p-6 shadow-sm">
        <h3 className="flex items-center gap-3 border-b border-border/70 pb-3 text-lg font-serif font-bold uppercase tracking-widest">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">{formData.type === "nekrolog" ? "4" : "3"}</span>
          Dane osoby zgłaszającej
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Imię i nazwisko</Label>
            <Input value={formData.submitterName} onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })} placeholder="Twoje dane..." />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">E-mail</Label>
            <Input type="email" value={formData.submitterEmail} onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })} placeholder="adres@email.com" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Telefon</Label>
            <Input type="tel" value={formData.submitterPhone} onChange={(e) => setFormData({ ...formData, submitterPhone: e.target.value })} placeholder="+48..." />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider">Relacja do osoby zmarłej</Label>
            <Input value={formData.submitterRelation} onChange={(e) => setFormData({ ...formData, submitterRelation: e.target.value })} placeholder="Np. Rodzina, Przyjaciele" />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-4 border-t border-border mt-8">
        <Button type="button" variant="outline" onClick={onSuccess} className="font-serif font-bold uppercase tracking-widest">Anuluj</Button>
        <Button type="submit" disabled={isSubmitting} className="font-serif font-bold uppercase tracking-widest">
          {isSubmitting ? "Wysyłanie..." : "Wyślij do moderacji"}
        </Button>
      </div>
    </form>
  );
}
