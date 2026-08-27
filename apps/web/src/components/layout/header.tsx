"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

import { CartDrawer } from "@/components/commerce/cart-drawer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Hem" },
  { href: "/meny", label: "Meny" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/faq", label: "FAQ" },
] as const;

export function Header() {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-riva-ivory/5 bg-riva-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Riva Bistro — startsida">
            <Image
              src="/brand/riva-logo.svg"
              alt=""
              width={40}
              height={40}
              className="rounded-full"
              priority
              unoptimized
            />
            <span className="font-display text-xl tracking-[0.15em] text-riva-ivory md:text-2xl">
              RIVA
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Huvudnavigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-wide text-riva-ivory/80 transition-riva hover:text-riva-teal"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/konto"
              className="hidden rounded-sm p-2 text-riva-ivory/80 transition-riva hover:text-riva-teal sm:block"
              aria-label="Mitt konto"
            >
              <User className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              aria-label={`Varukorg, ${itemCount} artiklar`}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-riva-teal text-[10px] font-bold text-riva-ivory",
                    "[[data-cart-bounce=true]_&]:cart-badge-bounce",
                  )}
                >
                  {itemCount}
                </span>
              )}
            </Button>
            <Link href="/boka" className="hidden md:block">
              <Button variant="outline" size="sm">
                Boka bord
              </Button>
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Meny">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-4" aria-label="Mobilnavigation">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg text-riva-ivory hover:text-riva-teal"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link href="/konto" onClick={() => setMobileOpen(false)} className="text-lg text-riva-ivory">
                    Mitt konto
                  </Link>
                  <Link href="/boka" onClick={() => setMobileOpen(false)}>
                    <Button variant="gold" className="w-full">
                      Boka bord
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
