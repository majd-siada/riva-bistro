import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  steps: { label: string; status: "complete" | "active" | "pending" }[];
  className?: string;
}

export function OrderStatusTimeline({ steps, className }: OrderStatusTimelineProps) {
  return (
    <ol className={cn("flex flex-col gap-0 sm:flex-row sm:gap-4", className)} aria-label="Orderstatus">
      {steps.map((step, index) => (
        <li
          key={step.label}
          className={cn(
            "flex flex-1 items-center gap-3 sm:flex-col sm:text-center",
            index < steps.length - 1 && "sm:relative",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-riva",
              step.status === "complete" && "status-step-complete text-riva-success",
              step.status === "active" && "status-step-active text-riva-teal",
              step.status === "pending" && "status-step-pending text-riva-mist",
            )}
            aria-current={step.status === "active" ? "step" : undefined}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "text-sm",
              step.status === "active" ? "text-riva-ivory font-medium" : "text-riva-mist",
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
