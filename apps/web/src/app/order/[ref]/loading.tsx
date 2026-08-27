import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderLoading() {
  return (
    <Section className="pt-24">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-4 h-10 w-64" />
      <Skeleton className="mt-8 h-24 w-full max-w-md" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </Section>
  );
}
