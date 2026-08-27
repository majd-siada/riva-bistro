import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <Section className="pt-24">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-4 h-10 w-56" />
      <Skeleton className="mt-8 h-11 w-full max-w-sm" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </Section>
  );
}
