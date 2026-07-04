import type { CategoryPath, NormalizedProduct } from "./types";
import { slugify, normalizeStoreUrl, buildCategoryPath } from "./utils";

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
    sku: string;
    inventory_quantity: number | null;
    inventory_management: string | null;
  }>;
  images: Array<{ src: string }>;
}

interface ShopifyCollect {
  product_id: number;
  collection_id: number;
}

interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
}

async function fetchJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Shopify request failed (${response.status}): ${text.slice(0, 200) || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

async function fetchAllPublicProducts(storeUrl: string): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let page = 1;
  const limit = 250;

  while (true) {
    const url = `${storeUrl}/products.json?limit=${limit}&page=${page}`;
    const data = await fetchJson<{ products: ShopifyProduct[] }>(url);

    if (!data.products?.length) break;
    products.push(...data.products);
    if (data.products.length < limit) break;
    page++;
  }

  return products;
}

async function fetchAdminCollections(
  storeUrl: string,
  accessToken: string
): Promise<ShopifyCollection[]> {
  const headers = {
    "X-Shopify-Access-Token": accessToken,
  };
  const apiBase = `${storeUrl}/admin/api/2024-10`;
  const collections: ShopifyCollection[] = [];

  for (const endpoint of ["custom_collections.json", "smart_collections.json"]) {
    let pageInfo: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = pageInfo
        ? `${apiBase}/${endpoint}?limit=250&page_info=${pageInfo}`
        : `${apiBase}/${endpoint}?limit=250`;

      const response = await fetch(url, {
        headers: { ...headers, Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) break;

      const data = (await response.json()) as Record<string, ShopifyCollection[]>;
      const key = endpoint.replace(".json", "");
      const batch = data[key] || [];
      collections.push(...batch);

      const linkHeader = response.headers.get("link");
      const nextMatch = linkHeader?.match(/<[^>]+page_info=([^>&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
      } else {
        hasMore = false;
      }
    }
  }

  return collections;
}

async function fetchAdminCollects(
  storeUrl: string,
  accessToken: string
): Promise<ShopifyCollect[]> {
  const headers = {
    "X-Shopify-Access-Token": accessToken,
  };
  const apiBase = `${storeUrl}/admin/api/2024-10`;
  const collects: ShopifyCollect[] = [];
  let pageInfo: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = pageInfo
      ? `${apiBase}/collects.json?limit=250&page_info=${pageInfo}`
      : `${apiBase}/collects.json?limit=250`;

    const response = await fetch(url, {
      headers: { ...headers, Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) break;

    const data = (await response.json()) as { collects: ShopifyCollect[] };
    collects.push(...(data.collects || []));

    const linkHeader = response.headers.get("link");
    const nextMatch = linkHeader?.match(/<[^>]+page_info=([^>&>]+)[^>]*>;\s*rel="next"/);
    if (nextMatch) {
      pageInfo = nextMatch[1];
    } else {
      hasMore = false;
    }
  }

  return collects;
}

function normalizeShopifyProduct(product: ShopifyProduct): NormalizedProduct {
  const variant = product.variants?.[0];
  const tags = product.tags
    ? product.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const categories: CategoryPath[] = [];

  if (product.product_type) {
    categories.push({
      path: product.product_type,
      name: product.product_type,
    });
  }

  const stockQty =
    variant?.inventory_management === "shopify"
      ? variant.inventory_quantity ?? 0
      : variant?.inventory_quantity ?? null;

  return {
    id: String(product.id),
    title: product.title,
    description: product.body_html || "",
    shortDescription: "",
    price: variant?.price || "0",
    compareAtPrice: variant?.compare_at_price || "",
    stockQuantity: stockQty,
    stockStatus:
      stockQty === null || stockQty > 0 ? "instock" : "outofstock",
    imageUrls: product.images?.map((img) => img.src) || [],
    categories,
    tags,
    sku: variant?.sku || "",
    vendor: product.vendor || "",
    productType: product.product_type || "",
    handle: product.handle || slugify(product.title),
    source: "shopify",
  };
}

function applyCollectionCategories(
  products: NormalizedProduct[],
  collects: ShopifyCollect[],
  collectionMap: Map<number, string>
): void {
  const productIdToCollections = new Map<number, string[]>();

  for (const collect of collects) {
    const collectionName = collectionMap.get(collect.collection_id);
    if (!collectionName) continue;
    const existing = productIdToCollections.get(collect.product_id) || [];
    existing.push(collectionName);
    productIdToCollections.set(collect.product_id, existing);
  }

  for (const product of products) {
    const shopifyId = parseInt(product.id, 10);
    if (Number.isNaN(shopifyId)) continue;

    const collectionNames = productIdToCollections.get(shopifyId) || [];
    for (const name of collectionNames) {
      const exists = product.categories.some((c) => c.path === name);
      if (!exists) {
        product.categories.push({ path: name, name });
      }
    }
  }
}

export async function fetchShopifyProducts(
  rawStoreUrl: string,
  accessToken?: string
): Promise<NormalizedProduct[]> {
  const storeUrl = normalizeStoreUrl(rawStoreUrl);

  const shopifyProducts = await fetchAllPublicProducts(storeUrl);

  if (shopifyProducts.length === 0) {
    return [];
  }

  let collectionMap = new Map<number, string>();
  let collects: ShopifyCollect[] = [];

  if (accessToken?.trim()) {
    try {
      const collections = await fetchAdminCollections(storeUrl, accessToken.trim());
      collectionMap = new Map(collections.map((c) => [c.id, c.title]));
      collects = await fetchAdminCollects(storeUrl, accessToken.trim());
    } catch {
      // Admin API optional — fall back to product_type and tags
    }
  }

  const products = shopifyProducts.map((p) => normalizeShopifyProduct(p));

  if (collects.length > 0 && collectionMap.size > 0) {
    applyCollectionCategories(products, collects, collectionMap);
  }

  return products;
}
