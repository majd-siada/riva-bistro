import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminCategories } from "@/lib/api";

export const metadata = { title: "Admin — Kategorier" };

export default async function AdminCategoriesPage() {
  let categories;
  try {
    categories = await fetchAdminCategories();
  } catch {
    return <StateMessage variant="error" title="Kunde inte ladda kategorier" />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Kategorier</h1>
      <div className="mt-8 overflow-hidden rounded-md border border-riva-ivory/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Produkter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-riva-mist">{c.slug}</TableCell>
                <TableCell>{c.product_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
