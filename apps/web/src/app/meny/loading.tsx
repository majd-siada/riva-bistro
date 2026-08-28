import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <Section className="pt-24">
      <div className="mb-10">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-4 h-12 w-64" />
        <Skeleton className="mt-6 h-4 w-full max-w-xl" />
      </div>
      <div className="mb-8 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </Section>
  );
}
