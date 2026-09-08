import {
  fetchGallery,
  fetchHours,
  fetchNews,
  fetchOffers,
  fetchRestaurantProfile,
  fetchSiteContent,
  resolveImageUrl,
  type GalleryItem,
  type NewsItem,
  type OpeningHour,
  type PublicOffer,
  type SiteContent,
} from "@/lib/api";
import {
  isUninitializedHours,
  officialHoursAsOpeningHours,
} from "@/config/opening-hours";
import {
  businessFromProfile,
  type PublicBusiness,
} from "@/lib/public-business";

export async function loadHours(): Promise<OpeningHour[]> {
  try {
    const hours = await fetchHours();
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

export async function loadRestaurantBusiness(): Promise<PublicBusiness> {
  try {
    const profile = await fetchRestaurantProfile();
    return businessFromProfile(profile);
  } catch {
    return businessFromProfile(null);
  }
}

const DEFAULT_SITE: SiteContent = {
  hero_title: "Goda smaker, äkta upplevelser",
  hero_body:
    "Riva Bistro är en restaurang på Kungsholmen i Stockholm — skandinavisk mat i stillsam miljö vid vattnet, med utsikt och uteservering. Vi dukar för lunch, långa middagar och minnesvärda kvällar.",
  hero_image_url: "/scenes/hero-food.jpg",
  hero_src: "/scenes/hero-food.jpg",
  primary_cta_label: "Boka bord",
  primary_cta_href: "/boka",
  secondary_cta_label: "Se vår meny",
  secondary_cta_href: "/meny",
  about_title: "En bistro där råvaran får tala",
  about_body:
    "Vi lagar mat med omsorg och serverar den utan krångel. Skandinavisk enkelhet möter mediterran värme — i en miljö som är lika bekväm för en vardagsmiddag som för det stora firandet.",
  about_image_url: "/scenes/home-interior.jpg",
  about_src: "/scenes/home-interior.jpg",
};

export async function loadSiteContent(): Promise<SiteContent> {
  try {
    const content = await fetchSiteContent();
    return {
      ...content,
      hero_src: resolveImageUrl(content.hero_src || content.hero_image_url),
      about_src: resolveImageUrl(content.about_src || content.about_image_url),
    };
  } catch {
    return DEFAULT_SITE;
  }
}

export async function loadOffers(): Promise<PublicOffer[]> {
  try {
    const offers = await fetchOffers();
    return offers.map((o) => ({ ...o, src: resolveImageUrl(o.src) }));
  } catch {
    return [];
  }
}
