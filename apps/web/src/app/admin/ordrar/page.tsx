import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminOrders } from "@/lib/api";

export const metadata = { title: "Admin — Ordrar" };

export default async function AdminOrdersPage() {
  let orders;
  try {
    orders = await fetchAdminOrders();
  } catch {
    return <StateMessage variant="error" title="Kunde inte ladda ordrar" />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Ordrar</h1>
      <p className="mt-2 text-riva-mist">{orders.length} ordrar</p>

      <div className="mt-8 overflow-hidden rounded-md border border-riva-ivory/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referens</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Betalning</TableHead>
              <TableHead className="text-right">Totalt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-riva-mist">
                  Inga ordrar ännu
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/ordrar/${order.id}`} className="text-riva-teal hover:underline">
                      {order.ref}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant="preparing">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.payment_status === "paid" ? "available" : "secondary"}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{order.total_inc_vat} kr</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
