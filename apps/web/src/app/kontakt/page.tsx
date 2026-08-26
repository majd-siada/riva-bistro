import { WaveDivider } from "@/components/brand/wave-divider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

export const metadata = { title: "Kontakt" };

export default function ContactPage() {
  return (
    <Section className="pt-24">
      <p className="riva-label">Hör av dig</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">Kontakt</h1>
      <WaveDivider className="mt-6 max-w-xs" />

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div className="space-y-6 text-riva-mist">
          <div>
            <h2 className="font-display text-xl text-riva-ivory">Besök oss</h2>
            <p className="mt-2">Strandvägen 12, 114 56 Stockholm</p>
          </div>
          <div>
            <h2 className="font-display text-xl text-riva-ivory">Öppettider</h2>
            <p className="mt-2">Mån–Fre 17:00–23:00 · Lör–Sön 12:00–23:00</p>
          </div>
          <div>
            <h2 className="font-display text-xl text-riva-ivory">Kontakt</h2>
            <p className="mt-2">info@rivabistro.se · +46 8 123 45 67</p>
          </div>
        </div>

        <form className="space-y-5 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6">
          <div>
            <Label htmlFor="contact-name">Namn</Label>
            <Input id="contact-name" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contact-email">E-post</Label>
            <Input id="contact-email" type="email" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contact-message">Meddelande</Label>
            <Textarea id="contact-message" className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full">
            Skicka meddelande
          </Button>
        </form>
      </div>
    </Section>
  );
}
