import Link from "next/link";
import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "Om Riva",
  description:
    "Om Riva Bistro — svensk gastronomi med mediterran själ, vid vattnet i Stockholm.",
};

/*
 * NOTE: The story below is carefully written, editable placeholder copy — not
 * fabricated facts (no invented history, chefs, or awards). Replace with the
 * restaurant's real story when available.
 */
export default function AboutPage() {
  return (
    <>
      <section className="riva-dark relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(198,165,106,0.18),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
          <p className="riva-label text-riva-gold-soft">Om Riva</p>
          <h1 className="mt-4 font-display text-5xl text-on-dark md:text-6xl">
            En plats vid vattnet
          </h1>
          <WaveDivider className="mx-auto mt-6 max-w-[200px]" variant="gold" />
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-on-dark-muted">
            Riva Bistro är tänkt som en fristad i vardagen — där god mat, varm
            gästfrihet och en vacker miljö möts.
          </p>
        </div>
      </section>

      <Section>
        <div className="reveal mx-auto max-w-prose space-y-6 text-lg leading-relaxed text-riva-ink-soft">
          <p>
            Hos oss möter skandinavisk enkelhet mediterran värme. Vi tror på
            råvaror som får tala för sig själva, tillagade med omsorg och
            serverade utan krångel.
          </p>
          <p>
            Rummet är ljust och dämpat på samma gång — en plats där en
            vardagsmiddag känns lika självklar som det stora firandet. Här får du
            tid att stanna kvar, dela en flaska och låta kvällen ta sin egen takt.
          </p>
          <p>
            Vårt värdskap är hjärtat i allt vi gör. Från stunden du kliver in vill
            vi att du ska känna dig sedd, väl omhändertagen och hemma.
          </p>
        </div>
      </Section>

      <Section className="bg-riva-cream-2">
        <div className="reveal grid items-center gap-10 md:grid-cols-3 md:gap-14">
          <div className="md:col-span-2">
            <p className="riva-label">Välkommen in</p>
            <h2 className="mt-3 font-display text-4xl text-riva-ink">
              Slå dig ner hos oss
            </h2>
            <p className="mt-5 max-w-prose leading-relaxed text-riva-ink-soft">
              Vare sig det gäller en spontan middag eller ett planerat firande —
              vi håller ditt bord redo i {business.city}.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Button asChild size="lg" variant="gold">
              <Link href="/boka">Boka bord</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/meny">Se menyn</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
