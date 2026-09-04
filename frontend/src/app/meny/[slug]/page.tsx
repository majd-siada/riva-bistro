import { notFound, redirect } from "next/navigation";

import { loadPublicMenu } from "@/lib/public-menu";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { items } = await loadPublicMenu();
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();
  redirect(`/meny#${item.categorySlug}`);
}
