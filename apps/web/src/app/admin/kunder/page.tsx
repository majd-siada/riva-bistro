import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminCustomers } from "@/lib/api";

export const metadata = { title: "Admin — Kunder" };

export default async function AdminCustomersPage() {
  let customers;
  try {
    customers = await fetchAdminCustomers();
  } catch {
    return <StateMessage variant="error" title="Kunde inte ladda kunder" />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Kunder</h1>
      <div className="mt-8 overflow-hidden rounded-md border border-riva-ivory/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-right">Ordrar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{c.order_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
