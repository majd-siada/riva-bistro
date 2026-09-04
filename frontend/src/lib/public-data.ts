import {
  fetchGallery,
  fetchHours,
  fetchNews,
  resolveImageUrl,
  type GalleryItem,
  type NewsItem,
  type OpeningHour,
} from "@/lib/api";

export async function loadHours(): Promise<OpeningHour[]> {
  try {
    return await fetchHours();
  } catch {
    return [];
  }
}

export async function loadNews(): Promise<NewsItem[]> {
  try {
    return await fetchNews();
  } catch {
    return [];
  }
}

export async function loadGallery(): Promise<GalleryItem[]> {
  try {
    const items = await fetchGallery();
    return items.map((item) => ({
      ...item,
      src: resolveImageUrl(item.src),
    }));
  } catch {
    return [];
  }
}
