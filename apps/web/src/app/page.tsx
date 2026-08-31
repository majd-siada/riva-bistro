import Link from "next/link";

import { InfoFeature } from "@/components/brand/info-feature";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { FeaturedDish } from "@/components/commerce/featured-dish";
import { FoodCard } from "@/components/commerce/food-card";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { fetchFeatured, type Product } from "@/lib/api";
import { Clock, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";

const HERO_SLIDES = [
  { id: "01", title: "Säsongens råvaror" },
  { id: "02", title: "Cinematisk miljö" },
  { id: "03", title: "Varmt värdskap" },
];

export default async function HomePage() {
  let featured: Product[] = [];
  try {
    featured = await fetchFeatured();
  } catch {
    featured = [];
  }

  const spread = featured.slice(0, 2);

  return (
    <>
      <Hero />
      <InfoStrip />
      <AboutSplit />
      {spread.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Från köket" title="Säsongens favoriter" align="center" />
          <div className="reveal mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <FoodCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}
      {spread.length >= 2 && (
        <Section className="bg-riva-surface/50">
          <FeaturedDish product={spread[0]} />
        </Section>
      )}
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-riva-black">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
        <div className="reveal order-2 md:order-1">
          <p className="riva-label">Stockholm · {business.tagline}</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-riva-cream md:text-6xl lg:text-7xl">
            Goda smaker, äkta upplevelser
          </h1>
          <p className="mt-6 max-w-md text-pretty leading-relaxed text-riva-muted">
            Svensk gastronomi i en stillsam, cinematisk miljö vid Strandvägen. Vi dukar
            för långa middagar och minnesvärda kvällar.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/meny">Se vår meny</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/boka">Boka bord</Link>
            </Button>
          </div>
          <ol className="mt-12 flex gap-6" aria-label="Höjdpunkter">
            {HERO_SLIDES.map((s) => (
              <li key={s.id} className="text-xs uppercase tracking-[0.2em] text-riva-muted">
                <span className="text-riva-gold">{s.id}</span>
                <span className="mt-1 block normal-case tracking-normal text-riva-cream/80">
                  {s.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="reveal order-1 md:order-2">
          <RestaurantImage
            src="/scenes/hero-food.jpg"
            alt="Grillad entrecôte på mörk tallrik med varm studioljus — Riva Bistro"
            aspectRatio="hero"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}

function InfoStrip() {
  const items = [
    {
      icon: UtensilsCrossed,
      label: "Mat",
      text: "Säsongens råvaror tillagade med respekt och ett mediterrant sinne.",
    },
    {
      icon: Sparkles,
      label: "Atmosfär",
      text: "Dämpat ljus, varma toner och en känsla av att tiden får sakta ner.",
    },
    {
      icon: Clock,
      label: "Öppettider",
      text: business.restaurantHoursLabel,
    },
    {
      icon: MapPin,
      label: "Plats",
      text: `${business.address.street}, ${business.address.city}`,
    },
  ];

  return (
    <Section className="border-y border-riva-cream/10 bg-riva-surface py-12 md:py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <InfoFeature key={item.label} {...item} className="reveal" />
        ))}
      </div>
    </Section>
  );
}

function AboutSplit() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <RestaurantImage
          src="/scenes/home-interior.jpg"
          alt="Interiör på Riva Bistro — mörk elegant matsal med varm belysning"
          aspectRatio="wide"
          className="reveal"
        />
        <div className="reveal">
          <SectionHeading
            eyebrow="Om Riva"
            title="En bistro där råvaran får tala"
            description="Vi lagar mat med omsorg och serverar den utan krångel. Skandinavisk enkelhet möter mediterran värme — i en miljö som är lika bekväm för en vardagsmiddag som för det stora firandet."
          />
          <Button asChild variant="outline" className="mt-8">
            <Link href="/om-oss">Läs mer om oss</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
