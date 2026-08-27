import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Section className="pt-16">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-4 h-12 w-2/3 max-w-md" />
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    </Section>
  );
}
