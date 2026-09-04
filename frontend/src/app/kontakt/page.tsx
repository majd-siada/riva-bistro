import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";

import { FAQ } from "@/components/brand/faq";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { ContactForm } from "@/components/features/contact";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { business, fullAddress } from "@/config/business";
import { formatDayHours } from "@/lib/hours";
import { loadHours } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakta Riva Bistro — adress, öppettider, karta och meddelandeformulär.",
};

const FAQ_ITEMS = [
  {
    question: "Hur bokar jag bord?",
    answer:
      "Använd vår bokningssida för att välja datum, tid och antal gäster. Du får en direkt bekräftelse med bokningsnummer.",
  },
  {
    question: "Kan jag boka för större sällskap?",
    answer:
      "Ja — för grupper större än tolv personer rekommenderar vi att ni kontaktar oss via formuläret eller telefon så vi kan anpassa upplägget.",
  },
  {
    question: "Erbjuder ni vegetariska alternativ?",
    answer:
      "Absolut. Menyn innehåller flera vegetariska rätter och vår kock kan ofta anpassa rätter efter önskemål — meddela gärna vid bokning.",
  },
  {
    question: "Var finns ni?",
    answer: `Vi finns på ${fullAddress()}, nära Strandvägen i Stockholm. Använd kartan nedan för vägbeskrivning.`,
  },
];

export default async function ContactPage() {
  const hours = await loadHours();

  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="riva-label">Hör av dig</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">Kontakt</h1>
            <p className="mt-4 max-w-md text-riva-muted">
              Frågor, feedback eller specialönskemål — vi svarar så snart vi kan.
            </p>
          </div>
          <RestaurantImage
            src="/scenes/contact-interior.jpg"
            alt="Baren och interiör på Riva Bistro — varm belysning"
            aspectRatio="wide"
            priority
          />
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="riva-label">Besök oss</h2>
              <p className="mt-3 flex items-start gap-2 text-lg text-riva-cream">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-riva-gold" strokeWidth={1.25} />
                {fullAddress()}
              </p>
            </div>
            <div>
              <h2 className="riva-label">Kontakt</h2>
              <p className="mt-3">
                <a
                  href={business.phoneHref}
                  className="inline-flex items-center gap-2 text-riva-cream hover:text-riva-gold"
                >
                  <Phone className="h-4 w-4 text-riva-gold" strokeWidth={1.25} />
                  {business.phone}
                </a>
              </p>
              <p className="mt-2">
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-2 text-riva-cream hover:text-riva-gold"
                >
                  <Mail className="h-4 w-4 text-riva-gold" strokeWidth={1.25} />
                  {business.email}
                </a>
              </p>
            </div>
            <div>
              <h2 className="riva-label">Öppettider</h2>
              {hours.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-riva-muted">
                  {hours.map((h) => (
                    <li key={h.weekday} className="flex justify-between gap-4">
                      <span>{h.weekday_label}</span>
                      <span className="tabular-nums">{formatDayHours(h)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-riva-muted">{business.restaurantHoursLabel}</p>
              )}
              <p className="mt-1 text-sm text-riva-muted/80">{business.kitchenHours}</p>
            </div>
            <div>
              <h2 className="riva-label">Följ oss</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {business.social.instagram && (
                  <Button asChild variant="outline" size="sm">
                    <a href={business.social.instagram} target="_blank" rel="noopener noreferrer">
                      <Share2 className="mr-2 h-4 w-4" strokeWidth={1.25} />
                      Instagram
                    </a>
                  </Button>
                )}
                {business.social.facebook && (
                  <Button asChild variant="outline" size="sm">
                    <a href={business.social.facebook} target="_blank" rel="noopener noreferrer">
                      <Share2 className="mr-2 h-4 w-4" strokeWidth={1.25} />
                      Facebook
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>

      <Section className="bg-riva-surface/40">
        <SectionHeading title="Hitta hit" align="center" className="mx-auto" />
        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-lg border border-riva-cream/10">
          <iframe
            title="Karta till Riva Bistro på Strandvägen 5, Stockholm"
            src="https://maps.google.com/maps?q=Strandv%C3%A4gen+5+114+51+Stockholm&output=embed"
            className="aspect-[16/9] w-full border-0 bg-riva-card"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-4 text-center">
          <Button asChild variant="link">
            <Link href={business.mapUrl} target="_blank" rel="noopener noreferrer">
              Öppna i Google Maps
            </Link>
          </Button>
        </p>
      </Section>

      <Section>
        <SectionHeading title="Vanliga frågor" align="center" className="mx-auto" />
        <FAQ items={FAQ_ITEMS} className="mx-auto mt-8 max-w-3xl" />
      </Section>
    </>
  );
}
