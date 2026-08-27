"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { adminLogout, adminMe, type AdminSession } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/bokningar", label: "Bokningar" },
  { href: "/admin/meny", label: "Meny" },
  { href: "/admin/oppettider", label: "Öppettider" },
  { href: "/admin/installningar", label: "Inställningar" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    adminMe()
      .then(setSession)
      .catch(() => setSession({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (session === null) return;
    if (!session.authenticated && !isLogin) router.replace("/admin/login");
    if (session.authenticated && isLogin) router.replace("/admin");
  }, [session, isLogin, router]);

  if (isLogin) {
    return <div className="min-h-screen bg-riva-cream">{children}</div>;
  }

  if (session === null || !session.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-riva-cream text-riva-taupe">
        Laddar…
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      /* ignore */
    }
    router.replace("/admin/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-riva-cream">
      <header className="border-b border-riva-ink/10 bg-riva-ivory">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} size={32} />
            <span className="font-display text-lg text-riva-ink">Riva Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-riva-taupe sm:inline">
              {session.username}
            </span>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" /> Logga ut
            </Button>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 md:px-6"
          aria-label="Adminnavigering"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-riva",
                isActive(item.href)
                  ? "border-riva-teal text-riva-ink"
                  : "border-transparent text-riva-taupe hover:text-riva-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
