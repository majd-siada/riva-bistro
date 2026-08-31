import Link from "next/link";
import { Heart, Leaf, Sparkles, Users } from "lucide-react";

import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { ValueCard } from "@/components/brand/value-card";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Om oss",
  description: "Lär känna Riva Bistro — vår historia, värderingar och passion för god mat.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <p className="riva-label">Om Riva Bistro</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">
              Vår historia
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-riva-muted">
              Riva Bistro föddes ur en enkel idé: att skapa en plats där mat, miljö och
              människor möts i lugn takt — vid vattnet, mitt i Stockholm.
            </p>
          </div>
          <RestaurantImage
            src="/scenes/home-interior.jpg"
            alt="Riva Bistros interiör — elegant mörk matsal med varm belysning"
            aspectRatio="hero"
            priority
          />
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Värderingar"
          title="Det vi tror på"
          description="Fyra pelare som genomsyrar allt vi gör — från råvaruval till värdskap vid bordet."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            icon={Sparkles}
            title="Kvalitet"
            body="Vi väljer råvaror med omsorg och tillagar dem med respekt för smak och säsong."
          />
          <ValueCard
            icon={Heart}
            title="Passion"
            body="Matglädje är hjärtat i vår verksamhet — i köket, i salen och i varje detalj."
          />
          <ValueCard
            icon={Users}
            title="Gemenskap"
            body="Riva är en plats för samtal, skratt och gemensamma stunder vid bordet."
          />
          <ValueCard
            icon={Leaf}
            title="Upplevelse"
            body="En kväll hos oss ska kännas cinematisk, varm och minnesvärd — inte stressig."
          />
        </div>
      </Section>

      <Section className="bg-riva-surface/40">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-riva-cream">Vill du uppleva Riva?</h2>
          <p className="mt-4 text-riva-muted">
            Boka bord eller utforska menyn — vi ser fram emot att välkomna dig.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="gold">
              <Link href="/boka">Boka bord</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/meny">Se menyn</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
