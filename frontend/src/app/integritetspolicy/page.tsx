import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { business, fullAddress } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Integritetspolicy",
  description:
    "Hur Riva Bistro behandlar personuppgifter vid bokning och kontakt.",
  path: "/integritetspolicy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument title="Integritetspolicy" path="/integritetspolicy">
      <h2 className="font-display text-2xl text-riva-cream">Personuppgiftsansvarig</h2>
      <p>
        {business.name}
        <br />
        {fullAddress()}
      </p>
      <p>
        E-post:{" "}
        <a className="text-riva-cream underline" href={`mailto:${business.email}`}>
          {business.email}
        </a>
        <br />
        Telefon:{" "}
        <a className="text-riva-cream underline" href={business.phoneHref}>
          {business.phone}
        </a>
      </p>

      <h2 className="font-display text-2xl text-riva-cream">Vilka uppgifter vi behandlar</h2>
      <p>
        När du bokar bord eller kontaktar oss kan vi behandla de uppgifter du lämnar, till
        exempel:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>namn</li>
        <li>telefonnummer</li>
        <li>e-postadress</li>
        <li>antal gäster</li>
        <li>datum och tid för bokningen</li>
        <li>meddelande eller annan information du skickar till oss</li>
      </ul>

      <h2 className="font-display text-2xl text-riva-cream">Varför vi använder uppgifterna</h2>
      <p>Vi använder uppgifterna för att:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>hantera din bokning</li>
        <li>svara på dina frågor och förfrågningar</li>
        <li>kontakta dig vid behov angående bokningen eller meddelandet</li>
      </ul>

      <h2 className="font-display text-2xl text-riva-cream">Hur länge sparas uppgifterna?</h2>
      <p>
        Boknings- och kontaktuppgifter sparas normalt bara så länge det behövs för att
        hantera bokningen och närliggande behov i verksamheten. Den avsedda tiden är upp
        till 30 dagar efter reservationsdatumet. Därefter ska uppgifterna raderas, om det
        inte finns ett berättigat skäl eller ett lagkrav att spara viss information längre.
      </p>

      <h2 className="font-display text-2xl text-riva-cream">Dina rättigheter</h2>
      <p>
        Du är välkommen att kontakta oss om du vill veta vilka uppgifter vi har om dig,
        eller om du vill be om rättelse eller radering när det är möjligt. Skriv till{" "}
        <a className="text-riva-cream underline" href={`mailto:${business.email}`}>
          {business.email}
        </a>
        .
      </p>
      <p>
        Om du tycker att vi inte behandlar dina uppgifter korrekt kan du vända dig till
        Integritetsskyddsmyndigheten (IMY).
      </p>
      <p>
        Se även vår{" "}
        <Link href="/cookies" className="text-riva-cream underline">
          cookiepolicy
        </Link>{" "}
        och{" "}
        <Link href="/bokningspolicy" className="text-riva-cream underline">
          boknings- och avbokningspolicy
        </Link>
        .
      </p>
    </LegalDocument>
  );
}
