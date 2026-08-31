import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
  as?: "section" | "div";
};

export function Section({
  id,
  className,
  children,
  as: Tag = "section",
}: SectionProps) {
  return (
    <Tag id={id} className={cn("px-6 py-20 md:py-28", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </Tag>
  );
}
