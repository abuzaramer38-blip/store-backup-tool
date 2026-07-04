"use client";

import { useState } from "react";
import type { ExportFormat, NormalizedProduct } from "@/lib/types";
import { generateCsv } from "@/lib/csv-export";
import { downloadCsv } from "@/lib/utils";

interface ExportControlsProps {
  products: NormalizedProduct[];
  sourceLabel: string;
}

export default function ExportControls({
  products,
  sourceLabel,
}: ExportControlsProps) {
  const [format, setFormat] = useState<ExportFormat>("shopify");

  const handleDownload = () => {
    if (products.length === 0) return;
    const csv = generateCsv(products, format);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${sourceLabel}-${format}-export-${timestamp}.csv`;
    downloadCsv(csv, filename);
  };

  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white">Export Format</h3>
        <p className="mt-1 text-xs text-gray-400">
          Choose the target platform CSV format for re-import.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-lg border border-surface-border p-1">
          <label
            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition ${
              format === "shopify" ? "tab-active" : "tab-inactive"
            }`}
          >
            <input
              type="radio"
              name="export-format"
              value="shopify"
              checked={format === "shopify"}
              onChange={() => setFormat("shopify")}
              className="sr-only"
            />
            Shopify CSV
          </label>
          <label
            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition ${
              format === "woocommerce" ? "tab-active" : "tab-inactive"
            }`}
          >
            <input
              type="radio"
              name="export-format"
              value="woocommerce"
              checked={format === "woocommerce"}
              onChange={() => setFormat("woocommerce")}
              className="sr-only"
            />
            WooCommerce CSV
          </label>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={products.length === 0}
          className="btn-primary"
        >
          <DownloadIcon />
          Download CSV
        </button>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
      />
    </svg>
  );
}
