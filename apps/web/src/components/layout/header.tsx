"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Hem" },
  { href: "/meny", label: "Meny" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/privata-event", label: "Privat event" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-riva-cream/10 bg-riva-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" aria-label="Riva Bistro — startsida" className="shrink-0">
          <Logo showDivider={false} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Huvudnavigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative text-sm tracking-wide text-riva-muted transition-riva hover:text-riva-cream",
                isActive(item.href) && "text-riva-gold",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-riva-gold transition-transform duration-normal ease-out",
                  isActive(item.href) && "scale-x-100",
                )}
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden items-center gap-1 text-xs uppercase tracking-[0.2em] text-riva-muted lg:flex"
            aria-label="Språk: Svenska"
          >
            SV
            <ChevronDown className="h-3 w-3 text-riva-gold" strokeWidth={1.25} />
          </button>
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link href="/boka">Boka bord</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Öppna meny">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col border-riva-cream/10 bg-riva-surface">
              <SheetHeader>
                <SheetTitle>
                  <Logo showDivider={false} />
                </SheetTitle>
                <SheetDescription className="sr-only">Navigering på Riva Bistro</SheetDescription>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Mobilnavigation">
                {[...navItems, { href: "/boka", label: "Boka bord" }].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-3 text-lg transition-riva",
                      isActive(item.href)
                        ? "text-riva-gold"
                        : "text-riva-cream hover:bg-riva-card",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
