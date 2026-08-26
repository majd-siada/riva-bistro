import Link from "next/link";

import { OrderStatusTimeline } from "@/components/commerce/order-status-timeline";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAccountOrder } from "@/lib/api";

const STATUS_STEPS = [
  { key: "confirmed", label: "Bekräftad" },
  { key: "preparing", label: "Tillagas" },
  { key: "ready", label: "Klar" },
  { key: "delivered", label: "Levererad" },
];

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function AccountOrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { email } = await searchParams;

  if (!email) {
    return (
      <Section className="pt-24">
        <StateMessage variant="error" title="E-post krävs" description="Gå tillbaka till kontot och ange din e-post." />
      </Section>
    );
  }

  let order;
  try {
    order = await fetchAccountOrder(Number(id), email);
  } catch {
    return (
      <Section className="pt-24">
        <StateMessage variant="error" title="Order hittades inte" />
      </Section>
    );
  }

  const steps = STATUS_STEPS.map((s) => {
    const orderKeys = STATUS_STEPS.map((x) => x.key);
    const cur = orderKeys.indexOf(order.status);
    const idx = orderKeys.indexOf(s.key);
    return {
      label: s.label,
      status: (idx < cur ? "complete" : idx === cur ? "active" : "pending") as
        | "complete"
        | "active"
        | "pending",
    };
  });

  return (
    <Section className="pt-24">
      <div className="flex items-start justify-between">
        <div>
          <p className="riva-label">Orderdetalj</p>
          <h1 className="mt-2 font-display text-4xl text-riva-ivory">{order.ref}</h1>
        </div>
        <Badge variant="preparing">{order.status}</Badge>
      </div>

      <OrderStatusTimeline steps={steps} className="mt-10" />

      <div className="mt-10 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6">
        <ul className="space-y-3">
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
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-riva-mist">
            <span>Exkl. moms</span>
            <span>{order.subtotal_ex_vat} kr</span>
          </div>
          <div className="flex justify-between text-riva-mist">
            <span>Moms</span>
            <span>{order.vat_total} kr</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-riva-ivory">
            <span>Totalt</span>
            <span>{order.total_inc_vat} kr</span>
          </div>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/konto">Tillbaka till konto</Link>
      </Button>
    </Section>
  );
}
