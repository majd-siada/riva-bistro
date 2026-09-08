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
import { Textarea } from "@/components/ui/textarea";
import {
  adminCreateOffer,
  adminDeleteOffer,
  adminListOffers,
  adminUpdateOffer,
  type AdminOffer,
} from "@/lib/admin-api";

type Draft = Partial<AdminOffer> & { id?: number; file?: File | null };

export default function AdminOffersPage() {
  const [items, setItems] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = () =>
    adminListOffers().then(setItems).catch(() => setError(true));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const toLocalInput = (iso: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const save = async () => {
    if (!draft?.title?.trim()) {
      toast.error("Titel krävs.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("title", draft.title.trim());
      form.append("description", (draft.description ?? "").trim());
      form.append("price_label", (draft.price_label ?? "").trim());
      form.append("sort_order", String(draft.sort_order ?? 0));
      form.append("is_active", draft.is_active === false ? "false" : "true");
      if (draft.starts_at) form.append("starts_at", new Date(draft.starts_at).toISOString());
      if (draft.ends_at) form.append("ends_at", new Date(draft.ends_at).toISOString());
      if (draft.image_url) form.append("image_url", draft.image_url);
      if (draft.file) form.append("image", draft.file);
      if (draft.id) await adminUpdateOffer(draft.id, form);
      else await adminCreateOffer(form);
      await reload();
      setDraft(null);
      toast.success("Erbjudande sparat.");
    } catch {
      toast.error("Kunde inte spara. Kontrollera datumintervall.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AdminOffer) => {
    if (!confirm(`Ta bort ${item.title}?`)) return;
    try {
      await adminDeleteOffer(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch {
      toast.error("Kunde inte ta bort.");
    }
  };

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error)
    return <StateMessage variant="error" title="Kunde inte ladda erbjudanden" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-riva-cream">Erbjudanden</h1>
          <p className="mt-1 text-riva-muted">
            Aktiva erbjudanden inom giltighetsperioden visas på startsidan.
          </p>
        </div>
        <Button
          variant="gold"
          onClick={() =>
            setDraft({
              title: "",
              description: "",
              price_label: "",
              is_active: true,
              sort_order: 0,
            })
          }
        >
          Nytt erbjudande
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-riva-cream/10">
        <table className="w-full text-sm">
          <thead className="bg-riva-surface text-left text-riva-muted">
            <tr>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Pris</th>
              <th className="px-4 py-3">Aktiv</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-riva-cream/10">
            {items.map((item) => (
              <tr key={item.id} className="bg-riva-card">
                <td className="px-4 py-3 text-riva-cream">{item.title}</td>
                <td className="px-4 py-3 text-riva-muted">{item.price_label || "—"}</td>
                <td className="px-4 py-3 text-riva-muted">
                  {item.is_active ? "Ja" : "Nej"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setDraft({ ...item })}>
                    Redigera
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Ta bort ${item.title}`}
                    onClick={() => void remove(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {draft && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {draft.id ? "Redigera erbjudande" : "Nytt erbjudande"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="o-title">Titel</Label>
                  <Input
                    id="o-title"
                    className="mt-1.5"
                    value={draft.title ?? ""}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="o-desc">Beskrivning</Label>
                  <Textarea
                    id="o-desc"
                    className="mt-1.5"
                    value={draft.description ?? ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="o-price">Pris/etikett</Label>
                  <Input
                    id="o-price"
                    className="mt-1.5"
                    value={draft.price_label ?? ""}
                    onChange={(e) => setDraft({ ...draft, price_label: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="o-start">Start</Label>
                    <Input
                      id="o-start"
                      type="datetime-local"
                      className="mt-1.5"
                      value={toLocalInput(draft.starts_at)}
                      onChange={(e) =>
                        setDraft({ ...draft, starts_at: e.target.value || null })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="o-end">Slut</Label>
                    <Input
                      id="o-end"
                      type="datetime-local"
                      className="mt-1.5"
                      value={toLocalInput(draft.ends_at)}
                      onChange={(e) =>
                        setDraft({ ...draft, ends_at: e.target.value || null })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="o-file">Bild</Label>
                  <input
                    id="o-file"
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
                    checked={draft.is_active !== false}
                    onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  />
                  Aktiv
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
