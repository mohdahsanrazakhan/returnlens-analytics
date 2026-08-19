"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = React.useState("demo@returnlens.com");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      // NextAuth v5 credentials errors surface as res.error === "CredentialsSignin"
      if (res?.error) {
        setError(t("login.invalid"));
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("login.error"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-primary">
          {t("login.email")}
        </label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-primary">
          {t("login.password")}
        </label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={200}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" variant="cta" disabled={loading} className="mt-2">
        {loading ? t("login.signingIn") : t("login.signIn")}
      </Button>
    </form>
  );
}
