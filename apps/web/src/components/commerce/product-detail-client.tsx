"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PriceDisplay } from "@/components/commerce/price-display";
import { ProductImage } from "@/components/commerce/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import type { ModifierGroup, Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(false);

  if (!product) notFound();

  const toggleOption = (group: ModifierGroup, optionId: number) => {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.max_selections === 1) {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= group.max_selections) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  };

  const canAdd = product.is_available && validateSelections(product.modifier_groups ?? [], selections);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const modifiers: { option_id: number; name: string }[] = [];
      for (const group of product.modifier_groups ?? []) {
        for (const optId of selections[group.id] ?? []) {
          const opt = group.options.find((o) => o.id === optId);
          if (opt) modifiers.push({ option_id: opt.id, name: opt.name });
        }
      }
      await addItem(product.id, quantity, modifiers);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {product.image_url && (
        <ProductImage src={product.image_url} alt={product.name} priority aspectRatio="cinematic" />
      )}
      <div>
        <p className="riva-label">{product.category_name}</p>
        <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">{product.name}</h1>
        {!product.is_available && (
          <Badge variant="soldOut" className="mt-4">
            Tillfälligt slut
          </Badge>
        )}
        <p className="mt-4 text-riva-mist">{product.description}</p>
        <div className="mt-6">
          <PriceDisplay
            priceIncVat={product.pricing.price_inc_vat}
            priceExVat={product.pricing.price_ex_vat}
            vatAmount={product.pricing.vat_amount}
            showVatNote
            size="lg"
          />
        </div>

        {(product.modifier_groups ?? []).map((group) => (
          <div key={group.id} className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-riva-ivory">
              {group.name}
              {group.required && <span className="text-riva-gold"> *</span>}
            </h2>
            <div className="mt-3 space-y-3">
              {group.max_selections === 1 ? (
                <RadioGroup
                  value={String(selections[group.id]?.[0] ?? "")}
                  onValueChange={(v) => toggleOption(group, Number(v))}
                >
                  {group.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <RadioGroupItem value={String(opt.id)} id={`opt-${opt.id}`} disabled={!opt.is_available} />
                      <Label htmlFor={`opt-${opt.id}`} className="flex flex-1 cursor-pointer justify-between">
                        <span>{opt.name}</span>
                        {Number(opt.price_delta) > 0 && (
                          <span className="text-riva-mist">+{formatPrice(opt.pricing.price_inc_vat)}</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                group.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`opt-${opt.id}`}
                      checked={(selections[group.id] ?? []).includes(opt.id)}
                      onCheckedChange={() => toggleOption(group, opt.id)}
                      disabled={!opt.is_available}
                    />
                    <Label htmlFor={`opt-${opt.id}`} className="flex flex-1 cursor-pointer justify-between">
                      <span>{opt.name}</span>
                      {Number(opt.price_delta) > 0 && (
                        <span className="text-riva-mist">+{formatPrice(opt.pricing.price_inc_vat)}</span>
                      )}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        <Separator className="my-8" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              −
            </Button>
            <span className="w-8 text-center tabular-nums">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
              +
            </Button>
          </div>
          <Button
            className="flex-1"
            disabled={!canAdd}
            loading={loading}
            onClick={() => void handleAdd()}
          >
            Lägg i varukorg
          </Button>
        </div>
        <Button asChild variant="ghost" className="mt-4 w-full">
          <Link href="/meny">Tillbaka till menyn</Link>
        </Button>
      </div>
    </div>
  );
}

function validateSelections(groups: ModifierGroup[], selections: Record<number, number[]>): boolean {
  for (const group of groups) {
    const count = (selections[group.id] ?? []).length;
    if (group.required && count < group.min_selections) return false;
  }
  return true;
}
