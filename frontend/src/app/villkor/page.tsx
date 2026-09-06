import { LegalDocument } from "@/components/legal/legal-document";
import { business, fullAddress } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Villkor",
  description: "Allmänna villkor för användning av Riva Bistros webbplats.",
  path: "/villkor",
});

export default function TermsPage() {
  return (
    <LegalDocument title="Villkor" path="/villkor">
      <p>
        Webbplatsen drivs av {business.name}, {fullAddress()}. Genom att använda sajten
        godkänner du dessa villkor i den form de publiceras.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Innehåll</h2>
      <p>
        Meny, priser och öppettider kan ändras. Vid konflikt mellan webbplatsen och
        information i restaurangen gäller den information personalen ger på plats, om inte
        annat avtalats.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Bokningar</h2>
      <p>
        Bordbokningar som görs via webbplatsen är förfrågningar/bekräftelser enligt de
        regler som anges i bokningspolicyn. Restaurangen kan kontakta dig för att
        bekräfta eller justera bokningen.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Ansvar</h2>
      <p>
        Vi strävar efter korrekt information men kan inte garantera att allt innehåll alltid
        är komplett. Malltexten ska kompletteras efter juridisk granskning.
      </p>
    </LegalDocument>
  );
}
