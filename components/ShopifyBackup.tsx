"use client";

import { useState } from "react";
import type { FetchResult, NormalizedProduct } from "@/lib/types";
import ProductTable from "./ProductTable";
import ExportControls from "./ExportControls";

export default function ShopifyBackup() {
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<FetchResult["meta"] | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeUrl: storeUrl.trim(),
          accessToken: accessToken.trim() || undefined,
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
          <h2 className="text-lg font-semibold text-white">Shopify Backup</h2>
          <p className="mt-1 text-sm text-gray-400">
            Fetches products via the public{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-green-400">
              /products.json
            </code>{" "}
            endpoint. Optionally provide an Admin API access token to include
            collection-based categories.
          </p>
        </div>

        <form onSubmit={handleFetch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="shopify-url" className="mb-1.5 block text-xs font-medium text-gray-300">
                Store URL
              </label>
              <input
                id="shopify-url"
                type="text"
                required
                placeholder="https://your-store.myshopify.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="shopify-token" className="mb-1.5 block text-xs font-medium text-gray-300">
                Admin API Access Token{" "}
                <span className="font-normal text-gray-500">(optional — for collections)</span>
              </label>
              <input
                id="shopify-token"
                type="password"
                placeholder="shpat_xxxxxxxxxxxxxxxx"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
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
        <ExportControls products={products} sourceLabel="shopify-backup" />
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
