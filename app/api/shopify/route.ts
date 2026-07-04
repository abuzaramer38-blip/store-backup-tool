import { NextRequest, NextResponse } from "next/server";
import { fetchShopifyProducts } from "@/lib/shopify";
import type { FetchResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeUrl, accessToken } = body;

    if (!storeUrl || typeof storeUrl !== "string") {
      return NextResponse.json(
        { error: "Store URL is required." },
        { status: 400 }
      );
    }

    const products = await fetchShopifyProducts(storeUrl, accessToken);

    const result: FetchResult = {
      products,
      meta: {
        total: products.length,
        source: "shopify",
        storeUrl: storeUrl.trim(),
        fetchedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch Shopify products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
