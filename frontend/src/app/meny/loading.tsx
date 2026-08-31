import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <Section className="pt-16">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-5 w-28" />
        <Skeleton className="mx-auto mt-4 h-12 w-48" />
      </div>
      <div className="mt-16 space-y-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid gap-x-14 gap-y-4 md:grid-cols-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </Section>
  );
}
