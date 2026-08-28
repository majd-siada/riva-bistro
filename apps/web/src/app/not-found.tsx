import Link from "next/link";

import { WaveDivider } from "@/components/brand/wave-divider";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

export default function NotFound() {
  return (
    <Section className="pt-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="riva-label">404</p>
        <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">
          Sidan kunde inte hittas
        </h1>
        <WaveDivider className="mx-auto mt-6 max-w-xs" />
        <p className="mt-4 text-riva-mist">
          Sidan du letar efter finns inte längre eller har flyttat.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/">Till startsidan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/meny">Se menyn</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
