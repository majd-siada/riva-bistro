"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { PriceDisplay } from "@/components/commerce/price-display";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/format";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, loading, updateItem, removeItem } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Varukorg</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !cart?.lines.length ? (
            <StateMessage
              variant="empty"
              title="Varukorgen är tom"
              description="Utforska vår meny och lägg till dina favoriter."
              action={
                <Link href="/meny" onClick={() => onOpenChange(false)}>
                  <Button>Se menyn</Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <li key={line.id} className="rounded-md border border-riva-ivory/10 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-riva-ivory">{line.product_name}</p>
                      {line.selected_modifiers?.length > 0 && (
                        <p className="mt-1 text-xs text-riva-mist">
                          {line.selected_modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      <PriceDisplay priceIncVat={line.line_pricing.price_inc_vat} size="sm" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void removeItem(line.id)}
                      aria-label="Ta bort"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => void updateItem(line.id, Math.max(1, line.quantity - 1))}
                      aria-label="Minska antal"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center tabular-nums">{line.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => void updateItem(line.id, line.quantity + 1)}
                      aria-label="Öka antal"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart && cart.lines.length > 0 && (
          <div className="border-t border-riva-ivory/10 pt-4">
            <div className="mb-4 space-y-1 text-sm text-riva-mist">
              <div className="flex justify-between">
                <span>Delsumma exkl. moms</span>
                <span className="tabular-nums">{formatPrice(cart.totals.subtotal_ex_vat)}</span>
              </div>
              <div className="flex justify-between">
                <span>Moms</span>
                <span className="tabular-nums">{formatPrice(cart.totals.vat_total)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold text-riva-ivory">
                <span>Totalt</span>
                <span className="tabular-nums">{formatPrice(cart.totals.total_inc_vat)}</span>
              </div>
            </div>
            <Link href="/kassa" onClick={() => onOpenChange(false)} className="block">
              <Button className="w-full">Till kassan</Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
