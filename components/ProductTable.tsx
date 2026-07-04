"use client";

import type { NormalizedProduct } from "@/lib/types";

interface ProductTableProps {
  products: NormalizedProduct[];
  isLoading: boolean;
}

export default function ProductTable({ products, isLoading }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="card flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-gray-400">Fetching products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card flex items-center justify-center py-16">
        <p className="text-sm text-gray-400">
          No products loaded. Enter your store credentials and click Fetch Products.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-surface-border px-6 py-4">
        <h3 className="text-sm font-semibold text-white">
          Products ({products.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface/50 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3 font-medium">SKU</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition hover:bg-surface-border/20"
              >
                <td className="px-4 py-3">
                  {product.imageUrls[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      className="h-12 w-12 rounded-lg border border-surface-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface text-xs text-gray-500">
                      N/A
                    </div>
                  )}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="font-medium text-white line-clamp-2">
                    {product.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{product.handle}</p>
                </td>
                <td className="px-4 py-3 font-mono text-gray-200">
                  {product.price || "—"}
                </td>
                <td className="px-4 py-3">
                  <StockBadge
                    quantity={product.stockQuantity}
                    status={product.stockStatus}
                  />
                </td>
                <td className="max-w-xs px-4 py-3">
                  {product.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map((cat) => (
                        <span
                          key={cat.path}
                          className="inline-block rounded-md bg-accent-muted px-2 py-0.5 text-xs text-blue-200"
                          title={cat.path}
                        >
                          {cat.path}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {product.sku || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockBadge({
  quantity,
  status,
}: {
  quantity: number | null;
  status: string;
}) {
  const inStock =
    status === "instock" || status === "onbackorder" || (quantity !== null && quantity > 0);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        inStock
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          inStock ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {quantity !== null ? quantity : inStock ? "In stock" : "Out of stock"}
    </span>
  );
}
