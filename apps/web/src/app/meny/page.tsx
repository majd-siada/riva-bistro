import { Suspense } from "react";

import { WaveDivider } from "@/components/brand/wave-divider";
import { MenuContent } from "@/components/commerce/menu-content";
import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories, fetchProducts } from "@/lib/api";

export const metadata = {
  title: "Meny",
};

export default async function MenuPage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];

  try {
    [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  } catch {
    categories = [];
    products = [];
  }

  return (
    <Section className="pt-24">
      <div className="mb-10 text-center md:text-left">
        <p className="riva-label">Mat &amp; dryck</p>
        <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">Menyn</h1>
        <WaveDivider className="mt-6 max-w-xs" />
        <p className="mt-4 max-w-xl text-riva-mist">
          Alla priser inkluderar moms. Tillgänglighet uppdateras i realtid.
        </p>
      </div>
      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent categories={categories} products={products} />
      </Suspense>
    </Section>
  );
}

function MenuSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full" />
      ))}
    </div>
  );
}
