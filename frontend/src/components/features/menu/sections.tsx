import { SectionHeading } from "@/components/brand/section-heading";
import { FoodCard } from "@/components/features/menu/food-card";
import type { PublicCategory, PublicItem } from "@/lib/public-menu";

export type MenuSectionProps = {
  category: PublicCategory;
  items: PublicItem[];
  /** Optional nested course categories (used by RIVAS MENY). */
  subsections?: Array<{ category: PublicCategory; items: PublicItem[] }>;
};

function EmptyState({ label }: { label: string }) {
  return (
    <p className="mt-6 text-sm text-riva-muted" role="status">
      Inga rätter i {label} just nu.
    </p>
  );
}

function ItemGrid({ items }: { items: PublicItem[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <FoodCard
          key={item.slug}
          name={item.name}
          description={item.description}
          priceIncVat={item.priceIncVat}
          imageSrc={item.imageUrl}
        />
      ))}
    </div>
  );
}

/** Generic top-level section: heading + direct items (no nested courses). */
export function MenuSection({ category, items }: MenuSectionProps) {
  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-heading`}
      className="scroll-mt-28 border-t border-riva-gold/15 pt-14"
    >
      <SectionHeading
        title={category.name}
        titleId={`${category.slug}-heading`}
        description={category.description || undefined}
      />
      {items.length ? <ItemGrid items={items} /> : <EmptyState label={category.name} />}
    </section>
  );
}

export function DagensLunchSection(props: MenuSectionProps) {
  return <MenuSection {...props} />;
}

export function TakeAwaySection(props: MenuSectionProps) {
  return <MenuSection {...props} />;
}

export function StoraSallskapsmenySection(props: MenuSectionProps) {
  return <MenuSection {...props} />;
}

export function SnacksDrinkarSection(props: MenuSectionProps) {
  return <MenuSection {...props} />;
}

export function DryckSection(props: MenuSectionProps) {
  return <MenuSection {...props} />;
}

/**
 * RIVAS MENY — visually isolated group that owns the course categories
 * (Förrätter → Desserter). Sibling top-level sections stay outside this frame.
 */
export function RivasMenySection({
  category,
  subsections = [],
}: MenuSectionProps) {
  const hasAnyItems = subsections.some((s) => s.items.length > 0);

  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-heading`}
      className="scroll-mt-28 border-t border-riva-gold/15 pt-14"
    >
      <div className="rounded-2xl border border-riva-gold/25 bg-riva-card/40 px-5 py-8 md:px-8 md:py-10">
        <SectionHeading
          title={category.name}
          titleId={`${category.slug}-heading`}
          description={
            category.description ||
            "Förrätter, varmrätter, sallader, pasta, barnmeny och desserter."
          }
        />

        {!hasAnyItems ? (
          <EmptyState label={category.name} />
        ) : (
          <div className="mt-10 space-y-14">
            {subsections.map(({ category: sub, items }) => (
              <div
                key={sub.slug}
                id={sub.slug}
                className="scroll-mt-28 border-t border-riva-gold/10 pt-10 first:border-t-0 first:pt-0"
              >
                <h3 className="font-display text-2xl text-riva-cream md:text-3xl">
                  {sub.name}
                </h3>
                {sub.description ? (
                  <p className="mt-2 text-sm text-riva-muted">{sub.description}</p>
                ) : null}
                {items.length ? (
                  <ItemGrid items={items} />
                ) : (
                  <EmptyState label={sub.name} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Map top-level slug → section component (unknown slugs use MenuSection). */
export const MENU_SECTION_REGISTRY: Record<
  string,
  (props: MenuSectionProps) => React.JSX.Element
> = {
  "dagens-lunch": DagensLunchSection,
  "rivas-meny": RivasMenySection,
  "take-away": TakeAwaySection,
  "stora-sallskapsmeny": StoraSallskapsmenySection,
  "snacks-drinkar": SnacksDrinkarSection,
  dryck: DryckSection,
};
