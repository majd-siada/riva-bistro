import Link from "next/link";

import { GoldDivider } from "@/components/brand/gold-divider";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

export default function NotFound() {
  return (
    <Section className="pt-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="riva-label">404</p>
        <h1 className="mt-3 font-display text-4xl text-riva-cream md:text-5xl">
          Sidan kunde inte hittas
        </h1>
        <GoldDivider className="mx-auto mt-6 max-w-[200px]" variant="short" />
        <p className="mt-5 text-riva-muted">
          Sidan du letar efter finns inte längre eller har flyttat.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="gold">
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
