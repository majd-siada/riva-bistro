import { LegalDocument } from "@/components/legal/legal-document";
import { business } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bokningspolicy",
  description:
    "Riktlinjer för bordbokning och avbokning hos Riva Bistro. Malltext — ägare måste bekräfta reglerna.",
  path: "/bokningspolicy",
});

export default function BookingPolicyPage() {
  return (
    <LegalDocument title="Boknings- och avbokningspolicy" path="/bokningspolicy">
      <p>
        Du kan begära bord via webbplatsen när onlinebokning är aktiverad. Vid frågor,
        kontakta oss på{" "}
        {business.phone ? (
          <a className="text-riva-cream underline" href={business.phoneHref}>
            {business.phone}
          </a>
        ) : (
          "telefon"
        )}{" "}
        eller{" "}
        <a className="text-riva-cream underline" href={`mailto:${business.email}`}>
          {business.email}
        </a>
        .
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Bekräftelse</h2>
      <p>
        Efter lyckad bokning får du en referens i webbläsaren. E-postbekräftelse skickas när
        e-post är korrekt konfigurerat. Personalen kan även nå dig via telefon.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Avbokning / ändring</h2>
      <p>
        <strong className="text-riva-cream">Ägaren måste ange exakt avbokningsfrist</strong>{" "}
        (t.ex. senast X timmar innan). Mallförslag tills vidare: kontakta restaurangen så
        snart som möjligt om du behöver avboka eller ändra sällskapets storlek, så att
        bordet kan frigöras för andra gäster.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">No-show</h2>
      <p>
        utebliven ankomst utan avbokning kan påverka framtida bokningsmöjligheter. Eventuell
        avgiftspolicy ska beslutas av ägaren innan den publiceras som bindande.
      </p>
    </LegalDocument>
  );
}
