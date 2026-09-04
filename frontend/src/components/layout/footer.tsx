import Link from "next/link";

import { GoldDivider } from "@/components/brand/gold-divider";
import { Logo } from "@/components/brand/logo";
import { business, fullAddress } from "@/config/business";
import { loadHours } from "@/lib/public-data";
import { formatDayHours } from "@/lib/hours";

export async function Footer() {
  const hours = await loadHours();

  return (
    <footer className="border-t border-riva-cream/10 bg-riva-black">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-riva-muted">
            {business.tagline}. Svensk gastronomi i en stillsam, cinematisk miljö vid
            Strandvägen.
          </p>
          <GoldDivider className="mt-6 max-w-[80px] opacity-40" variant="short" />
        </div>

        <nav aria-label="Sidfotsnavigation">
          <h2 className="riva-label">Utforska</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-riva-muted">
            {[
              { href: "/meny", label: "Meny" },
              { href: "/om-oss", label: "Om oss" },
              { href: "/galleri", label: "Galleri" },
              { href: "/privata-event", label: "Privat event" },
              { href: "/boka", label: "Boka bord" },
              { href: "/kontakt", label: "Kontakt" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-riva hover:text-riva-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="riva-label">Besök oss</h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-riva-muted">
            <p>{fullAddress()}</p>
            <p>
              <a href={business.phoneHref} className="transition-riva hover:text-riva-cream">
                {business.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${business.email}`}
                className="transition-riva hover:text-riva-cream"
              >
                {business.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="riva-label">Öppettider</h2>
          {hours.length > 0 ? (
            <ul className="mt-4 space-y-1.5 text-sm text-riva-muted">
              {hours.map((h) => (
                <li key={h.weekday} className="flex justify-between gap-4">
                  <span>{h.weekday_label}</span>
                  <span className="tabular-nums">{formatDayHours(h)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-riva-muted">{business.restaurantHoursLabel}</p>
          )}
          <p className="mt-4 text-xs text-riva-muted/80">{business.kitchenHours}</p>
        </div>
      </div>

      <div className="border-t border-riva-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-riva-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Riva Bistro</p>
          <p>Strandvägen · Stockholm</p>
        </div>
      </div>
    </footer>
  );
}
