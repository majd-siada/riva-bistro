import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";

import { FAQ } from "@/components/brand/faq";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { ContactForm } from "@/components/features/contact";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { formatDayHours } from "@/lib/hours";
import { loadHours, loadRestaurantBusiness } from "@/lib/public-data";
import {
  fullAddressFrom,
  mapsEmbedUrlFrom,
  type PublicBusiness,
} from "@/lib/public-business";
import { createPageMetadata } from "@/lib/seo";
import { FaqJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = createPageMetadata({
  title: "Kontakt",
  absoluteTitle: "Kontakt & hitta hit — Hornsbergs Strand, Kungsholmen",
  description:
    "Hitta Riva Bistro på Hornsbergs Strand 57, Kungsholmen — adress, öppettider, karta och kontaktformulär.",
  path: "/kontakt",
});

function contactFaqs(business: PublicBusiness) {
  const address = fullAddressFrom(business);
  return [
    {
      question: "Hur bokar jag bord?",
      answer:
        "Använd sidan Boka bord för att välja datum, tid och antal gäster. När onlinebokning är aktiverad får du en bekräftelse med bokningsreferens. Annars når du oss via telefon eller formuläret på den här sidan.",
    },
    {
      question: "Kan jag boka för större sällskap?",
      answer:
        "För större sällskap — särskilt över tolv personer — kontakta oss via formuläret eller telefon så vi kan se vad som är möjligt det önskade datumet.",
    },
    {
      question: "Hur når jag er?",
      answer: `Ring ${business.phone}, mejla ${business.email}, eller skriv via formuläret. Adress: ${address}.`,
    },
    {
      question: "Var finns ni?",
      answer: `Vi finns på ${address} på Kungsholmen i Stockholm. Använd kartan nedan för vägbeskrivning.`,
    },
  ];
}

export default async function ContactPage() {
  const [hours, business] = await Promise.all([
    loadHours(),
    loadRestaurantBusiness(),
  ]);
  const faqItems = contactFaqs(business);
  const address = fullAddressFrom(business);

  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="riva-label">Hör av dig</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">Kontakt</h1>
            <p className="mt-4 max-w-md text-riva-muted">
              Hitta {business.name} på {business.street}, {business.area} — vid vattnet i
              Stockholm. Här finns adress, öppettider, karta och formulär.
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
                {address}
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-riva-muted">
                Vi ligger på Kungsholmen vid Hornsbergs Strand, med utsikt över vattnet
                och uteservering när vädret tillåter.
              </p>
            </div>
            <div>
              <h2 className="riva-label">Kontakt</h2>
              {business.phone ? (
                <p className="mt-3">
                  <a
                    href={business.phoneHref}
                    className="inline-flex items-center gap-2 text-riva-cream hover:text-riva-gold"
                  >
                    <Phone className="h-4 w-4 text-riva-gold" strokeWidth={1.25} />
                    {business.phone}
                  </a>
                </p>
              ) : null}
              <p className={business.phone ? "mt-2" : "mt-3"}>
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
              {business.kitchenHours ? (
                <p className="mt-1 text-sm text-riva-muted/80">{business.kitchenHours}</p>
              ) : null}
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
            title={`Karta till ${business.name} på ${business.street}, ${business.city}`}
            src={mapsEmbedUrlFrom(business)}
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
        <FAQ items={faqItems} className="mx-auto mt-8 max-w-3xl" />
      </Section>
      <FaqJsonLd items={faqItems} />
    </>
  );
}
