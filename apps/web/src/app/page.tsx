import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getApiHealth(): Promise<"ok" | "degraded" | "unreachable"> {
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/health/`, {
      next: { revalidate: 10 },
    });
    if (!response.ok) {
      return "degraded";
    }
    const data = (await response.json()) as { status?: string };
    return data.status === "ok" ? "ok" : "degraded";
  } catch {
    return "unreachable";
  }
}

export default async function HomePage() {
  const health = await getApiHealth();

  return (
    <>
      <section className="relative flex min-h-[100svh] items-center justify-center bg-riva-hero px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-riva-gold">
            Stockholm
          </p>
          <h1 className="font-display text-5xl font-medium text-riva-ivory md:text-7xl">
            Riva Bistro
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-riva-ivory/75 md:text-lg">
            En stillsam plats för svensk gastronomi — mer av den cinematiska
            upplevelsen kommer i nästa fas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/boka">Boka bord</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/meny">Se menyn</Link>
            </Button>
          </div>
        </div>
      </section>

      <Section className="bg-riva-charcoal">
        <div className="max-w-2xl">
          <h2 className="text-3xl text-riva-ivory md:text-4xl">Grundplattform</h2>
          <p className="mt-4 text-riva-ivory/70">
            Phase 1 är igång: Docker, PostgreSQL, Django API och den här Next.js
            grunden med Rivas design tokens.
          </p>
          <p className="mt-6 text-sm tracking-wide text-riva-mist">
            API-status:{" "}
            <span
              className={
                health === "ok" ? "text-riva-gold" : "text-riva-ivory/60"
              }
            >
              {health === "ok"
                ? "ansluten"
                : health === "degraded"
                  ? "degraderad"
                  : "ej nåbar (starta Docker Compose)"}
            </span>
          </p>
        </div>
      </Section>
    </>
  );
}
