import type { CategoryPath, NormalizedProduct } from "./types";
import { slugify, normalizeStoreUrl, buildCategoryPath } from "./utils";

interface WooCategory {
  id: number;
  name: string;
  parent: number;
  slug: string;
}

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ name: string }>;
  images: Array<{ src: string }>;
}

async function fetchWooPage<T>(
  url: string,
  consumerKey: string,
  consumerSecret: string
): Promise<{ data: T; totalPages: number }> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `WooCommerce request failed (${response.status}): ${text.slice(0, 200) || response.statusText}`
    );
  }

  const totalPages = parseInt(response.headers.get("x-wp-totalpages") || "1", 10);
  const data = (await response.json()) as T;

  return { data, totalPages };
}

async function fetchAllCategories(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<Map<number, { name: string; parent: number }>> {
  const categoryMap = new Map<number, { name: string; parent: number }>();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${storeUrl}/wp-json/wc/v3/products/categories?per_page=100&page=${page}`;
    const result = await fetchWooPage<WooCategory[]>(url, consumerKey, consumerSecret);
    totalPages = result.totalPages;

    for (const cat of result.data) {
      categoryMap.set(cat.id, { name: cat.name, parent: cat.parent });
    }
    page++;
  }

  return categoryMap;
}

async function fetchAllProducts(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<WooProduct[]> {
  const products: WooProduct[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${storeUrl}/wp-json/wc/v3/products?per_page=100&page=${page}&status=any`;
    const result = await fetchWooPage<WooProduct[]>(url, consumerKey, consumerSecret);
    totalPages = result.totalPages;
    products.push(...result.data);
    page++;
  }

  return products;
}

function resolveProductCategories(
  product: WooProduct,
  categoryMap: Map<number, { name: string; parent: number }>
): CategoryPath[] {
  const paths: CategoryPath[] = [];
  const seen = new Set<string>();

  for (const cat of product.categories) {
    const fullPath = buildCategoryPath(cat.id, categoryMap);
    if (fullPath && !seen.has(fullPath)) {
      seen.add(fullPath);
      const leafName = fullPath.split(" > ").pop() || cat.name;
      paths.push({ path: fullPath, name: leafName });
    } else if (cat.name && !seen.has(cat.name)) {
      seen.add(cat.name);
      paths.push({ path: cat.name, name: cat.name });
    }
  }

  return paths;
}

function normalizeWooProduct(
  product: WooProduct,
  categoryMap: Map<number, { name: string; parent: number }>
): NormalizedProduct {
  const categories = resolveProductCategories(product, categoryMap);

  return {
    id: String(product.id),
    title: product.name,
    description: product.description || "",
    shortDescription: product.short_description || "",
    price: product.regular_price || product.sale_price || "0",
    compareAtPrice: product.sale_price || "",
    stockQuantity: product.manage_stock ? product.stock_quantity : product.stock_quantity,
    stockStatus: (product.stock_status as NormalizedProduct["stockStatus"]) || "instock",
    imageUrls: product.images?.map((img) => img.src) || [],
    categories,
    tags: product.tags?.map((t) => t.name) || [],
    sku: product.sku || "",
    vendor: "",
    productType: categories[0]?.name || "",
    handle: product.slug || slugify(product.name),
    source: "woocommerce",
  };
}

export async function fetchWooCommerceProducts(
  rawStoreUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<NormalizedProduct[]> {
  const storeUrl = normalizeStoreUrl(rawStoreUrl);

  const [categoryMap, products] = await Promise.all([
    fetchAllCategories(storeUrl, consumerKey, consumerSecret),
    fetchAllProducts(storeUrl, consumerKey, consumerSecret),
  ]);

  return products.map((p) => normalizeWooProduct(p, categoryMap));
}
