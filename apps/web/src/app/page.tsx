import Link from "next/link";

import { WaveDivider } from "@/components/brand/wave-divider";
import { ProductCard } from "@/components/commerce/product-card";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { fetchFeatured, fetchHours, type OpeningHour, type Product } from "@/lib/api";

export default async function HomePage() {
  let featured: Product[] = [];
  let hours: OpeningHour[] = [];
  try {
    [featured, hours] = await Promise.all([fetchFeatured(), fetchHours()]);
  } catch {
    featured = [];
    hours = [];
  }

  return (
    <>
      <Hero />
      <Intro />
      <Featured products={featured} />
      <Experience />
      <EventsTeaser />
      <ReservationLocation hours={hours} />
    </>
  );
}

function Hero() {
  return (
    <section className="riva-dark relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(198,165,106,0.22),transparent_55%),radial-gradient(ellipse_at_80%_120%,rgba(94,139,139,0.18),transparent_50%)]"
      />
      <div className="relative mx-auto flex min-h-[86svh] max-w-3xl flex-col items-center justify-center px-5 py-28 text-center">
        <p className="riva-label animate-fade-in text-riva-gold-soft">
          {business.city} · Kust &amp; kök
        </p>
        <h1 className="mt-5 animate-fade-in font-display text-6xl font-medium leading-[0.95] text-on-dark md:text-8xl">
          Riva Bistro
        </h1>
        <WaveDivider className="mx-auto mt-8 max-w-[220px]" variant="gold" />
        <p className="mx-auto mt-8 max-w-xl text-balance text-lg leading-relaxed text-on-dark-muted">
          Svensk gastronomi med mediterran själ. En varm kväll vid vattnet — dukad
          för goda samtal och långa middagar.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild size="lg" variant="gold">
            <Link href="/boka">Boka bord</Link>
          </Button>
          <Button asChild size="lg" variant="outline-light">
            <Link href="/meny">Se menyn</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <Section className="text-center">
      <div className="reveal mx-auto max-w-2xl">
        <p className="riva-label">Välkommen till Riva</p>
        <h2 className="mt-4 font-display text-3xl leading-snug text-riva-ink md:text-4xl">
          En bistro där råvaran får tala, gästen får tid, och kvällen får ta plats.
        </h2>
        <p className="mt-6 leading-relaxed text-riva-ink-soft">
          Vi lagar mat med omsorg och serverar den utan krångel. Skandinavisk
          enkelhet möter mediterran värme — i en miljö som är lika bekväm för en
          vardagsmiddag som för det stora firandet.
        </p>
      </div>
    </Section>
  );
}

function Featured({ products }: { products: Product[] }) {
  return (
    <Section className="bg-riva-cream-2">
      <div className="reveal flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="riva-label">Från köket</p>
          <h2 className="mt-3 font-display text-4xl text-riva-ink">Säsongens favoriter</h2>
        </div>
        <Button asChild variant="link" className="text-base">
          <Link href="/meny">Se hela menyn →</Link>
        </Button>
      </div>
      {products.length > 0 ? (
        <div className="reveal mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="reveal mt-12 text-riva-taupe">
          Menyn uppdateras just nu. Titta gärna in igen om en liten stund.
        </p>
      )}
    </Section>
  );
}

function Experience() {
  const pillars = [
    {
      title: "Mat",
      body: "Säsongens råvaror, tillagade med respekt och en mediterran hand.",
    },
    {
      title: "Atmosfär",
      body: "Dämpat ljus, mjuka toner och en känsla av att tiden får sakta ner.",
    },
    {
      title: "Värdskap",
      body: "Ett vänligt bemötande som gör att du känner dig hemma från dörren.",
    },
  ];
  return (
    <Section>
      <div className="reveal grid gap-10 md:grid-cols-3 md:gap-14">
        {pillars.map((p) => (
          <div key={p.title}>
            <span className="riva-label">{p.title}</span>
            <WaveDivider className="mt-4 max-w-[80px]" />
            <p className="mt-4 leading-relaxed text-riva-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function EventsTeaser() {
  return (
    <section className="riva-dark relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(94,139,139,0.16),transparent_55%)]"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
        <p className="riva-label text-riva-gold-soft">Er tillställning, vår plats</p>
        <h2 className="mt-4 font-display text-4xl text-on-dark md:text-5xl">
          Privata event på Riva
        </h2>
        <p className="mt-6 max-w-xl leading-relaxed text-on-dark-muted">
          Företagsmiddagar, möten, firanden och slutna sällskap. Berätta om ditt
          tillfälle så formar vi en kväll som känns som er.
        </p>
        <Button asChild size="lg" variant="gold" className="mt-9">
          <Link href="/privata-event">Upptäck privata event</Link>
        </Button>
      </div>
    </section>
  );
}

function ReservationLocation({ hours }: { hours: OpeningHour[] }) {
  return (
    <Section className="bg-riva-cream-2">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="reveal">
          <p className="riva-label">Boka bord</p>
          <h2 className="mt-3 font-display text-4xl text-riva-ink md:text-5xl">
            Vi håller ditt bord redo
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-riva-ink-soft">
            Välj dag, tid och sällskap — du får en direkt bekräftelse. Enkelt,
            snabbt och utan krångel.
          </p>
          <Button asChild size="lg" variant="gold" className="mt-8">
            <Link href="/boka">Boka bord</Link>
          </Button>
        </div>
        <div className="reveal rounded-lg border border-riva-ink/10 bg-riva-ivory p-8">
          <h3 className="riva-label">Hitta hit</h3>
          <p className="mt-4 text-lg text-riva-ink">{business.address.street}</p>
          <p className="text-riva-taupe">
            {business.address.postalCode} {business.address.city}
          </p>
          <div className="mt-6 border-t border-riva-ink/10 pt-6">
            <h3 className="riva-label">Öppettider</h3>
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
        </div>
      </div>
    </Section>
  );
}
