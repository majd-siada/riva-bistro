import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Section className="pt-24">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-4 h-12 w-2/3 max-w-md" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    </Section>
  );
}
