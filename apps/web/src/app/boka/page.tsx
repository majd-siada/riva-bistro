import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { ReservationForm } from "@/components/commerce/reservation-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Boka bord",
  description:
    "Boka bord på Riva Bistro — premium svensk gastronomi vid vattnet i Stockholm. Välj datum, tid och antal gäster.",
};

export default function BookingPage() {
  return (
    <Section className="pt-24">
      <p className="riva-label">Boka bord</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">
        Reservera ert bord
      </h1>
      <WaveDivider className="mt-6 max-w-xs" />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="space-y-6 text-riva-mist">
          <p className="max-w-md text-balance leading-relaxed">
            En kväll vid vattnet börjar här. Välj datum, tid och sällskap så
            dukar vi upp för er — från intim middag till festligt firande.
          </p>
          <dl className="space-y-4 border-t border-riva-ivory/10 pt-6">
            <div>
              <dt className="riva-label">Öppettider</dt>
              <dd className="mt-1 text-riva-ivory">
                Mån–Fre 17:00–23:00 · Lör–Sön 12:00–23:00
              </dd>
            </div>
            <div>
              <dt className="riva-label">Adress</dt>
              <dd className="mt-1 text-riva-ivory">
                Strandvägen 12, 114 56 Stockholm
              </dd>
            </div>
            <div>
              <dt className="riva-label">Större sällskap</dt>
              <dd className="mt-1 text-riva-ivory">
                För grupper och evenemang, ring +46 8 123 45 67.
              </dd>
            </div>
          </dl>
        </div>

        <ReservationForm />
      </div>
    </Section>
  );
}
