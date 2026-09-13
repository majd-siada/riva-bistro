import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cookiepolicy",
  description:
    "Hur Riva Bistro använder kakor och liknande teknik på webbplatsen.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalDocument title="Cookiepolicy" path="/cookies">
      <p>
        På den offentliga webbplatsen använder vi bara det som behövs för att sidan ska
        fungera som den ska. Vi använder inte reklam- eller analysverktyg från andra
        företag, och vi spårar dig inte i marknadsföringssyfte.
      </p>

      <h2 className="font-display text-2xl text-riva-cream">Vad sparas i din webbläsare?</h2>
      <p>
        När du stänger vårt korta meddelande om kakor sparar webbläsaren att du har sett
        det, så att samma meddelande inte visas igen i onödan.
      </p>
      <p>
        Om du loggar in i restaurangens interna adminområde används säkerhetskakor för
        inloggningen. Det behövs inte för att besöka menyn, boka bord eller läsa om oss.
      </p>

      <h2 className="font-display text-2xl text-riva-cream">Mer information</h2>
      <p>
        Hur vi hanterar personuppgifter när du bokar eller kontaktar oss beskrivs i vår{" "}
        <Link href="/integritetspolicy" className="text-riva-cream underline">
          integritetspolicy
        </Link>
        .
      </p>
    </LegalDocument>
  );
}
