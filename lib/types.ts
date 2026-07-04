export interface CategoryPath {
  /** Full hierarchical path, e.g. "Electronics > Phones > Android" */
  path: string;
  /** Leaf category name */
  name: string;
}

export interface NormalizedProduct {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: number | null;
  stockStatus: "instock" | "outofstock" | "onbackorder" | string;
  imageUrls: string[];
  categories: CategoryPath[];
  tags: string[];
  sku: string;
  vendor: string;
  productType: string;
  handle: string;
  source: "shopify" | "woocommerce";
}

export type ExportFormat = "shopify" | "woocommerce";

export interface FetchResult {
  products: NormalizedProduct[];
  meta: {
    total: number;
    source: "shopify" | "woocommerce";
    storeUrl: string;
    fetchedAt: string;
  };
}

export interface ShopifyFetchRequest {
  storeUrl: string;
  accessToken?: string;
}

export interface WooCommerceFetchRequest {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}
