"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { WaveDivider } from "@/components/brand/wave-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAccountOrders, type Order } from "@/lib/api";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("riva_account_email");
    if (saved) {
      setEmail(saved);
      void loadOrders(saved);
    }
  }, []);

  const loadOrders = async (addr: string) => {
    setLoading(true);
    try {
      const data = await fetchAccountOrders(addr);
      setOrders(data);
      localStorage.setItem("riva_account_email", addr);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="pt-24">
      <p className="riva-label">Mitt konto</p>
      <h1 className="mt-2 font-display text-4xl text-riva-ivory">Välkommen tillbaka</h1>
      <WaveDivider className="mt-6 max-w-xs" />

      <form
        className="mt-8 max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void loadOrders(email);
        }}
      >
        <div>
          <Label htmlFor="email">E-postadress</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            placeholder="din@email.se"
          />
        </div>
        <Button type="submit" loading={loading}>
          Visa mina ordrar
        </Button>
      </form>

      {orders !== null && (
        <div className="mt-12">
          <h2 className="font-display text-2xl text-riva-ivory">Orderhistorik</h2>
          {orders.length === 0 ? (
            <StateMessage
              variant="empty"
              title="Inga ordrar hittades"
              description="Beställ från menyn för att se dina ordrar här."
              className="mt-6"
            />
          ) : (
            <ul className="mt-6 space-y-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/konto/ordrar/${order.id}?email=${encodeURIComponent(email)}`}
                    className="flex items-center justify-between rounded-md border border-riva-ivory/10 bg-riva-charcoal p-5 transition-riva hover:border-riva-teal/30"
                  >
                    <div>
                      <p className="font-medium text-riva-ivory">{order.ref}</p>
                      <p className="text-sm text-riva-mist">
                        {new Date(order.created_at).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums font-semibold text-riva-ivory">
                        {order.total_inc_vat} kr
                      </p>
                      <Badge variant="preparing" className="mt-1">
                        {order.status}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  );
}
