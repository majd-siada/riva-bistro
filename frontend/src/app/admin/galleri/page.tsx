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
import { StateMessage } from "@/components/ui/state-message";
import { resolveImageUrl } from "@/lib/api";
import {
  adminCreateGallery,
  adminDeleteGallery,
  adminListGallery,
  adminUpdateGallery,
  type AdminGalleryItem,
} from "@/lib/admin-api";

function galleryPreviewSrc(item: Pick<AdminGalleryItem, "src" | "image" | "image_url">) {
  return resolveImageUrl(item.src || item.image || item.image_url || "");
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<
    (Partial<AdminGalleryItem> & { id?: number; file?: File | null }) | null
  >(null);
  const [saving, setSaving] = useState(false);

  const reload = () =>
    adminListGallery().then(setItems).catch(() => setError(true));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!draft?.alt?.trim()) {
      toast.error("Alt-text krävs.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("alt", draft.alt.trim());
      form.append("title", (draft.title ?? "").trim());
      form.append("sort_order", String(draft.sort_order ?? 0));
      form.append("is_published", draft.is_published === false ? "false" : "true");
      if (draft.image_url) form.append("image_url", draft.image_url);
      if (draft.file) form.append("image", draft.file);
      if (draft.id) await adminUpdateGallery(draft.id, form);
      else await adminCreateGallery(form);
      await reload();
      setDraft(null);
      toast.success("Galleriobjekt sparat.");
    } catch {
      toast.error("Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AdminGalleryItem) => {
    if (!confirm(`Ta bort bilden?`)) return;
    try {
      await adminDeleteGallery(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch {
      toast.error("Kunde inte ta bort.");
    }
  };

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error) return <StateMessage variant="error" title="Kunde inte ladda galleriet" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-riva-cream">Galleri</h1>
          <p className="mt-1 text-riva-muted">
            Ladda upp till servern — bilden visas på startsidan och /galleri (spara med
            Publicerad).
          </p>
        </div>
        <Button
          variant="gold"
          onClick={() =>
            setDraft({ alt: "", title: "", sort_order: items.length, is_published: true })
          }
        >
          Ny bild
        </Button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const preview = galleryPreviewSrc(item);
          return (
          <li key={item.id} className="rounded-lg border border-riva-cream/10 bg-riva-card p-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumb; absolute API URL
              <img
                src={preview}
                alt={item.alt}
                className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
              />
            ) : null}
            <p className="font-medium text-riva-cream">{item.alt}</p>
            <p className="mt-1 text-xs text-riva-muted">
              Ordning {item.sort_order} · {item.is_published ? "Publicerad" : "Dold"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft({ ...item })}>
                Redigera
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ta bort"
                onClick={() => void remove(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
          );
        })}
      </ul>

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          {draft && (
            <>
              <DialogHeader>
                <DialogTitle>{draft.id ? "Redigera bild" : "Ny bild"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="g-alt">Alt-text</Label>
                  <Input
                    id="g-alt"
                    className="mt-1.5"
                    value={draft.alt ?? ""}
                    onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="g-title">Titel</Label>
                  <Input
                    id="g-title"
                    className="mt-1.5"
                    value={draft.title ?? ""}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="g-order">Ordning</Label>
                  <Input
                    id="g-order"
                    type="number"
                    className="mt-1.5"
                    value={draft.sort_order ?? 0}
                    onChange={(e) =>
                      setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="g-url">Bild-URL (valfritt)</Label>
                  <Input
                    id="g-url"
                    className="mt-1.5"
                    value={draft.image_url ?? ""}
                    onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="g-file">Ladda upp bild (JPG, PNG, WebP, max 5 MB)</Label>
                  <p className="mt-1 text-xs text-riva-muted">
                    Filen sparas på servern och syns på webbplatsen efter sparning.
                  </p>
                  <input
                    id="g-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-1.5 block w-full text-sm text-riva-muted"
                    onChange={(e) =>
                      setDraft({ ...draft, file: e.target.files?.[0] ?? null })
                    }
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-riva-gold"
                    checked={draft.is_published !== false}
                    onChange={(e) =>
                      setDraft({ ...draft, is_published: e.target.checked })
                    }
                  />
                  Publicerad
                </label>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  Avbryt
                </Button>
                <Button variant="gold" loading={saving} onClick={() => void save()}>
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
