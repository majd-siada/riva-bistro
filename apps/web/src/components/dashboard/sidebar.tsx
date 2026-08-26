"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  Warehouse,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Översikt", icon: LayoutDashboard },
  { href: "/admin/ordrar", label: "Ordrar", icon: ShoppingCart },
  { href: "/admin/produkter", label: "Produkter", icon: Package },
  { href: "/admin/kategorier", label: "Kategorier", icon: Tags },
  { href: "/admin/lager", label: "Lager", icon: Warehouse },
  { href: "/admin/kunder", label: "Kunder", icon: Users },
  { href: "/admin/forsaljning", label: "Försäljning", icon: BarChart3 },
  { href: "/admin/installningar", label: "Inställningar", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-riva-ivory/10 bg-riva-charcoal-deep lg:block">
      <div className="sticky top-0 p-6">
        <Link href="/admin" className="font-display text-lg tracking-wide text-riva-ivory">
          RIVA Admin
        </Link>
        <nav className="mt-8 space-y-1" aria-label="Dashboard">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-riva",
                  active
                    ? "bg-riva-teal/15 text-riva-teal"
                    : "text-riva-mist hover:bg-riva-ivory/5 hover:text-riva-ivory",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex border-t border-riva-ivory/10 bg-riva-charcoal-deep lg:hidden"
      aria-label="Dashboard mobil"
    >
      {navItems.slice(0, 5).map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px]",
              active ? "text-riva-teal" : "text-riva-mist",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
