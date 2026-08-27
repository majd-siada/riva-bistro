import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Vanliga frågor",
  description:
    "Vanliga frågor om Riva Bistro — bokning, avbokning, moms, allergier och öppettider.",
};

const faqs = [
  {
    q: "Hur bokar jag bord?",
    a: "Använd vår bokningssida under ”Boka bord”. Välj datum, tid och antal gäster så får du en direkt bekräftelse med bokningsnummer.",
  },
  {
    q: "Kan jag avboka min bordsbokning?",
    a: "Ja, avbokningar kan göras kostnadsfritt upp till 24 timmar före bokad tid. Kontakta oss via e-post eller telefon.",
  },
  {
    q: "Ingår moms i priserna?",
    a: "Ja, alla priser på menyn visas inklusive moms.",
  },
  {
    q: "Har ni vegetariska alternativ?",
    a: "Ja, vi har flera vegetariska rätter och kan anpassa de flesta rätter. Meddela oss gärna vid bokning.",
  },
  {
    q: "Kan ni ta emot större sällskap och event?",
    a: "Absolut. Läs mer under Privata event och skicka en förfrågan så återkommer vi med förslag.",
  },
  {
    q: "Vilka är era öppettider?",
    a: "Aktuella öppettider hittar du i sidfoten och på kontaktsidan.",
  },
];

export default function FaqPage() {
  return (
    <Section className="pt-16 md:pt-20">
      <header className="max-w-2xl">
        <p className="riva-label">Vanliga frågor</p>
        <h1 className="mt-3 font-display text-5xl text-riva-ink md:text-6xl">FAQ</h1>
        <WaveDivider className="mt-6 max-w-[200px]" />
      </header>

      <dl className="mt-12 max-w-prose divide-y divide-riva-ink/10 border-t border-riva-ink/10">
        {faqs.map((faq) => (
          <div key={faq.q} className="py-6">
            <dt className="font-display text-xl text-riva-ink">{faq.q}</dt>
            <dd className="mt-2 leading-relaxed text-riva-ink-soft">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
