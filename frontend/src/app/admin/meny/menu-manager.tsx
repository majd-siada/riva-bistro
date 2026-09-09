"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteProduct,
  adminEnsureMenuSections,
  adminListCategories,
  adminListProducts,
  adminUpdateCategory,
  adminUpdateProduct,
  adminUploadProductImage,
  type AdminCategory,
  type AdminProduct,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/format";
import { MENU_SECTION_TABS, type MenuSectionSlug } from "@/lib/menu-sections";
import { cn } from "@/lib/utils";

const VAT = 0.12;
const DEFAULT_SECTION: MenuSectionSlug = "rivas-meny";

const incFromBase = (base: string, rate: string) =>
  Math.round(Number(base) * (1 + Number(rate || VAT)));
const baseFromInc = (inc: number, rate: number) =>
  (inc / (1 + (rate || VAT))).toFixed(2);

function isMenuSectionSlug(value: string | null): value is MenuSectionSlug {
  return MENU_SECTION_TABS.some((tab) => tab.slug === value);
}

type Draft = {
  id?: number;
  category: number | "";
  name: string;
  description: string;
  priceInc: string;
  sort_order: number;
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
  sort_order: 0,
  is_available: true,
  is_featured: false,
  featured_order: 0,
  vat_rate: String(VAT),
});

type Props = {
  lockedSection?: MenuSectionSlug;
  title?: string;
  description?: string;
};

export default function AdminMenuManager({
  lockedSection,
  title = "Meny",
  description = "Flikarna speglar de sex sektionerna på /meny. Välj en flik för att hantera just den publika sektionen.",
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramSection = searchParams.get("section");
  const sectionSlug: MenuSectionSlug =
    lockedSection ??
    (isMenuSectionSlug(paramSection) ? paramSection : DEFAULT_SECTION);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [sectionDraft, setSectionDraft] = useState({
    name: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const reload = async () => {
    await adminEnsureMenuSections();
    const [p, c] = await Promise.all([adminListProducts(), adminListCategories()]);
    setProducts(p);
    setCategories(c);
  };

  useEffect(() => {
    reload()
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const createMissingSection = async () => {
    try {
      await adminEnsureMenuSections();
      await reload();
      toast.success("Menysektioner skapades.");
    } catch {
      toast.error("Kunde inte skapa sektionen.");
    }
  };

  const sectionRoot = useMemo(
    () => categories.find((c) => c.slug === sectionSlug) ?? null,
    [categories, sectionSlug],
  );

  const sectionCategories = useMemo(() => {
    if (!sectionRoot) return [] as AdminCategory[];
    return categories.filter(
      (c) =>
        c.id === sectionRoot.id ||
        c.parent === sectionRoot.id ||
        c.parent_slug === sectionSlug,
    );
  }, [categories, sectionRoot, sectionSlug]);

  const sectionCategoryIds = useMemo(
    () => new Set(sectionCategories.map((c) => c.id)),
    [sectionCategories],
  );

  const childCategories = useMemo(
    () =>
      sectionCategories
        .filter((c) => c.id !== sectionRoot?.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)),
    [sectionCategories, sectionRoot],
  );

  const productCategories = useMemo(() => {
    if (sectionSlug === "rivas-meny") {
      return childCategories.length ? childCategories : sectionCategories;
    }
    return sectionCategories;
  }, [sectionSlug, childCategories, sectionCategories]);

  const sectionProducts = useMemo(
    () =>
      products
        .filter((p) => sectionCategoryIds.has(p.category))
        .sort(
          (a, b) =>
            (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name),
        ),
    [products, sectionCategoryIds],
  );

  useEffect(() => {
    if (!sectionRoot) {
      setSectionDraft({ name: "", description: "", sort_order: 0, is_active: true });
      return;
    }
    setSectionDraft({
      name: sectionRoot.name,
      description: sectionRoot.description ?? "",
      sort_order: sectionRoot.sort_order ?? 0,
      is_active: sectionRoot.is_active ?? true,
    });
  }, [sectionRoot]);

  const setSectionTab = (slug: MenuSectionSlug) => {
    if (lockedSection) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", slug);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleProduct = async (p: AdminProduct, field: "is_available" | "is_featured") => {
    try {
      const updated = await adminUpdateProduct(p.id, { [field]: !p[field] });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      toast.error("Kunde inte uppdatera.");
    }
  };

  const saveSection = async () => {
    if (!sectionRoot) return;
    if (!sectionDraft.name.trim()) {
      toast.error("Sektionsnamn krävs.");
      return;
    }
    setSavingSection(true);
    try {
      const updated = await adminUpdateCategory(sectionRoot.id, {
        name: sectionDraft.name.trim(),
        description: sectionDraft.description.trim(),
        sort_order: Number(sectionDraft.sort_order) || 0,
        is_active: sectionDraft.is_active,
      });
      setCategories((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success("Sektion sparad.");
    } catch {
      toast.error("Kunde inte spara sektionen.");
    } finally {
      setSavingSection(false);
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
        sort_order: Number(draft.sort_order) || 0,
        is_available: draft.is_available,
        is_featured: draft.is_featured,
        featured_order: Number(draft.featured_order) || 0,
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

  const addChildCategory = async () => {
    if (!sectionRoot || sectionSlug !== "rivas-meny") return;
    if (!newCategory.trim()) return;
    try {
      const created = await adminCreateCategory({
        name: newCategory.trim(),
        sort_order: childCategories.length,
        parent: sectionRoot.id,
        is_active: true,
      });
      setCategories((prev) => [...prev, created]);
      setNewCategory("");
      toast.success("Kategori tillagd.");
    } catch {
      toast.error("Kunde inte lägga till kategori.");
    }
  };

  const saveCategoryField = async (
    c: AdminCategory,
    patch: Partial<Pick<AdminCategory, "name" | "sort_order" | "is_active">>,
  ) => {
    try {
      const updated = await adminUpdateCategory(c.id, patch);
      setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch {
      toast.error("Kunde inte uppdatera kategorin.");
    }
  };

  const saveCategoryName = async (c: AdminCategory, name: string) => {
    if (name === c.name || !name.trim()) return;
    await saveCategoryField(c, { name: name.trim() });
  };

  const saveCategorySort = async (c: AdminCategory, sortOrder: number) => {
    if (sortOrder === (c.sort_order ?? 0)) return;
    await saveCategoryField(c, { sort_order: sortOrder });
  };

  const toggleCategoryActive = async (c: AdminCategory) => {
    await saveCategoryField(c, { is_active: !(c.is_active ?? true) });
  };

  const removeCategory = async (c: AdminCategory) => {
    if (sectionRoot && c.id === sectionRoot.id) return;
    if (!confirm(`Ta bort kategorin ${c.name}? Detta går bara om den är tom.`)) return;
    try {
      await adminDeleteCategory(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      toast.error("Kategorin måste vara tom för att tas bort.");
    }
  };

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error) return <StateMessage variant="error" title="Kunde inte ladda menyn" />;

  const defaultCategoryId =
    productCategories[0]?.id ?? sectionRoot?.id ?? categories[0]?.id;

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-riva-cream">{title}</h1>
          <p className="mt-1 text-riva-muted">{description}</p>
        </div>
        <Button
          variant="gold"
          onClick={() => setDraft(emptyDraft(defaultCategoryId))}
          disabled={!sectionRoot}
        >
          Ny rätt
        </Button>
      </div>

      {!lockedSection && (
        <nav
          className="flex gap-1 overflow-x-auto border-b border-riva-cream/10"
          aria-label="Menysektioner"
        >
          {MENU_SECTION_TABS.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setSectionTab(tab.slug)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-riva",
                sectionSlug === tab.slug
                  ? "border-riva-gold text-riva-cream"
                  : "border-transparent text-riva-muted hover:text-riva-cream",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {!sectionRoot ? (
        <div className="space-y-4">
          <StateMessage
            variant="error"
            title="Sektionen saknas"
            description={`Ingen kategori med slug “${sectionSlug}” hittades.`}
          />
          <Button variant="gold" onClick={() => void createMissingSection()}>
            Skapa menysektioner
          </Button>
        </div>
      ) : (
        <section className="rounded-lg border border-riva-cream/10 bg-riva-card p-5">
          <h2 className="font-display text-2xl text-riva-cream">Sektion</h2>
          <p className="mt-1 text-sm text-riva-muted">
            Publik sektion:{" "}
            <span className="font-mono text-riva-cream/80">/meny#{sectionSlug}</span>
            . Redigera namn, beskrivning och synlighet för den här toppsektionen.
            {sectionSlug === "dagens-lunch"
              ? " Veckonummer sätts i Namn (t.ex. Dagens lunch v.36)."
              : null}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sec-name">Namn</Label>
              <Input
                id="sec-name"
                className="mt-1.5"
                value={sectionDraft.name}
                onChange={(e) => setSectionDraft({ ...sectionDraft, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sec-sort">Sortering</Label>
              <Input
                id="sec-sort"
                type="number"
                className="mt-1.5"
                value={sectionDraft.sort_order}
                onChange={(e) =>
                  setSectionDraft({
                    ...sectionDraft,
                    sort_order: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="sec-desc">Beskrivning</Label>
              <Textarea
                id="sec-desc"
                className="mt-1.5"
                value={sectionDraft.description}
                onChange={(e) =>
                  setSectionDraft({ ...sectionDraft, description: e.target.value })
                }
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
              <input
                type="checkbox"
                className="h-5 w-5 accent-riva-gold"
                checked={sectionDraft.is_active}
                onChange={(e) =>
                  setSectionDraft({ ...sectionDraft, is_active: e.target.checked })
                }
              />
              Aktiv (synlig på /meny)
            </label>
          </div>
          <div className="mt-4">
            <Button variant="gold" loading={savingSection} onClick={() => void saveSection()}>
              Spara sektion
            </Button>
          </div>
        </section>
      )}

      <div className="overflow-x-auto rounded-lg border border-riva-cream/10">
        <table className="w-full text-sm">
          <thead className="bg-riva-surface text-left text-riva-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Namn</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Pris</th>
              <th className="px-4 py-3 font-medium">Sortering</th>
              <th className="px-4 py-3 font-medium">Tillgänglig</th>
              <th className="px-4 py-3 font-medium">Utvald</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-riva-cream/10">
            {sectionProducts.length === 0 ? (
              <tr className="bg-riva-card">
                <td colSpan={7} className="px-4 py-6 text-riva-muted">
                  Inga rätter i den här sektionen ännu.
                </td>
              </tr>
            ) : (
              sectionProducts.map((p) => (
                <tr key={p.id} className="bg-riva-card">
                  <td className="px-4 py-3 font-medium text-riva-cream">{p.name}</td>
                  <td className="px-4 py-3 text-riva-muted">{p.category_name}</td>
                  <td className="px-4 py-3 tabular-nums text-riva-cream">
                    {formatPrice(incFromBase(p.base_price, p.vat_rate ?? String(VAT)))}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-riva-muted">
                    {p.sort_order ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={p.is_available}
                      onChange={() => void toggleProduct(p, "is_available")}
                      className="h-5 w-5 accent-riva-gold"
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
                            priceInc: String(
                              incFromBase(p.base_price, p.vat_rate ?? String(VAT)),
                            ),
                            sort_order: p.sort_order ?? 0,
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="border-t border-riva-cream/10 pt-10">
        <h2 className="font-display text-2xl text-riva-cream">Kategorier</h2>
        <p className="mt-1 text-sm text-riva-muted">
          Underkategorier i den här sektionen
          {sectionSlug === "rivas-meny" ? " (t.ex. Förrätter under RIVAS MENY)." : "."}
        </p>
        <div className="mt-4 max-w-3xl space-y-2">
          {childCategories.length === 0 ? (
            <p className="text-sm text-riva-muted">Inga underkategorier.</p>
          ) : (
            childCategories.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-riva-cream/10 bg-riva-card px-3 py-2"
              >
                <Input
                  defaultValue={c.name}
                  onBlur={(e) => void saveCategoryName(c, e.target.value)}
                  className="h-9 min-w-[10rem] flex-1"
                  aria-label="Kategorinamn"
                />
                <Input
                  type="number"
                  defaultValue={c.sort_order ?? 0}
                  onBlur={(e) => void saveCategorySort(c, Number(e.target.value) || 0)}
                  className="h-9 w-24"
                  aria-label={`Sortering för ${c.name}`}
                />
                <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-riva-gold"
                    checked={c.is_active ?? true}
                    onChange={() => void toggleCategoryActive(c)}
                    aria-label={`${c.name} aktiv`}
                  />
                  Aktiv
                </label>
                <span className="text-xs text-riva-muted">{c.product_count} rätter</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ta bort ${c.name}`}
                  onClick={() => void removeCategory(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}

          {sectionSlug === "rivas-meny" && sectionRoot && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Input
                placeholder="Ny underkategori"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-9 min-w-[10rem] flex-1"
              />
              <Button variant="outline" onClick={() => void addChildCategory()}>
                Lägg till
              </Button>
            </div>
          )}
        </div>
      </section>

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
                        {productCategories.map((c) => (
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
                  <div>
                    <Label htmlFor="d-sort">Sortering</Label>
                    <Input
                      id="d-sort"
                      type="number"
                      value={draft.sort_order}
                      onChange={(e) =>
                        setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="d-featured-order">Utvald ordning</Label>
                    <Input
                      id="d-featured-order"
                      type="number"
                      value={draft.featured_order}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          featured_order: Number(e.target.value) || 0,
                        })
                      }
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
                  <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
                    <input
                      type="checkbox"
                      checked={draft.is_available}
                      onChange={(e) =>
                        setDraft({ ...draft, is_available: e.target.checked })
                      }
                      className="h-5 w-5 accent-riva-gold"
                    />
                    Tillgänglig
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
                    <input
                      type="checkbox"
                      checked={draft.is_featured}
                      onChange={(e) =>
                        setDraft({ ...draft, is_featured: e.target.checked })
                      }
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
                      className="mt-1.5 block w-full text-sm text-riva-muted file:mr-3 file:rounded-md file:border-0 file:bg-riva-gold file:px-4 file:py-2 file:text-riva-black"
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
