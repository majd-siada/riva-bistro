import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { business, fullAddress } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Villkor",
  description: "Kort information om Riva Bistros webbplats och bokningar.",
  path: "/villkor",
});

export default function TermsPage() {
  return (
    <LegalDocument title="Villkor" path="/villkor">
      <p>
        Webbplatsen tillhör {business.name}, {fullAddress()}. Här hittar du information om
        restaurangen, menyn, öppettider och möjligheten att boka bord.
      </p>
      <p>
        Meny, priser, öppettider och annan information kan ändras. Om något skiljer sig från
        det som står på webbplatsen gäller den information personalen ger dig.
      </p>
      <p>
        När du bokar bord via webbplatsen gäller vår{" "}
        <Link href="/bokningspolicy" className="text-riva-cream underline">
          boknings- och avbokningspolicy
        </Link>
        .
      </p>
    </LegalDocument>
  );
}
