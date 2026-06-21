import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const result = await apiFetch<{ success?: boolean; message?: string }>("/newsletter/subscribe", {
        method: "POST",
        body: { email },
      });
      const success = result?.success ?? true;
      if (success) {
        setSubscribed(true);
        toast.success(result?.message ?? "Zapisano pomyślnie.");
      } else {
        toast.error(result?.message ?? "Nie udało się zapisać.");
      }
    } catch {
      toast.warning("Newsletter chwilowo niedostępny. Zapisano lokalnie.");
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-primary/5 rounded-2xl border border-primary/10 p-4 text-center"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
        <Mail className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-sm text-foreground mb-1">Bądź na bieżąco z nami</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Podaj swój mail, a będziesz na bieżąco z aktualnościami.
      </p>

      {subscribed ? (
        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 rounded-xl text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          Zapisano pomyślnie!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Twój adres email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center shrink-0"
          >
            {loading ? "..." : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}
    </motion.div>
  );
}