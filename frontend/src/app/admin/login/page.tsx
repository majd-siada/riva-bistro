"use client";

import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin(username, password);
      // Full navigation so the admin shell re-mounts and re-checks the session
      // (avoids a stale "not authenticated" bounce right after login).
      window.location.assign("/admin");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Något gick fel. Försök igen.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 rounded-lg border border-riva-ink/10 bg-riva-ivory p-8 shadow-subtle">
          <h1 className="font-display text-2xl text-riva-ink">Logga in</h1>
          <p className="mt-1 text-sm text-riva-taupe">Administration för Riva Bistro.</p>
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="username">Användarnamn</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {error && (
              <p className="text-sm text-riva-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" loading={submitting} className="w-full">
              Logga in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
