import { cn } from "@/lib/utils";

type StateVariant = "empty" | "error" | "success" | "loading";

interface StateMessageProps {
  variant: StateVariant;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StateVariant, string> = {
  empty: "border-riva-ivory/10 bg-riva-charcoal",
  error: "border-riva-error/30 bg-riva-error/5",
  success: "border-riva-success/30 bg-riva-success/5",
  loading: "border-riva-ivory/10 bg-riva-charcoal",
};

export function StateMessage({
  variant,
  title,
  description,
  icon,
  action,
  className,
}: StateMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border px-6 py-12 text-center",
        variantStyles[variant],
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      {icon && <div className="mb-4 text-riva-teal">{icon}</div>}
      <h3 className="font-display text-xl text-riva-ivory">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-riva-mist">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
