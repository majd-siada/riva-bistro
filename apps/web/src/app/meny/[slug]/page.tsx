import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/commerce/product-detail-client";
import { Section } from "@/components/layout/section";
import { fetchProduct } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const product = await fetchProduct(slug);
    return { title: product.name };
  } catch {
    return { title: "Produkt" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await fetchProduct(slug);
  } catch {
    notFound();
  }

  return (
    <Section className="pt-24">
      <ProductDetailClient product={product} />
    </Section>
  );
}
