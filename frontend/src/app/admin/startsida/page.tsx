"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/ui/state-message";
import { Textarea } from "@/components/ui/textarea";
import {
  adminGetSiteContent,
  adminUpdateSiteContent,
  type SiteContent,
} from "@/lib/admin-api";

export default function AdminStartsidaPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [aboutFile, setAboutFile] = useState<File | null>(null);

  useEffect(() => {
    adminGetSiteContent()
      .then(setContent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const form = new FormData();
      const keys: (keyof SiteContent)[] = [
        "hero_title",
        "hero_body",
        "hero_image_url",
        "primary_cta_label",
        "primary_cta_href",
        "secondary_cta_label",
        "secondary_cta_href",
        "about_title",
        "about_body",
        "about_image_url",
      ];
      for (const key of keys) {
        form.append(key, String(content[key] ?? ""));
      }
      if (heroFile) form.append("hero_image", heroFile);
      if (aboutFile) form.append("about_image", aboutFile);
      const updated = await adminUpdateSiteContent(form);
      setContent(updated);
      setHeroFile(null);
      setAboutFile(null);
      toast.success("Startsida sparad.");
    } catch {
      toast.error("Kunde inte spara startsidan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error || !content)
    return <StateMessage variant="error" title="Kunde inte ladda startsidan" />;

  const field = (key: keyof SiteContent, label: string, multiline = false) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      {multiline ? (
        <Textarea
          id={key}
          className="mt-1.5"
          value={String(content[key] ?? "")}
          onChange={(e) => setContent({ ...content, [key]: e.target.value })}
        />
      ) : (
        <Input
          id={key}
          className="mt-1.5"
          value={String(content[key] ?? "")}
          onChange={(e) => setContent({ ...content, [key]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Startsida</h1>
        <p className="mt-1 text-riva-muted">
          Hero, CTA och om-text. Utvalda rätter styrs under Meny (flaggan Utvald).
        </p>
      </div>
      <section className="space-y-4 rounded-lg border border-riva-cream/10 bg-riva-card p-5">
        <h2 className="font-display text-xl text-riva-cream">Hero</h2>
        {field("hero_title", "Titel")}
        {field("hero_body", "Brödtext", true)}
        {field("hero_image_url", "Hero-bild URL (fallback)")}
        <div>
          <Label htmlFor="hero-file">Ladda upp hero-bild</Label>
          <input
            id="hero-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1.5 block w-full text-sm text-riva-muted"
            onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
          />
          {content.hero_src && (
            <p className="mt-1 text-xs text-riva-muted">Nuvarande: {content.hero_src}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("primary_cta_label", "Primär CTA-text")}
          {field("primary_cta_href", "Primär CTA-länk")}
          {field("secondary_cta_label", "Sekundär CTA-text")}
          {field("secondary_cta_href", "Sekundär CTA-länk")}
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-riva-cream/10 bg-riva-card p-5">
        <h2 className="font-display text-xl text-riva-cream">Om-sektion</h2>
        {field("about_title", "Titel")}
        {field("about_body", "Brödtext", true)}
        {field("about_image_url", "Bild-URL (fallback)")}
        <div>
          <Label htmlFor="about-file">Ladda upp om-bild</Label>
          <input
            id="about-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1.5 block w-full text-sm text-riva-muted"
            onChange={(e) => setAboutFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </section>
      <Button variant="gold" loading={saving} onClick={() => void save()}>
        Spara startsida
      </Button>
    </div>
  );
}
