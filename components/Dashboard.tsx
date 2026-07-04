"use client";

import { useState } from "react";
import ShopifyBackup from "./ShopifyBackup";
import WooCommerceBackup from "./WooCommerceBackup";

type Tab = "shopify" | "wordpress";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("shopify");

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-surface-raised/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 11h6M9 15h4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                E-commerce Backup & Migration
              </h1>
              <p className="text-sm text-gray-400">
                Internal utility for Shopify & WooCommerce product extraction
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex gap-1 rounded-xl border border-surface-border bg-surface-raised p-1">
          <TabButton
            active={activeTab === "shopify"}
            onClick={() => setActiveTab("shopify")}
            icon={<ShopifyIcon />}
            label="Shopify Backup"
          />
          <TabButton
            active={activeTab === "wordpress"}
            onClick={() => setActiveTab("wordpress")}
            icon={<WordPressIcon />}
            label="WordPress Backup"
          />
        </nav>

        {activeTab === "shopify" ? <ShopifyBackup /> : <WooCommerceBackup />}
      </main>

      <footer className="border-t border-surface-border py-6 text-center text-xs text-gray-500">
        Authorized internal tool — for stores you own and manage.
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
        active ? "tab-active border" : "tab-inactive"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ShopifyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.34 3.33c-.05 0-.1.02-.14.05-.04.03-.07.08-.08.13l-.67 2.6c-.01.05 0 .1.03.14.03.04.08.07.13.08l2.58.67c.05.01.1 0 .14-.03.04-.03.07-.08.08-.13l.67-2.6c.01-.05 0-.1-.03-.14a.2.2 0 00-.13-.08l-2.58-.67a.17.17 0 00-.13.05zM12 2L2 6.5v11L12 22l10-4.5v-11L12 2zm0 2.18l7.5 3.38v8.88L12 19.82l-7.5-3.38V7.56L12 4.18z" />
    </svg>
  );
}

function WordPressIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18.5c-4.69 0-8.5-3.81-8.5-8.5S7.31 3.5 12 3.5s8.5 3.81 8.5 8.5-3.81 8.5-8.5 8.5z" />
      <path d="M12 6.5c-3.03 0-5.5 2.47-5.5 5.5 0 2.5 1.68 4.61 3.97 5.27l1.03-3.01c-.35-.12-.6-.45-.6-.84 0-.49.4-.89.89-.89.28 0 .53.13.69.34l2.02-5.87C13.2 6.67 12.61 6.5 12 6.5z" />
    </svg>
  );
}
