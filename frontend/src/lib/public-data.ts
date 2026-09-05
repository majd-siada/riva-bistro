import {
  fetchGallery,
  fetchHours,
  fetchNews,
  resolveImageUrl,
  type GalleryItem,
  type NewsItem,
  type OpeningHour,
} from "@/lib/api";
import {
  isUninitializedHours,
  officialHoursAsOpeningHours,
} from "@/config/opening-hours";

export async function loadHours(): Promise<OpeningHour[]> {
  try {
    const hours = await fetchHours();
    // Production may return seven synthetic "closed" stubs before seed/Admin
    // fills real times. Fall back to the official schedule for public display.
    if (isUninitializedHours(hours)) {
      return officialHoursAsOpeningHours();
    }
    return hours;
  } catch {
    return officialHoursAsOpeningHours();
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
