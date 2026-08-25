import Link from "next/link";

const navItems = [
  { href: "/", label: "Hem" },
  { href: "/meny", label: "Meny" },
  { href: "/galleri", label: "Galleri" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.18em] text-riva-ivory"
          aria-label="Riva Bistro — startsida"
        >
          RIVA
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Huvudnavigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-riva-ivory/80 transition-colors hover:text-riva-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/boka"
            className="border border-riva-gold/70 px-4 py-2 text-sm tracking-wide text-riva-gold transition-colors hover:bg-riva-gold hover:text-riva-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold"
          >
            Boka bord
          </Link>
        </nav>
      </div>
    </header>
  );
}
