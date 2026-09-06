import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  titleId?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  titleId,
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
      <h2
        id={titleId}
        className={cn("font-display text-3xl text-riva-cream md:text-4xl lg:text-5xl", eyebrow && "mt-4")}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty leading-relaxed text-riva-muted">{description}</p>
      )}
    </div>
  );
}
