"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { adminLogout, adminMe, type AdminSession } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Översikt",
    items: [
      { href: "/admin", label: "Översikt" },
      { href: "/admin/bokningar", label: "Bokningar" },
      { href: "/admin/forfragningar", label: "Förfrågningar" },
    ],
  },
  {
    label: "Innehåll",
    items: [
      { href: "/admin/meny", label: "Meny" },
      { href: "/admin/startsida", label: "Startsida" },
      { href: "/admin/restaurang", label: "Restaurang" },
      { href: "/admin/galleri", label: "Galleri" },
      { href: "/admin/nyheter", label: "Nyheter" },
      { href: "/admin/erbjudanden", label: "Erbjudanden" },
    ],
  },
  {
    label: "Drift",
    items: [
      { href: "/admin/oppettider", label: "Öppettider" },
      { href: "/admin/installningar", label: "Inställningar" },
    ],
  },
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
    return <div className="min-h-screen bg-riva-black">{children}</div>;
  }

  if (session === null || !session.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-riva-black text-riva-muted">
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
    // Full navigation so the shell re-mounts with a fresh (signed-out) session.
    window.location.assign("/admin/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-riva-black">
      <header className="border-b border-riva-cream/10 bg-riva-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} size={32} />
            <span className="font-display text-lg text-riva-cream">Riva Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-riva-muted sm:inline">
              {session.username}
            </span>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" /> Logga ut
            </Button>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-7xl items-end gap-4 overflow-x-auto px-3 md:gap-6 md:px-6"
          aria-label="Adminnavigering"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex shrink-0 flex-col gap-1">
              <span className="px-4 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-riva-muted/80">
                {group.label}
              </span>
              <div className="flex gap-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap border-b-2 px-4 py-2 text-sm transition-riva",
                      isActive(item.href)
                        ? "border-riva-gold text-riva-cream"
                        : "border-transparent text-riva-muted hover:text-riva-cream",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
