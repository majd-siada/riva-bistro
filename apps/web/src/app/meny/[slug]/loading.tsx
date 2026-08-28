import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <Section className="pt-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-6 h-8 w-40" />
          <Skeleton className="mt-8 h-12 w-full max-w-xs" />
        </div>
      </div>
    </Section>
  );
}
