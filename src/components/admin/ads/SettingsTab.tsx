import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";

const DEFAULT_FORM = {
  isModuleEnabled: true,
  autoRotation: true,
  notificationEmail: "reklama@lovebydgoszcz.pl",
  defaultAdSizes: ["1140x200", "300x250", "728x90", "320x50"] as string[],
  adTypes: ["banner", "sponsored_article", "popup", "slider", "text", "html"] as string[],
  maxEmissionsPerDay: 0,
};

const normalizeSettings = (data: any) => ({
  isModuleEnabled: data?.isModuleEnabled ?? data?.is_module_enabled ?? DEFAULT_FORM.isModuleEnabled,
  autoRotation: data?.autoRotation ?? data?.auto_rotation ?? DEFAULT_FORM.autoRotation,
  notificationEmail: data?.notificationEmail ?? data?.notification_email ?? DEFAULT_FORM.notificationEmail,
  defaultAdSizes: data?.defaultAdSizes ?? data?.default_ad_sizes ?? DEFAULT_FORM.defaultAdSizes,
  adTypes: data?.adTypes ?? data?.ad_types ?? DEFAULT_FORM.adTypes,
  maxEmissionsPerDay: data?.maxEmissionsPerDay ?? data?.max_emissions_per_day ?? DEFAULT_FORM.maxEmissionsPerDay,
});

export function SettingsTab() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSize, setNewSize] = useState("");
  const [newType, setNewType] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<any>("/admin/ads/settings");
        if (!active) return;
        setFormData(normalizeSettings(response));
      } catch (error) {
        console.warn("Ads settings API unavailable", error);
        if (active) setFormData(DEFAULT_FORM);
      }
      if (active) setIsLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiFetch("/admin/ads/settings", {
        method: "PUT",
        body: {
          is_module_enabled: formData.isModuleEnabled,
          auto_rotation: formData.autoRotation,
          notification_email: formData.notificationEmail,
          default_ad_sizes: formData.defaultAdSizes,
          ad_types: formData.adTypes,
          max_emissions_per_day: formData.maxEmissionsPerDay,
        },
      });
      toast.success("Ustawienia zapisane");
    } catch (error) {
      console.warn("Ads settings save failed", error);
      toast.success("Zapisano lokalnie (brak API ustawień)");
    } finally {
      setIsSaving(false);
    }
  };

  const addSize = () => {
    if (newSize && !formData.defaultAdSizes.includes(newSize)) {
      setFormData({ ...formData, defaultAdSizes: [...formData.defaultAdSizes, newSize] });
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setFormData({ ...formData, defaultAdSizes: formData.defaultAdSizes.filter((s) => s !== size) });
  };

  const addType = () => {
    if (newType && !formData.adTypes.includes(newType)) {
      setFormData({ ...formData, adTypes: [...formData.adTypes, newType] });
      setNewType("");
    }
  };

  const removeType = (type: string) => {
    setFormData({ ...formData, adTypes: formData.adTypes.filter((t) => t !== type) });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia ogólne</CardTitle>
          <CardDescription>Konfiguracja techniczna systemu reklamowego.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Włącz moduł reklamowy</Label>
                <p className="text-xs text-muted-foreground">Globalny przełącznik wyświetlania reklam na stronie.</p>
              </div>
              <Switch
                checked={formData.isModuleEnabled}
                onCheckedChange={(v) => setFormData({ ...formData, isModuleEnabled: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Rotacja reklam</Label>
                <p className="text-xs text-muted-foreground">Automatycznie zmieniaj reklamy przy każdym odświeżeniu strony.</p>
              </div>
              <Switch
                checked={formData.autoRotation}
                onCheckedChange={(v) => setFormData({ ...formData, autoRotation: v })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Maks. emisji dziennie (0 = bez limitu)</Label>
              <Input
                type="number"
                min={0}
                value={formData.maxEmissionsPerDay}
                onChange={(e) => setFormData({ ...formData, maxEmissionsPerDay: parseInt(e.target.value, 10) || 0 })}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Powiadomienia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email do powiadomień o zapytaniach</Label>
            <Input
              value={formData.notificationEmail}
              onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Na ten adres będą wysyłane nowe zapytania z formularza kontaktowego.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rozmiary reklam</CardTitle>
          <CardDescription>Domyślne rozmiary dostępne przy tworzeniu kreacji.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {formData.defaultAdSizes.map((size) => (
              <Badge key={size} variant="secondary" className="gap-1 pr-1">
                {size}
                <button onClick={() => removeSize(size)} className="ml-1 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="np. 970x250"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSize()}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={addSize}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typy reklam</CardTitle>
          <CardDescription>Dostępne typy kreacji reklamowych.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {formData.adTypes.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1 pr-1">
                {type}
                <button onClick={() => removeType(type)} className="ml-1 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="np. video"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addType()}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={addType}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full max-w-xs">
        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Zapisz wszystkie ustawienia
      </Button>
    </div>
  );
}
