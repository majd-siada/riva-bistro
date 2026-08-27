import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/layout/section";
import { business, fullAddress } from "@/config/business";
import { fetchHours, type OpeningHour } from "@/lib/api";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakta Riva Bistro — adress, öppettider och meddelandeformulär i Stockholm.",
};

export default async function ContactPage() {
  let hours: OpeningHour[] = [];
  try {
    hours = await fetchHours();
  } catch {
    hours = [];
  }

  return (
    <Section className="pt-16 md:pt-20">
      <header className="max-w-2xl">
        <p className="riva-label">Hör av dig</p>
        <h1 className="mt-3 font-display text-5xl text-riva-ink md:text-6xl">Kontakt</h1>
        <WaveDivider className="mt-6 max-w-[200px]" />
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div>
            <h2 className="riva-label">Besök oss</h2>
            <p className="mt-3 text-lg text-riva-ink">{fullAddress()}</p>
          </div>
          <div>
            <h2 className="riva-label">Kontakt</h2>
            <p className="mt-3 text-riva-ink">
              <a href={business.phoneHref} className="hover:text-riva-teal">
                {business.phone}
              </a>
            </p>
            <p className="text-riva-ink">
              <a href={`mailto:${business.email}`} className="hover:text-riva-teal">
                {business.email}
              </a>
            </p>
          </div>
          <div>
            <h2 className="riva-label">Öppettider</h2>
            {hours.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-sm text-riva-ink-soft">
                {hours.map((h) => (
                  <li key={h.weekday} className="flex justify-between gap-4 max-w-xs">
                    <span>{h.weekday_label}</span>
                    <span className="tabular-nums">
                      {h.is_closed || !h.opens_at
                        ? "Stängt"
                        : `${h.opens_at.slice(0, 5)}–${h.closes_at?.slice(0, 5)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-riva-taupe">Öppettider uppdateras inom kort.</p>
            )}
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
