export type ArtworkStatus = "pending" | "approved" | "rejected";

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  category: { slug: string; name: string } | null;
  creator_id: string | null;
  creator_name: string | null;
  creator_username: string | null;
  creation_year: number | null;
  source_url: string | null;
  license_type: string | null;
  artwork_type: string | null;
  tags: string[];
  status: ArtworkStatus;
  featured: boolean;
  is_sample: boolean;
  allow_download: boolean;
  views: number;
  favorites_count: number;
  created_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  display_order: number;
  count: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  display_order: number;
  count: number;
};

export type SortKey = "latest" | "oldest" | "popular" | "favorited" | "random";

export type ArtworkQuery = {
  q?: string;
  category?: string;
  sort?: SortKey;
  year?: number;
  type?: string;
  featured?: boolean;
  community?: boolean;
  collection?: string;
  creatorId?: string;
  ids?: string[];
  seed?: number;
  page?: number;
  pageSize?: number;
};

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "admin";
  suspended: boolean;
  created_at: string;
};

export type SiteSettings = {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  metaDescription: string;
  xUrl: string;
  logoUrl: string;
  uploadMaxMb: number;
};
