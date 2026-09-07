import { LegalDocument } from "@/components/legal/legal-document";
import { business, fullAddress } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Integritetspolicy",
  description:
    "Hur Riva Bistro behandlar personuppgifter i samband med bokningar och kontaktformulär.",
  path: "/integritetspolicy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument title="Integritetspolicy" path="/integritetspolicy">
      <p>
        Personuppgiftsansvarig: {business.name}, {fullAddress()}. Kontakt:{" "}
        <a className="text-riva-cream underline" href={`mailto:${business.email}`}>
          {business.email}
        </a>
        {business.phone ? (
          <>
            {" "}
            /{" "}
            <a className="text-riva-cream underline" href={business.phoneHref}>
              {business.phone}
            </a>
          </>
        ) : null}
        .
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Uppgifter vi behandlar</h2>
      <p>
        När du bokar bord eller skickar ett meddelande sparar vi de uppgifter du lämnar,
        till exempel namn, telefonnummer, e-postadress, sällskapets storlek, önskat datum
        och tid samt eventuella meddelanden. Uppgifterna används för att hantera din
        förfrågan eller bokning och för att kontakta dig vid behov.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Laglig grund</h2>
      <p>
        Behandlingen sker för att fullgöra avtalet om bordbokning eller för vårt
        berättigade intresse av att besvara kundförfrågningar (GDPR art. 6.1 b/f), i den
        mån tillämpligt. Malltexten ska bekräftas av jurist.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Lagring</h2>
      <p>
        Boknings- och kontaktuppgifter lagras så länge det behövs för verksamheten och
        gällande bokförings-/arkiveringskrav. Exakt retention ska beslutas av ägaren.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Dina rättigheter</h2>
      <p>
        Du kan begära tillgång, rättelse, radering eller begränsning via{" "}
        <a className="text-riva-cream underline" href={`mailto:${business.email}`}>
          {business.email}
        </a>
        . Du kan också lämna klagomål till Integritetsskyddsmyndigheten (IMY).
      </p>
    </LegalDocument>
  );
}
