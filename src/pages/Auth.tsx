import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertCircle, ArrowLeft, ArrowRight, KeyRound, Loader2, LockKeyhole, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface AuthProps {
  redirectAfterAuth?: string;
}

const LOGIN_BACKGROUND_URL = "/assets/auth-background.png";
const primaryButtonClass = "h-12 rounded-[1rem] border-0 bg-[linear-gradient(135deg,#fbbf24,#f97316)] px-5 text-sm font-black text-slate-950 shadow-[0_20px_45px_-18px_rgba(249,115,22,0.82)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105";
const secondaryButtonClass = "h-12 rounded-[1rem] border border-white/14 bg-white/8 px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/14";
const inputClass = "h-14 rounded-[1.1rem] border border-white/14 bg-black/24 pl-12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/38 focus-visible:border-amber-300/40 focus-visible:bg-black/30 focus-visible:ring-2 focus-visible:ring-amber-300/18";

function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(4,6,12,0.55),rgba(6,10,20,0.38)_34%,rgba(7,10,18,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,158,11,0.2),transparent_22%),radial-gradient(circle_at_80%_16%,rgba(239,68,68,0.12),transparent_24%),radial-gradient(circle_at_50%_82%,rgba(56,189,248,0.1),transparent_28%)]" />
      <div className="absolute inset-0 backdrop-brightness-[0.92]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[29rem]">{children}</div>
      </div>
    </div>
  );
}

function LoginPanel({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-white/14 bg-[linear-gradient(180deg,rgba(9,14,24,0.72),rgba(13,19,33,0.56))] text-white shadow-[0_30px_90px_-34px_rgba(0,0,0,0.9)] backdrop-blur-[22px]">
      <CardHeader className="relative space-y-5 border-b border-white/10 px-6 pb-5 pt-6 sm:px-7">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
        <div className="flex items-center justify-center">
          <div className="rounded-[1.75rem] border border-white/14 bg-black/18 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <img
              src="/logo-love-bydgoszcz.png"
              alt="Love Bydgoszcz"
              className="h-16 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:h-20"
            />
          </div>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-amber-300/24 bg-amber-400/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-amber-100">
          {eyebrow}
        </div>
        <div className="text-center">
          <CardTitle className="text-3xl font-black tracking-[-0.04em] text-white">
            {title}
          </CardTitle>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-white/62">{description}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-6 py-6 sm:px-7">{children}</CardContent>
    </Card>
  );
}

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return <div className="mt-3 h-[22px]" aria-hidden="true" />;

  return (
    <div className="mt-3 flex items-start gap-3 rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
      <div>
        <p className="font-semibold">Nieudana próba logowania, popraw dane i zaloguj się ponownie.</p>
      </div>
    </div>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<"identifier" | "password">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = searchParams.get("redirect") || redirectAfterAuth || "/";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTarget]);

  const handleIdentifierSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const nextIdentifier = identifier.trim();
    if (!nextIdentifier) {
      setError("Podaj email użytkownika");
      return;
    }
    setIdentifier(nextIdentifier);
    setPassword("");
    setStep("password");
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn({ email: identifier.trim(), password });
      await new Promise((resolve) => setTimeout(resolve, 250));
      navigate(redirectTarget, { replace: true });
    } catch (_submitError) {
      setError("Nieudana próba logowania, popraw dane i zaloguj się ponownie.");
      setIsLoading(false);
    }
  };

  const eyebrow = step === "password" ? "Hasło" : "Logowanie";
  const title = step === "password" ? "Podaj hasło" : "Zaloguj się";
  const description = step === "password" ? identifier : "Wpisz email użytkownika.";

  return (
    <LoginLayout>
      {step === "identifier" ? (
        <LoginPanel eyebrow={eyebrow} title={title} description={description}>
          <form onSubmit={handleIdentifierSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <UserRound className="absolute left-4 top-4 h-4 w-4 text-white/42" />
                <Input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Email użytkownika"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  className={inputClass}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-black/18 px-4 py-3 text-sm text-white/72">
                Login działa po adresie email.
              </div>
              <Button type="submit" disabled={isLoading} className={`w-full ${primaryButtonClass}`}>
                <Loader2 className={`mr-2 h-4 w-4 animate-spin ${isLoading ? "inline-block" : "hidden"}`} />
                <span className={isLoading ? "hidden" : "inline-block"}>Przejdź dalej</span>
                <span className={isLoading ? "inline-block" : "hidden"}>Przetwarzanie...</span>
                <ArrowRight className={`ml-2 h-4 w-4 ${!isLoading ? "inline-block" : "hidden"}`} />
              </Button>
            </div>
            <ErrorMessage message={error} />
          </form>
        </LoginPanel>
      ) : (
        <LoginPanel eyebrow={eyebrow} title={title} description={description}>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <Input
                value={identifier}
                disabled
                className="h-12 rounded-[1rem] border border-white/10 bg-white/[0.04] text-white/66"
              />
              <div className="relative">
                <KeyRound className="absolute left-4 top-4 h-4 w-4 text-white/42" />
                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Hasło"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-black/18 px-4 py-3 text-sm text-white/72">
                <div className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-amber-200" />
                  <span>Hasło jest sprawdzane na serwerze.</span>
                </div>
              </div>
            </div>
            <ErrorMessage message={error} />
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setError(null);
                  setStep("identifier");
                }}
                disabled={isLoading}
                className={`flex-1 ${secondaryButtonClass}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wstecz
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${primaryButtonClass}`}
                disabled={isLoading || password.length === 0}
              >
                <Loader2 className={`mr-2 h-4 w-4 animate-spin ${isLoading ? "inline-block" : "hidden"}`} />
                <span className={isLoading ? "hidden" : "inline-block"}>Zaloguj</span>
                <span className={isLoading ? "inline-block" : "hidden"}>Logowanie...</span>
                <ArrowRight className={`ml-2 h-4 w-4 ${!isLoading ? "inline-block" : "hidden"}`} />
              </Button>
            </div>
          </form>
        </LoginPanel>
      )}
    </LoginLayout>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
