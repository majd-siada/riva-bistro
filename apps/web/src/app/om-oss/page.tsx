import { WaveDivider } from "@/components/brand/wave-divider";
import { Section } from "@/components/layout/section";

export const metadata = { title: "Om oss" };

export default function AboutPage() {
  return (
    <Section className="pt-24">
      <p className="riva-label">Vår historia</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">Om Riva Bistro</h1>
      <WaveDivider className="mt-6 max-w-xs" />
      <div className="prose prose-invert mt-10 max-w-2xl space-y-6 text-riva-mist">
        <p>
          Riva Bistro är en premiumrestaurang vid Stockholms kust, där skandinavisk minimalism möter
          varm mediterran gästfrihet. Vi tror på enkelhet, kvalitet och ärlig mat — tillagad med
          säsongens bästa råvaror.
        </p>
        <p>
          Vår filosofi bygger på respekt för råvaran, hantverket och gästen. Varje kväll serverar vi
          rätter som berättar en historia — från havet, skogen och de svenska traditionerna.
        </p>
        <p>
          Beställ online för avhämtning, eller boka bord för en kväll med utsikt över vattnet och
          ljusslingor i trädkronorna.
        </p>
      </div>
    </Section>
  );
}
