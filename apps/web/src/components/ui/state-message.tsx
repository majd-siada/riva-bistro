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
  empty: "border-riva-cream/10 bg-riva-card",
  error: "border-riva-error/40 bg-riva-error/10",
  success: "border-riva-success/45 bg-riva-success/12",
  loading: "border-riva-cream/10 bg-riva-card",
};

const iconColor: Record<StateVariant, string> = {
  empty: "text-riva-gold",
  error: "text-riva-error",
  success: "text-riva-success",
  loading: "text-riva-gold",
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
        "flex flex-col items-center justify-center rounded-lg border px-6 py-12 text-center",
        variantStyles[variant],
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      {icon && <div className={cn("mb-4", iconColor[variant])}>{icon}</div>}
      <h3
        className={cn(
          "font-display text-xl",
          variant === "success" ? "text-riva-success" : "text-riva-cream",
        )}
      >
        {title}
      </h3>
      {description && <p className="mt-2 max-w-md text-sm text-riva-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
