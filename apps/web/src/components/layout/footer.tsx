import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { business, fullAddress } from "@/config/business";
import { fetchHours, type OpeningHour } from "@/lib/api";

function fmt(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5);
}

async function getHours(): Promise<OpeningHour[]> {
  try {
    return await fetchHours();
  } catch {
    return [];
  }
}

export async function Footer() {
  const hours = await getHours();

  return (
    <footer className="riva-dark">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:px-8">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-dark-muted">
            Svensk gastronomi med mediterran själ — en kväll vid vattnet i hjärtat
            av {business.city}.
          </p>
        </div>

        <nav aria-label="Sidfotsnavigation">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-riva-gold-soft">
            Utforska
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-on-dark-muted">
            {[
              { href: "/meny", label: "Meny" },
              { href: "/om-oss", label: "Om Riva" },
              { href: "/privata-event", label: "Privata event" },
              { href: "/boka", label: "Boka bord" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-riva hover:text-on-dark">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-riva-gold-soft">
            Besök oss
          </h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-on-dark-muted">
            <p>{fullAddress()}</p>
            <p>
              <a href={business.phoneHref} className="transition-riva hover:text-on-dark">
                {business.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${business.email}`}
                className="transition-riva hover:text-on-dark"
              >
                {business.email}
              </a>
            </p>
            <p>
              <Link href="/kontakt" className="transition-riva hover:text-on-dark">
                Kontakt &amp; vägbeskrivning
              </Link>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-riva-gold-soft">
            Öppettider
          </h2>
          {hours.length > 0 ? (
            <ul className="mt-4 space-y-1.5 text-sm text-on-dark-muted">
              {hours.map((h) => (
                <li key={h.weekday} className="flex justify-between gap-4">
                  <span>{h.weekday_label}</span>
                  <span className="tabular-nums">
                    {h.is_closed || !h.opens_at ? "Stängt" : `${fmt(h.opens_at)}–${fmt(h.closes_at)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-on-dark-muted">
              Öppettider uppdateras inom kort.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-on-dark/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-on-dark-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Riva Bistro</p>
          <p>Svensk gastronomi i en stillsam, cinematisk miljö.</p>
        </div>
      </div>
    </footer>
  );
}
