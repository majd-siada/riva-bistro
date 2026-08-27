"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { PriceDisplay } from "@/components/commerce/price-display";
import { WaveDivider } from "@/components/brand/wave-divider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [pendingRemoval, setPendingRemoval] = useState<{
    id: number;
    name: string;
  } | null>(null);

  return (
    <Section className="pt-24">
      <p className="riva-label">Din beställning</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory">Varukorg</h1>
      <WaveDivider className="mt-6 max-w-xs" />

      <div className="mt-10">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !cart?.lines.length ? (
          <StateMessage
            variant="empty"
            title="Varukorgen är tom"
            description="Lägg till rätter från menyn för att fortsätta."
            action={
              <Button asChild>
                <Link href="/meny">Utforska menyn</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            <ul className="space-y-4 lg:col-span-2">
              {cart.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex flex-col gap-4 rounded-md border border-riva-ivory/10 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-riva-ivory">{line.product_name}</p>
                    {line.selected_modifiers?.length > 0 && (
                      <p className="mt-1 text-xs text-riva-mist">
                        {line.selected_modifiers.map((m) => m.name).join(", ")}
                      </p>
                    )}
                    <PriceDisplay priceIncVat={line.line_pricing.price_inc_vat} size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void updateItem(line.id, Math.max(1, line.quantity - 1))}
                    >
                      −
                    </Button>
                    <span className="tabular-nums">{line.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void updateItem(line.id, line.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPendingRemoval({
                          id: line.id,
                          name: line.product_name,
                        })
                      }
                      aria-label={`Ta bort ${line.product_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6 lg:sticky lg:top-24 lg:self-start">
              <h2 className="font-display text-xl text-riva-ivory">Sammanfattning</h2>
              <div className="mt-4 space-y-2 text-sm text-riva-mist">
                <div className="flex justify-between">
                  <span>Exkl. moms</span>
                  <span className="tabular-nums">{formatPrice(cart.totals.subtotal_ex_vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moms (25%)</span>
                  <span className="tabular-nums">{formatPrice(cart.totals.vat_total)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-semibold text-riva-ivory">
                  <span>Totalt inkl. moms</span>
                  <span className="tabular-nums">{formatPrice(cart.totals.total_inc_vat)}</span>
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href="/kassa">Gå till kassan</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
        title="Ta bort ur varukorgen?"
        description={
          pendingRemoval
            ? `Vill du ta bort ${pendingRemoval.name} från din beställning?`
            : undefined
        }
        confirmLabel="Ta bort"
        destructive
        onConfirm={() => {
          if (pendingRemoval) void removeItem(pendingRemoval.id);
          setPendingRemoval(null);
        }}
      />
    </Section>
  );
}
