import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const result = await subscribe({ email });
      if (result.success) {
        setSubscribed(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
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