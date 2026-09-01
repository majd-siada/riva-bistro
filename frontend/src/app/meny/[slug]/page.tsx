import { notFound, redirect } from "next/navigation";

import { MENU_ITEMS } from "@/data/menu";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const item = MENU_ITEMS.find((entry) => entry.slug === slug);
  if (!item) notFound();
  redirect(`/meny#${item.categorySlug}`);
}
