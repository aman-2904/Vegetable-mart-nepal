import { createClient } from "@/lib/supabase/server";
import { Category } from "./category.service";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  price: number;
  discount_price: number | null;
  unit: 'KG' | 'GRAM' | 'PIECE' | 'BUNCH' | 'DOZEN';
  stock: number;
  minimum_stock: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  categories?: Category; // Joined data
}

export interface GetProductsOptions {
  categoryId?: string;
  searchQuery?: string;
  isFeatured?: boolean;
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<{ products: Product[], count: number }> {
  const supabase = createClient();
  let query = supabase.from("products").select("*, categories(*)", { count: "exact" }).eq("is_active", true);

  if (options.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options.searchQuery) {
    query = query.ilike("name", `%${options.searchQuery}%`);
  }

  if (options.isFeatured !== undefined) {
    query = query.eq("is_featured", options.isFeatured);
  }

  if (options.minPrice !== undefined) {
    query = query.gte("price", options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    query = query.lte("price", options.maxPrice);
  }

  // Sorting
  switch (options.sortBy) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "popular":
    default:
      // For now, popular can just be ordered by created_at or random. We don't have views count yet.
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  const limit = options.limit || 20;
  const page = options.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], count: 0 };
  }

  return { products: data as Product[], count: count || 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    return null;
  }

  return data as Product;
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit: number = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeProductId)
    .limit(limit);

  if (error) {
    return [];
  }

  return data as Product[];
}
