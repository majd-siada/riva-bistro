"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminOrder, updateAdminOrderStatus, type Order } from "@/lib/api";

const STATUSES = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void params.then(async ({ id }) => {
      setOrderId(Number(id));
      try {
        const data = await fetchAdminOrder(Number(id));
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  const handleStatusChange = async (status: string) => {
    if (!orderId) return;
    setUpdating(true);
    try {
      const updated = await updateAdminOrderStatus(orderId, status);
      setOrder(updated);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <StateMessage variant="loading" title="Laddar order..." />;
  if (!order) return <StateMessage variant="error" title="Order hittades inte" />;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/ordrar">← Tillbaka</Link>
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-riva-ivory">{order.ref}</h1>
          <p className="mt-1 text-riva-mist">
            {order.customer_name} · {order.customer_email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="preparing">{order.status}</Badge>
          <Select value={order.status} onValueChange={(v) => void handleStatusChange(v)} disabled={updating}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Uppdatera status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6">
        <h2 className="font-display text-xl text-riva-ivory">Orderrader</h2>
        <ul className="mt-4 space-y-2">
          {order.lines.map((line, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-riva-mist">
                {line.quantity}× {line.product_name}
              </span>
              <span className="tabular-nums text-riva-ivory">{line.line_total_inc_vat} kr</span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex justify-between font-semibold text-riva-ivory">
          <span>Totalt inkl. moms</span>
          <span className="tabular-nums">{order.total_inc_vat} kr</span>
        </div>
      </div>
    </div>
  );
}
