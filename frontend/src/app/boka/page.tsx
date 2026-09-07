import Link from "next/link";

import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";

import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { ReservationForm } from "@/components/features/booking";
import { Section } from "@/components/layout/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Boka bord",
  absoluteTitle: "Boka bord — Riva Bistro Kungsholmen",
  description:
    "Boka bord på Riva Bistro, Kungsholmen — välj datum, tid och antal gäster online. Lunch eller middag vid Hornsbergs Strand.",
  path: "/boka",
});

const GOOD_TO_KNOW = [
  {
    title: "Bekräftelse",
    body: "Du får en direkt bekräftelse med bokningsnummer när bokningen är genomförd.",
  },
  {
    title: "Avbokning",
    body: "Kontakta oss minst 24 timmar innan om du behöver ändra eller avboka.",
  },
  {
    title: "Försenad?",
    body: "Hör av dig om du blir försenad — vi håller bordet så länge vi kan.",
  },
];

export default function BookingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <PageBreadcrumbs
              items={[
                { name: "Hem", path: "/" },
                { name: "Boka bord", path: "/boka" },
              ]}
            />
            <p className="riva-label">Reservation</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">Boka bord</h1>
            <p className="mt-4 max-w-md text-riva-muted">
              Boka bord på Riva Bistro på Kungsholmen — välj dag, tid och sällskap
              online. Du får en direkt bekräftelse när bokningen är klar.
            </p>
          </div>
          <RestaurantImage
            src="/scenes/booking-table.jpg"
            alt="Duktat bord med vinglas i mörk restaurangmiljö — Riva Bistro"
            aspectRatio="wide"
          />
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div>
            <SectionHeading
              title="Din bokning"
              description="Fyll i formuläret så reserverar vi bordet. Adress och öppettider hittar du under Kontakt."
            />
            <div className="mt-8">
              <ReservationForm />
            </div>
          </div>
          <aside>
            <h2 className="riva-label">Bra att veta</h2>
            <div className="mt-4 space-y-4">
              {GOOD_TO_KNOW.map((item) => (
                <Card key={item.title}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-riva-muted">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
              <p className="pt-2 text-sm text-riva-muted">
                Hitta hit:{" "}
                <Link
                  href="/kontakt"
                  className="text-riva-cream underline-offset-4 hover:underline"
                >
                  adress, karta och öppettider
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
