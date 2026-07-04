import { NextRequest, NextResponse } from "next/server";
import { fetchWooCommerceProducts } from "@/lib/woocommerce";
import type { FetchResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeUrl, consumerKey, consumerSecret } = body;

    if (!storeUrl || typeof storeUrl !== "string") {
      return NextResponse.json(
        { error: "Store URL is required." },
        { status: 400 }
      );
    }

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: "WooCommerce consumer key and secret are required." },
        { status: 400 }
      );
    }

    const products = await fetchWooCommerceProducts(
      storeUrl,
      consumerKey,
      consumerSecret
    );

    const result: FetchResult = {
      products,
      meta: {
        total: products.length,
        source: "woocommerce",
        storeUrl: storeUrl.trim(),
        fetchedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch WooCommerce products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
