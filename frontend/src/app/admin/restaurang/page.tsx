"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/ui/state-message";
import {
  adminGetRestaurantProfile,
  adminUpdateRestaurantProfile,
  type RestaurantProfile,
} from "@/lib/admin-api";

export default function AdminRestaurantPage() {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetRestaurantProfile()
      .then(setProfile)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await adminUpdateRestaurantProfile(profile);
      setProfile(updated);
      toast.success("Restaurangprofil sparad.");
    } catch {
      toast.error("Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error || !profile)
    return <StateMessage variant="error" title="Kunde inte ladda restaurangprofil" />;

  const field = (key: keyof RestaurantProfile, label: string) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        className="mt-1.5"
        value={String(profile[key] ?? "")}
        onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Restaurang</h1>
        <p className="mt-1 text-riva-muted">
          Namn, adress, telefon och sociala länkar som visas publikt.
        </p>
      </div>
      <section className="space-y-4 rounded-lg border border-riva-cream/10 bg-riva-card p-5">
        {field("name", "Namn")}
        {field("tagline", "Tagline")}
        {field("area", "Område")}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("street", "Gatuadress")}
          {field("postal_code", "Postnummer")}
          {field("city", "Stad")}
          {field("country", "Landskod")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("phone", "Telefon (visning)")}
          {field("phone_e164", "Telefon E.164")}
          {field("email", "E-post")}
          {field("map_url", "Kartlänk")}
        </div>
        {field("kitchen_hours", "Köksstängning (valfritt)")}
        {field("social_instagram", "Instagram-URL")}
        {field("social_facebook", "Facebook-URL")}
        <label className="inline-flex items-center gap-2 text-sm text-riva-cream">
          <input
            type="checkbox"
            className="h-5 w-5 accent-riva-gold"
            checked={profile.social_verified}
            onChange={(e) =>
              setProfile({ ...profile, social_verified: e.target.checked })
            }
          />
          Sociala profiler verifierade (JSON-LD sameAs)
        </label>
      </section>
      <Button variant="gold" loading={saving} onClick={() => void save()}>
        Spara
      </Button>
    </div>
  );
}
