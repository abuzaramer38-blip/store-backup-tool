import type { NormalizedProduct } from "./types";
import {
  rowsToCsv,
  formatCategoriesForWooCommerce,
  formatCategoriesForShopify,
} from "./utils";

const SHOPIFY_HEADERS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "Status",
];

const WOOCOMMERCE_HEADERS = [
  "ID",
  "Type",
  "SKU",
  "Name",
  "Published",
  "Is featured?",
  "Visibility in catalog",
  "Short description",
  "Description",
  "Tax status",
  "In stock?",
  "Stock",
  "Backorders allowed?",
  "Sold individually?",
  "Regular price",
  "Sale price",
  "Categories",
  "Tags",
  "Images",
  "Manage stock?",
];

function shopifyInventoryPolicy(qty: number | null): string {
  return qty !== null && qty > 0 ? "deny" : "continue";
}

function wooInStock(status: string, qty: number | null): string {
  if (status === "instock" || status === "onbackorder") return "1";
  if (qty !== null && qty > 0) return "1";
  return "0";
}

export function exportToShopifyCsv(products: NormalizedProduct[]): string {
  const rows: string[][] = [];

  for (const product of products) {
    const { type, tags } = formatCategoriesForShopify(
      product.categories,
      product.productType,
      product.tags
    );

    const baseRow = [
      product.handle,
      product.title,
      product.description,
      product.vendor,
      type,
      tags,
      "TRUE",
      "Title",
      "Default Title",
      product.sku,
      "",
      product.stockQuantity !== null ? "shopify" : "",
      product.stockQuantity !== null ? String(product.stockQuantity) : "",
      shopifyInventoryPolicy(product.stockQuantity),
      "manual",
      product.price,
      product.compareAtPrice,
      "TRUE",
      "TRUE",
      product.imageUrls[0] || "",
      product.imageUrls[0] ? "1" : "",
      product.title,
      "FALSE",
      "active",
    ];

    rows.push(baseRow);

    for (let i = 1; i < product.imageUrls.length; i++) {
      rows.push([
        product.handle,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        product.imageUrls[i],
        String(i + 1),
        product.title,
        "",
        "",
      ]);
    }
  }

  return rowsToCsv(SHOPIFY_HEADERS, rows);
}

export function exportToWooCommerceCsv(products: NormalizedProduct[]): string {
  const rows = products.map((product) => [
    "",
    "simple",
    product.sku,
    product.title,
    "1",
    "0",
    "visible",
    product.shortDescription,
    product.description,
    "taxable",
    wooInStock(product.stockStatus, product.stockQuantity),
    product.stockQuantity !== null ? String(product.stockQuantity) : "",
    "0",
    "0",
    product.price,
    product.compareAtPrice || "",
    formatCategoriesForWooCommerce(product.categories),
    product.tags.join(", "),
    product.imageUrls.join(", "),
    product.stockQuantity !== null ? "1" : "0",
  ]);

  return rowsToCsv(WOOCOMMERCE_HEADERS, rows);
}

export function generateCsv(
  products: NormalizedProduct[],
  format: "shopify" | "woocommerce"
): string {
  return format === "shopify"
    ? exportToShopifyCsv(products)
    : exportToWooCommerceCsv(products);
}
