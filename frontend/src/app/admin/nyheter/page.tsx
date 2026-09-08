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
  adminCreateNews,
  adminDeleteNews,
  adminListNews,
  adminUpdateNews,
  type AdminNewsItem,
} from "@/lib/admin-api";

const empty = (): Partial<AdminNewsItem> => ({
  title: "",
  body: "",
  is_published: false,
  slug: "",
});

export default function AdminNewsPage() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<Partial<AdminNewsItem> & { id?: number } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const reload = () =>
    adminListNews().then(setItems).catch(() => setError(true));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!draft?.title?.trim() || !draft.body?.trim()) {
      toast.error("Titel och text krävs.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        body: draft.body.trim(),
        is_published: Boolean(draft.is_published),
        slug: draft.slug?.trim() || undefined,
      };
      if (draft.id) await adminUpdateNews(draft.id, payload);
      else await adminCreateNews(payload);
      await reload();
      setDraft(null);
      toast.success("Nyhet sparad.");
    } catch {
      toast.error("Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AdminNewsItem) => {
    if (!confirm(`Ta bort ${item.title}?`)) return;
    try {
      await adminDeleteNews(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch {
      toast.error("Kunde inte ta bort.");
    }
  };

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error) return <StateMessage variant="error" title="Kunde inte ladda nyheter" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-riva-cream">Nyheter</h1>
          <p className="mt-1 text-riva-muted">
            Visas under ”Just nu” på startsidan när publicerade.
          </p>
        </div>
        <Button variant="gold" onClick={() => setDraft(empty())}>
          Ny nyhet
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-riva-cream/10">
        <table className="w-full text-sm">
          <thead className="bg-riva-surface text-left text-riva-muted">
            <tr>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Publicerad</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-riva-cream/10">
            {items.map((item) => (
              <tr key={item.id} className="bg-riva-card">
                <td className="px-4 py-3 text-riva-cream">{item.title}</td>
                <td className="px-4 py-3 text-riva-muted">
                  {item.is_published ? "Ja" : "Nej"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setDraft(item)}>
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
        <DialogContent>
          {draft && (
            <>
              <DialogHeader>
                <DialogTitle>{draft.id ? "Redigera nyhet" : "Ny nyhet"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="n-title">Titel</Label>
                  <Input
                    id="n-title"
                    className="mt-1.5"
                    value={draft.title ?? ""}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="n-body">Text</Label>
                  <Textarea
                    id="n-body"
                    className="mt-1.5 min-h-32"
                    value={draft.body ?? ""}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-riva-gold"
                    checked={Boolean(draft.is_published)}
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
