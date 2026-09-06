import { Building2, Heart, Sparkles, Users } from "lucide-react";

import { InfoFeature } from "@/components/brand/info-feature";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { EventInquiryForm } from "@/components/features/contact";
import { Section } from "@/components/layout/section";

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privata event",
  absoluteTitle: "Privata event & företagsmiddagar — Riva Bistro",
  description:
    "Företagsmiddagar, möten, firanden och slutna sällskap på Riva Bistro, Kungsholmen. Förfrågan för privata event.",
  path: "/privata-event",
});

const WHY = [
  {
    icon: Sparkles,
    label: "Skräddarsytt",
    text: "Meny och upplägg anpassas efter ert tillfälle och era önskemål.",
  },
  {
    icon: Building2,
    label: "Flexibelt",
    text: "Hela eller delar av restaurangen — från affärslunch till galakväll.",
  },
  {
    icon: Heart,
    label: "Personligt",
    text: "Ett dedikerat team som tar hand om kvällen från första fråga till sista tack.",
  },
  {
    icon: Users,
    label: "Gemenskap",
    text: "En miljö som uppmuntrar samtal, firande och minnesvärda stunder.",
  },
];

const EVENT_TYPES = [
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
  {
    title: "Provningar",
    body: "Vin- och matprovningar i intim skala med vår kock.",
  },
];

export default function PrivateEventsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <p className="riva-label">Er tillställning, vår plats</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">
              Privata event
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-riva-muted">
              Företagsmiddagar, möten, firanden och slutna sällskap. Berätta om
              ert tillfälle så formar vi en kväll som känns som er.
            </p>
          </div>
          <RestaurantImage
            src="/scenes/private-event.jpg"
            alt="Privat middag i elegant matsal — Riva Bistro"
            aspectRatio="hero"
            priority
          />
        </div>
      </section>

      <Section>
        <SectionHeading eyebrow="Varför Riva Bistro?" title="Det här får ni" align="center" className="mx-auto" />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
            <InfoFeature key={item.label} {...item} />
          ))}
        </div>
      </Section>

      <Section className="bg-riva-surface/40">
        <SectionHeading title="Typer av event" align="center" className="mx-auto" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {EVENT_TYPES.map((e) => (
            <div key={e.title} className="riva-card p-6">
              <h3 className="font-display text-xl text-riva-cream">{e.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-riva-muted">{e.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Förfrågan"
            title="Låt oss forma er kväll"
            description="Fyll i formuläret så återkommer vi med förslag på upplägg."
          />
          <EventInquiryForm />
        </div>
      </Section>
    </>
  );
}
