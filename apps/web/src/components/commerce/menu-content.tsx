"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/commerce/product-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StateMessage } from "@/components/ui/state-message";
import type { Category, Product } from "@/lib/api";

interface MenuContentProps {
  categories: Category[];
  products: Product[];
}

export function MenuContent({ categories, products }: MenuContentProps) {
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category_slug === active);
  }, [active, products]);

  if (products.length === 0) {
    return (
      <StateMessage
        variant="empty"
        title="Menyn är inte tillgänglig"
        description="Kontrollera att backend-tjänsten körs och att menyn är seedad."
      />
    );
  }

  return (
    <Tabs value={active} onValueChange={setActive}>
      <TabsList className="mb-8 w-full justify-start">
        <TabsTrigger value="all">Alla</TabsTrigger>
        {categories.map((cat) => (
          <TabsTrigger key={cat.slug} value={cat.slug}>
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {["all", ...categories.map((c) => c.slug)].map((tab) => (
        <TabsContent key={tab} value={tab}>
          {filtered.length === 0 ? (
            <StateMessage variant="empty" title="Inga produkter i denna kategori" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
