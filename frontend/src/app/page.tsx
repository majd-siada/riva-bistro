import Link from "next/link";

import { CTASection } from "@/components/brand/cta-section";
import { HoursStrip } from "@/components/brand/hours-strip";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { RestaurantInfo } from "@/components/brand/restaurant-info";
import { SectionHeading } from "@/components/brand/section-heading";
import { FeaturedDish, FoodCard } from "@/components/features/menu";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { loadFeaturedItems } from "@/lib/public-menu";
import { loadGallery, loadHours, loadNews } from "@/lib/public-data";
import { createPageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata = createPageMetadata({
  title: SITE_NAME,
  absoluteTitle: `${SITE_NAME} — Restaurang på Kungsholmen i Stockholm`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const [featured, hours, news, gallery] = await Promise.all([
    loadFeaturedItems(),
    loadHours(),
    loadNews(),
    loadGallery(),
  ]);
  const signature = featured[0];

  return (
    <>
      <Hero hours={hours} />
      <AboutSplit />
      {featured.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Från köket" title="Säsongens favoriter" align="center" />
          <div className="reveal mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <FoodCard
                key={item.slug}
                name={item.name}
                description={item.description}
                priceIncVat={item.priceIncVat}
                imageSrc={item.imageUrl}
              />
            ))}
          </div>
        </Section>
      )}
      {signature && (
        <Section className="bg-riva-surface/50">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <RestaurantImage
              src={signature.imageUrl || "/scenes/menu-tabletop.jpg"}
              alt={signature.name}
              aspectRatio="wide"
            />
            <FeaturedDish
              name={signature.name}
              categoryName="Signatur"
              description={signature.description}
              priceIncVat={signature.priceIncVat}
            />
          </div>
        </Section>
      )}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <SectionHeading
              eyebrow="Er tillställning"
              title="Privata event"
              description="Företagsmiddagar, firanden och slutna sällskap. Vi formar kvällen efter er."
            />
            <Button asChild variant="outline" className="mt-8">
              <Link href="/privata-event">Planera ett event</Link>
            </Button>
          </div>
          <RestaurantImage
            src="/scenes/private-event.jpg"
            alt="Privat tillställning på Riva Bistro"
            aspectRatio="wide"
            className="reveal"
          />
        </div>
      </Section>
      {news.length > 0 && (
        <Section className="bg-riva-surface/40">
          <SectionHeading eyebrow="Just nu" title="Nyheter" />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {news.map((item) => (
              <li key={item.id} className="riva-card p-6">
                <h3 className="font-display text-2xl text-riva-cream">{item.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm text-riva-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {gallery.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Atmosfär" title="Galleri" align="center" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(0, 6).map((item) => (
              <RestaurantImage
                key={item.id}
                src={item.src}
                alt={item.alt}
                aspectRatio="wide"
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/galleri">Fler bilder</Link>
            </Button>
          </div>
        </Section>
      )}
      <Section className="bg-riva-surface/40">
        <RestaurantInfo hours={hours} />
      </Section>
      <CTASection
        title="Boka ett bord"
        description="Lunch eller middag på Kungsholmen — välj tid på bokningssidan, eller se menyn först."
      />
    </>
  );
}

function Hero({ hours }: { hours: Awaited<ReturnType<typeof loadHours>> }) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-riva-black">
      <div className="absolute inset-0">
        <RestaurantImage
          src="/scenes/hero-food.jpg"
          alt="Grillad entrecôte på mörk tallrik — Riva Bistro"
          aspectRatio="fill"
          priority
          className="h-full min-h-[88vh] rounded-none"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-riva-black via-riva-black/70 to-riva-black/30" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end gap-10 px-5 pb-16 pt-28 md:px-8 md:pb-20">
        <div className="max-w-2xl">
          <p className="riva-label">Kungsholmen · {business.tagline}</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-riva-cream md:text-7xl">
            Goda smaker, äkta upplevelser
          </h1>
          <p className="mt-6 max-w-md text-pretty leading-relaxed text-riva-muted">
            Riva Bistro är en restaurang på Kungsholmen i Stockholm — skandinavisk mat i
            stillsam miljö vid vattnet, med utsikt och uteservering. Vi dukar för lunch,
            långa middagar och minnesvärda kvällar.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/boka">Boka bord</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/meny">Se vår meny</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/kontakt">Hitta hit</Link>
            </Button>
          </div>
        </div>
        <HoursStrip hours={hours} />
      </div>
    </section>
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
            description="Vi lagar mat med omsorg och serverar den utan krångel. Skandinavisk enkelhet möter mediterran värme — i en miljö som är lika bekväm för en vardagsmiddag som för det stora firandet. På Kungsholmen, vid Hornsbergs Strand, bjuder vi på middag med utsikt och plats utomhus när vädret tillåter."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/om-oss">Läs mer om oss</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/kontakt">Adress &amp; öppettider</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
