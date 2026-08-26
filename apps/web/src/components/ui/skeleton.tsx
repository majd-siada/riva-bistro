import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-sm bg-riva-charcoal-deep riva-shimmer", className)} {...props} />;
}

export { Skeleton };
