import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { ReservationForm } from "@/components/commerce/reservation-form";
import { Section } from "@/components/layout/section";
import { business } from "@/config/business";
import { fetchHours, type OpeningHour } from "@/lib/api";

export const metadata: Metadata = {
  title: "Boka bord",
  description:
    "Boka bord på Riva Bistro. Välj datum, tid och antal gäster — du får en direkt bekräftelse.",
};

export default async function BookingPage() {
  let hours: OpeningHour[] = [];
  try {
    hours = await fetchHours();
  } catch {
    hours = [];
  }

  return (
    <Section className="pt-16 md:pt-20">
      <header className="max-w-2xl">
        <p className="riva-label">Boka bord</p>
        <h1 className="mt-3 font-display text-5xl text-riva-ink md:text-6xl">
          Reservera ert bord
        </h1>
        <WaveDivider className="mt-6 max-w-[200px]" />
        <p className="mt-5 text-riva-ink-soft">
          Välj dag, tid och sällskap. Vi bekräftar direkt — inget konto krävs.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <ReservationForm />

        <aside className="space-y-8 lg:pt-2">
          <div>
            <h2 className="riva-label">Öppettider</h2>
            {hours.length > 0 ? (
              <ul className="mt-4 space-y-1.5 text-sm text-riva-ink-soft">
                {hours.map((h) => (
                  <li key={h.weekday} className="flex justify-between gap-4">
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
              <p className="mt-4 text-sm text-riva-taupe">Öppettider uppdateras inom kort.</p>
            )}
          </div>

          <div className="border-t border-riva-ink/10 pt-8">
            <h2 className="riva-label">Större sällskap</h2>
            <p className="mt-4 text-sm leading-relaxed text-riva-ink-soft">
              Planerar ni ett event eller ett större sällskap? Kontakta oss så
              hjälper vi till.
            </p>
            <a
              href={business.phoneHref}
              className="mt-3 inline-block text-sm text-riva-teal underline-offset-4 hover:underline"
            >
              {business.phone}
            </a>
          </div>
        </aside>
      </div>
    </Section>
  );
}
