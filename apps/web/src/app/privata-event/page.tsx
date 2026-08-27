import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { EventInquiryForm } from "@/components/event-inquiry-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Privata event",
  description:
    "Företagsmiddagar, möten, firanden och slutna sällskap på Riva Bistro. Skicka en förfrågan så formar vi kvällen tillsammans.",
};

const categories = [
  {
    title: "Företag & möten",
    body: "Affärsluncher, kundmiddagar och mötesdagar i en avslappnad miljö.",
  },
  {
    title: "Firanden",
    body: "Födelsedagar, jubileer och märkesdagar värda att minnas.",
  },
  {
    title: "Slutna sällskap",
    body: "Hela eller delar av restaurangen för er och era gäster.",
  },
];

export default function PrivateEventsPage() {
  return (
    <>
      <section className="riva-dark relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(198,165,106,0.2),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
          <p className="riva-label text-riva-gold-soft">Er tillställning, vår plats</p>
          <h1 className="mt-4 font-display text-5xl text-on-dark md:text-6xl">
            Privata event på Riva
          </h1>
          <WaveDivider className="mx-auto mt-6 max-w-[200px]" variant="gold" />
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-on-dark-muted">
            Föreställ dig kvällen: dukade bord, dämpat ljus och mat som får
            samtalet att flöda. Berätta om ert tillfälle så tar vi hand om resten.
          </p>
        </div>
      </section>

      <Section>
        <div className="reveal grid gap-10 md:grid-cols-3 md:gap-14">
          {categories.map((c) => (
            <div key={c.title}>
              <h2 className="font-display text-2xl text-riva-ink">{c.title}</h2>
              <WaveDivider className="mt-3 max-w-[80px]" variant="gold" />
              <p className="mt-4 leading-relaxed text-riva-ink-soft">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-riva-cream-2">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="reveal">
            <p className="riva-label">Skicka en förfrågan</p>
            <h2 className="mt-3 font-display text-4xl text-riva-ink">
              Låt oss forma er kväll
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-riva-ink-soft">
              Fyll i formuläret så återkommer vi med förslag på upplägg. Ju mer du
              berättar, desto bättre kan vi anpassa kvällen efter era önskemål.
            </p>
          </div>
          <div className="reveal">
            <EventInquiryForm />
          </div>
        </div>
      </Section>
    </>
  );
}
