import { WaveDivider } from "@/components/brand/wave-divider";
import { Section } from "@/components/layout/section";

export const metadata = {
  title: "FAQ",
  description:
    "Vanliga frågor om Riva Bistro — moms, bordsbokning, avbokning, allergier och öppettider.",
};

const faqs = [
  {
    q: "Ingår moms i priserna?",
    a: "Ja, alla priser på menyn visas inklusive moms (25%). Vid checkout visas även en uppdelning exkl. moms och momsbelopp.",
  },
  {
    q: "Kan jag avboka min bordsbokning?",
    a: "Ja, avbokningar kan göras kostnadsfritt upp till 24 timmar före bokad tid. Kontakta oss via e-post eller telefon.",
  },
  {
    q: "Hur fungerar onlinebeställning?",
    a: "Välj rätter från menyn, anpassa tillbehör, lägg i varukorgen och betala i kassan. Du får en orderreferens och kan följa statusen i realtid.",
  },
  {
    q: "Har ni vegetariska alternativ?",
    a: "Ja, vi har flera vegetariska rätter och kan anpassa de flesta rätter. Meddela oss gärna vid beställning.",
  },
  {
    q: "Vilka betalningsmetoder accepteras?",
    a: "Vi accepterar kortbetalning online. Betalning hanteras säkert via vår betalningspartner.",
  },
];

export default function FaqPage() {
  return (
    <Section className="pt-24">
      <p className="riva-label">Vanliga frågor</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">FAQ &amp; policy</h1>
      <WaveDivider className="mt-6 max-w-xs" />

      <dl className="mt-10 max-w-2xl space-y-8">
        {faqs.map((faq) => (
          <div key={faq.q}>
            <dt className="font-display text-xl text-riva-ivory">{faq.q}</dt>
            <dd className="mt-2 text-riva-mist">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
