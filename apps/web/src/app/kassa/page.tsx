"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { WaveDivider } from "@/components/brand/wave-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { StateMessage } from "@/components/ui/state-message";
import { useCart } from "@/contexts/cart-context";
import { checkout } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await checkout(form);
      router.push(`/order/${order.ref}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Betalningen misslyckades");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !cart?.lines.length) {
    return (
      <Section className="pt-24">
        <StateMessage
          variant="empty"
          title="Ingen varukorg att betala"
          action={
            <Button onClick={() => router.push("/meny")}>Till menyn</Button>
          }
        />
      </Section>
    );
  }

  return (
    <Section className="pt-24">
      <p className="riva-label">Checkout</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory">Kassa</h1>
      <WaveDivider className="mt-6 max-w-xs" />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="notes">Meddelande till köket</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1.5"
            />
          </div>
          {error && (
            <StateMessage variant="error" title="Något gick fel" description={error} />
          )}
          <Button type="submit" loading={submitting} className="w-full">
            Betala {cart ? formatPrice(cart.totals.total_inc_vat) : ""}
          </Button>
          <p className="text-xs text-riva-mist">
            Betalning hanteras säkert. Moms redovisas på kvittot.
          </p>
        </form>

        <aside className="rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6">
          <h2 className="font-display text-xl text-riva-ivory">Ordersammanfattning</h2>
          <ul className="mt-4 space-y-3">
            {cart?.lines.map((line) => (
              <li key={line.id} className="flex justify-between text-sm">
                <span className="text-riva-mist">
                  {line.quantity}× {line.product_name}
                </span>
                <span className="tabular-nums text-riva-ivory">
                  {formatPrice(line.line_pricing.price_inc_vat)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="space-y-1 text-sm text-riva-mist">
            <div className="flex justify-between">
              <span>Exkl. moms</span>
              <span>{formatPrice(cart?.totals.subtotal_ex_vat ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Moms</span>
              <span>{formatPrice(cart?.totals.vat_total ?? 0)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-riva-ivory">
              <span>Totalt</span>
              <span>{formatPrice(cart?.totals.total_inc_vat ?? 0)}</span>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
