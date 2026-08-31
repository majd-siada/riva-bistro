import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <p className="riva-label">{eyebrow}</p>}
      <h2 className={cn("font-display text-3xl text-riva-cream md:text-4xl lg:text-5xl", eyebrow && "mt-4")}>
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty leading-relaxed text-riva-muted">{description}</p>
      )}
    </div>
  );
}
