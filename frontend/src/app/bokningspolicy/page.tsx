import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { business, fullAddress } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bokningspolicy",
  description:
    "Hur du bokar bord hos Riva Bistro, och vad som gäller vid avbokning eller ändring.",
  path: "/bokningspolicy",
});

export default function BookingPolicyPage() {
  return (
    <LegalDocument title="Boknings- och avbokningspolicy" path="/bokningspolicy">
      <p>
        Hos {business.name} kan du boka bord direkt via webbplatsen. När bokningen är klar
        får du ett bokningsnummer. Vi skickar också gärna en bekräftelse till den e-postadress
        du anger.
      </p>

      <h2 className="font-display text-2xl text-riva-cream">Hur många kan boka online?</h2>
      <p>
        Online kan du boka för upp till 30 gäster. Det finns inget minimiantal. Är ni fler,
        eller har särskilda önskemål, är ni välkomna att kontakta oss så hjälper vi er med
        en större bokning.
      </p>

      <h2 className="font-display text-2xl text-riva-cream">Avbokning och ändring</h2>
      <p>
        Det finns ingen avbokningsavgift och ingen avgift om någon uteblir. Hör av er så
        snart ni kan om ni behöver avboka eller ändra bokningen — gärna minst en timme före
        den bokade tiden, så att bordet kan frigöras för andra gäster.
      </p>
      <p>
        Vi kan behöva ringa dig angående bokningen. Kontakta oss på{" "}
        <a className="text-riva-cream underline" href={business.phoneHref}>
          {business.phone}
        </a>{" "}
        eller{" "}
        <a className="text-riva-cream underline" href={`mailto:${business.email}`}>
          {business.email}
        </a>
        .
      </p>
      <p>
        {business.name}, {fullAddress()}.
      </p>
      <p>
        Mer om hur vi hanterar personuppgifter finns i vår{" "}
        <Link href="/integritetspolicy" className="text-riva-cream underline">
          integritetspolicy
        </Link>
        .
      </p>
    </LegalDocument>
  );
}
