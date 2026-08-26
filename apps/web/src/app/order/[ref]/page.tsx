import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { OrderStatusTimeline } from "@/components/commerce/order-status-timeline";
import { WaveDivider } from "@/components/brand/wave-divider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { StateMessage } from "@/components/ui/state-message";
import { fetchOrder } from "@/lib/api";

const STATUS_STEPS = [
  { key: "confirmed", label: "Bekräftad" },
  { key: "preparing", label: "Tillagas" },
  { key: "ready", label: "Klar" },
  { key: "delivered", label: "Levererad" },
];

function getStepStatus(
  stepKey: string,
  currentStatus: string,
): "complete" | "active" | "pending" {
  const order = STATUS_STEPS.map((s) => s.key);
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepKey);
  if (stepIdx < currentIdx) return "complete";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

interface Props {
  params: Promise<{ ref: string }>;
}

export default async function OrderPage({ params }: Props) {
  const { ref } = await params;
  let order;
  try {
    order = await fetchOrder(ref);
  } catch {
    return (
      <Section className="pt-24">
        <StateMessage variant="error" title="Order hittades inte" description={`Referens ${ref} kunde inte hittas.`} />
      </Section>
    );
  }

  const steps = STATUS_STEPS.map((s) => ({
    label: s.label,
    status: getStepStatus(s.key, order.status),
  }));

  return (
    <Section className="pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-riva-success" aria-hidden="true" />
        <p className="riva-label mt-6">Tack för din beställning</p>
        <h1 className="mt-2 font-display text-4xl text-riva-ivory">Order {order.ref}</h1>
        <WaveDivider className="mx-auto mt-6 max-w-xs" />
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="available">{order.payment_status === "paid" ? "Betald" : "Väntar"}</Badge>
          <Badge variant="preparing">{order.status}</Badge>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="font-display text-xl text-riva-ivory">Orderstatus</h2>
        <OrderStatusTimeline steps={steps} className="mt-6" />

        <div className="mt-10 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6">
          <h2 className="font-display text-xl text-riva-ivory">Dina artiklar</h2>
          <ul className="mt-4 space-y-3">
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
          <p className="mt-1 text-xs text-riva-mist">
            Varav moms {order.vat_total} kr
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/konto">Mitt konto</Link>
          </Button>
          <Button asChild>
            <Link href="/meny">Beställ igen</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
