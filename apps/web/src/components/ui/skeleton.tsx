import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md bg-riva-cream-2 riva-shimmer", className)} {...props} />;
}

export { Skeleton };
