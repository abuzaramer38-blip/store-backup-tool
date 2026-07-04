"use client";

import { useState } from "react";
import type { FetchResult, NormalizedProduct } from "@/lib/types";
import ProductTable from "./ProductTable";
import ExportControls from "./ExportControls";

export default function WooCommerceBackup() {
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<FetchResult["meta"] | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/woocommerce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeUrl: storeUrl.trim(),
          consumerKey: consumerKey.trim(),
          consumerSecret: consumerSecret.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products.");
      }

      setProducts(data.products);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setProducts([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">WordPress / WooCommerce Backup</h2>
          <p className="mt-1 text-sm text-gray-400">
            Fetches products and full category hierarchies via the WooCommerce REST API at{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-green-400">
              /wp-json/wc/v3/products
            </code>
            . Categories are resolved to parent &gt; child paths for accurate re-import.
          </p>
        </div>

        <form onSubmit={handleFetch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="woo-url" className="mb-1.5 block text-xs font-medium text-gray-300">
                Store URL
              </label>
              <input
                id="woo-url"
                type="text"
                required
                placeholder="https://your-store.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="woo-key" className="mb-1.5 block text-xs font-medium text-gray-300">
                Consumer Key
              </label>
              <input
                id="woo-key"
                type="text"
                required
                placeholder="ck_xxxxxxxxxxxxxxxx"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                className="w-full font-mono"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="woo-secret" className="mb-1.5 block text-xs font-medium text-gray-300">
                Consumer Secret
              </label>
              <input
                id="woo-secret"
                type="password"
                required
                placeholder="cs_xxxxxxxxxxxxxxxx"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                className="w-full font-mono"
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Fetching...
              </>
            ) : (
              <>
                <FetchIcon />
                Fetch Products
              </>
            )}
          </button>
        </form>

        {meta && (
          <p className="mt-4 text-xs text-gray-500">
            Loaded {meta.total} products from {meta.storeUrl} at{" "}
            {new Date(meta.fetchedAt).toLocaleString()}
          </p>
        )}
      </div>

      {products.length > 0 && (
        <ExportControls products={products} sourceLabel="woocommerce-backup" />
      )}

      <ProductTable products={products} isLoading={isLoading} />
    </div>
  );
}

function FetchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
