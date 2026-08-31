"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateMessage } from "@/components/ui/state-message";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminUpdateCategory,
  adminUpdateProduct,
  adminUploadProductImage,
  type AdminCategory,
  type AdminProduct,
} from "@/lib/admin-api";

const VAT = 0.12;
const incFromBase = (base: string, rate: string) =>
  Math.round(Number(base) * (1 + Number(rate || VAT)));
const baseFromInc = (inc: number, rate: number) => (inc / (1 + (rate || VAT))).toFixed(2);

type Draft = {
  id?: number;
  category: number | "";
  name: string;
  description: string;
  priceInc: string;
  is_available: boolean;
  is_featured: boolean;
  featured_order: number;
  vat_rate: string;
};

const emptyDraft = (categoryId?: number): Draft => ({
  category: categoryId ?? "",
  name: "",
  description: "",
  priceInc: "",
  is_available: true,
  is_featured: false,
  featured_order: 0,
  vat_rate: String(VAT),
});

export default function AdminMenuPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const reload = async () => {
    const [p, c] = await Promise.all([adminListProducts(), adminListCategories()]);
    setProducts(p);
    setCategories(c);
  };

  useEffect(() => {
    reload()
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const toggleProduct = async (p: AdminProduct, field: "is_available" | "is_featured") => {
    try {
      const updated = await adminUpdateProduct(p.id, { [field]: !p[field] });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      toast.error("Kunde inte uppdatera.");
    }
  };

  const saveDraft = async () => {
    if (!draft || draft.category === "" || !draft.name.trim() || !draft.priceInc) {
      toast.error("Fyll i namn, kategori och pris.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category: Number(draft.category),
        name: draft.name.trim(),
        description: draft.description.trim(),
        base_price: baseFromInc(Number(draft.priceInc), Number(draft.vat_rate)),
        vat_rate: draft.vat_rate,
        is_available: draft.is_available,
        is_featured: draft.is_featured,
        featured_order: draft.featured_order,
      };
      if (draft.id) {
        await adminUpdateProduct(draft.id, payload);
      } else {
        await adminCreateProduct(payload);
      }
      await reload();
      setDraft(null);
      toast.success("Rätten sparad.");
    } catch {
      toast.error("Kunde inte spara rätten.");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p: AdminProduct) => {
    if (!confirm(`Ta bort ${p.name}?`)) return;
    try {
      await adminDeleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      toast.error("Kunde inte ta bort rätten.");
    }
  };

  const uploadImage = async (id: number, file: File) => {
    try {
      const updated = await adminUploadProductImage(id, file);
      setProducts((prev) => prev.map((x) => (x.id === id ? updated : x)));
      toast.success("Bild uppladdad.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte ladda upp bilden.");
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await adminCreateCategory({
        name: newCategory.trim(),
        sort_order: categories.length,
      });
      setCategories((prev) => [...prev, created]);
      setNewCategory("");
      toast.success("Kategori tillagd.");
    } catch {
      toast.error("Kunde inte lägga till kategori.");
    }
  };

  const saveCategoryName = async (c: AdminCategory, name: string) => {
    if (name === c.name || !name.trim()) return;
    try {
      const updated = await adminUpdateCategory(c.id, { name: name.trim() });
      setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch {
      toast.error("Kunde inte uppdatera kategorin.");
    }
  };

  const removeCategory = async (c: AdminCategory) => {
    if (!confirm(`Ta bort kategorin ${c.name}? Detta går bara om den är tom.`)) return;
    try {
      await adminDeleteCategory(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      toast.error("Kategorin måste vara tom för att tas bort.");
    }
  };

  if (loading) return <p className="text-riva-taupe">Laddar…</p>;
  if (error) return <StateMessage variant="error" title="Kunde inte ladda menyn" />;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-riva-ink">Meny</h1>
          <p className="mt-1 text-riva-taupe">Hantera rätter, priser och utvalda dishes.</p>
        </div>
        <Button variant="gold" onClick={() => setDraft(emptyDraft(categories[0]?.id))}>
          Ny rätt
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-riva-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-riva-cream-2 text-left text-riva-taupe">
            <tr>
              <th className="px-4 py-3 font-medium">Namn</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Pris</th>
              <th className="px-4 py-3 font-medium">Tillgänglig</th>
              <th className="px-4 py-3 font-medium">Utvald</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-riva-ink/10">
            {products.map((p) => (
              <tr key={p.id} className="bg-riva-ivory">
                <td className="px-4 py-3 font-medium text-riva-ink">{p.name}</td>
                <td className="px-4 py-3 text-riva-taupe">{p.category_name}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPrice(incFromBase(p.base_price, p.vat_rate ?? String(VAT)))}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={p.is_available}
                    onChange={() => void toggleProduct(p, "is_available")}
                    className="h-5 w-5 accent-riva-teal"
                    aria-label={`${p.name} tillgänglig`}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={p.is_featured}
                    onChange={() => void toggleProduct(p, "is_featured")}
                    className="h-5 w-5 accent-riva-gold"
                    aria-label={`${p.name} utvald`}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDraft({
                          id: p.id,
                          category: p.category,
                          name: p.name,
                          description: p.description ?? "",
                          priceInc: String(incFromBase(p.base_price, p.vat_rate ?? String(VAT))),
                          is_available: p.is_available ?? true,
                          is_featured: p.is_featured ?? false,
                          featured_order: p.featured_order ?? 0,
                          vat_rate: p.vat_rate ?? String(VAT),
                        })
                      }
                    >
                      Redigera
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Ta bort ${p.name}`}
                      onClick={() => void removeProduct(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Categories */}
      <section className="border-t border-riva-ink/10 pt-10">
        <h2 className="font-display text-2xl text-riva-ink">Kategorier</h2>
        <div className="mt-4 max-w-2xl space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-md border border-riva-ink/10 bg-riva-ivory px-3 py-2"
            >
              <Input
                defaultValue={c.name}
                onBlur={(e) => void saveCategoryName(c, e.target.value)}
                className="h-9 flex-1"
                aria-label="Kategorinamn"
              />
              <span className="text-xs text-riva-taupe">{c.product_count} rätter</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Ta bort ${c.name}`}
                onClick={() => void removeCategory(c)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Ny kategori"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="h-9 flex-1"
            />
            <Button variant="outline" onClick={() => void addCategory()}>
              Lägg till
            </Button>
          </div>
        </div>
      </section>

      {/* Product editor */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {draft && (
            <>
              <DialogHeader>
                <DialogTitle>{draft.id ? "Redigera rätt" : "Ny rätt"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="d-name">Namn</Label>
                  <Input
                    id="d-name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="d-cat">Kategori</Label>
                    <Select
                      value={draft.category === "" ? "" : String(draft.category)}
                      onValueChange={(v) => setDraft({ ...draft, category: Number(v) })}
                    >
                      <SelectTrigger id="d-cat" className="mt-1.5">
                        <SelectValue placeholder="Välj kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="d-price">Pris (kr, inkl. moms)</Label>
                    <Input
                      id="d-price"
                      type="number"
                      min={0}
                      value={draft.priceInc}
                      onChange={(e) => setDraft({ ...draft, priceInc: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="d-desc">Beskrivning</Label>
                  <Textarea
                    id="d-desc"
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-riva-ink">
                    <input
                      type="checkbox"
                      checked={draft.is_available}
                      onChange={(e) => setDraft({ ...draft, is_available: e.target.checked })}
                      className="h-5 w-5 accent-riva-teal"
                    />
                    Tillgänglig
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-riva-ink">
                    <input
                      type="checkbox"
                      checked={draft.is_featured}
                      onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                      className="h-5 w-5 accent-riva-gold"
                    />
                    Utvald på startsidan
                  </label>
                </div>
                {draft.id && (
                  <div>
                    <Label htmlFor="d-image">Bild (JPG, PNG, WebP)</Label>
                    <input
                      id="d-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && draft.id) void uploadImage(draft.id, file);
                      }}
                      className="mt-1.5 block w-full text-sm text-riva-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-riva-ink file:px-4 file:py-2 file:text-riva-ivory"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  Avbryt
                </Button>
                <Button variant="gold" loading={saving} onClick={() => void saveDraft()}>
                  Spara
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
