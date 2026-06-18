import { useId, useRef } from "react";
import { ImagePlus, Link2, Loader2, User } from "lucide-react";

interface ProfileImageFieldProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  shape?: "avatar" | "cover";
}

export default function ProfileImageField({
  label,
  value,
  onChange,
  onUpload,
  uploading = false,
  shape = "avatar",
}: ProfileImageFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isAvatar = shape === "avatar";

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">Możesz wkleić link albo przesłać plik bezpośrednio z komputera.</p>
        </div>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await onUpload(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Wysyłanie..." : "Prześlij plik"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto,1fr] lg:items-center">
        <div
          className={`overflow-hidden border border-slate-200 bg-white shadow-sm ${
            isAvatar ? "h-28 w-28 rounded-full" : "h-28 w-full rounded-[1.5rem] lg:w-52"
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
              {isAvatar ? <User className="h-8 w-8" /> : <ImagePlus className="h-8 w-8" />}
            </div>
          )}
        </div>

        <div>
          <label htmlFor={`${inputId}-url`} className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Link2 className="h-4 w-4 text-slate-400" />
            Link do obrazu
          </label>
          <input
            id={`${inputId}-url`}
            type="text"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}
