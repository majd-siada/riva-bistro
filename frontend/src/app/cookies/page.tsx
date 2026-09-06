import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cookiepolicy",
  description:
    "Information om vilka kakor Riva Bistro använder. Endast nödvändiga kakor — ingen reklamspårning.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalDocument title="Cookiepolicy">
      <p>
        Vi använder endast nödvändiga kakor för att webbplatsen ska fungera, bland annat
        för att komma ihåg ditt samtycke i cookiemeddelandet och för inloggning i
        administrationen. Vi använder inte reklam- eller analysverktyg från tredje part på
        den offentliga webbplatsen.
      </p>
      <h2 className="font-display text-2xl text-riva-cream">Nödvändiga kakor</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-riva-cream">riva-cookie-consent</strong> — sparar att du
          stängt cookiemeddelandet (localStorage).
        </li>
        <li>
          <strong className="text-riva-cream">Sessionskaka / CSRF</strong> — används endast
          för inloggad administration mot API:t.
        </li>
      </ul>
      <p>
        Mer om personuppgifter finns i vår{" "}
        <Link href="/integritetspolicy" className="text-riva-cream underline">
          integritetspolicy
        </Link>
        .
      </p>
    </LegalDocument>
  );
}
