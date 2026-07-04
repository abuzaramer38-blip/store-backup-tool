export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeStoreUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/+$/, "");
}

export function buildCategoryPath(
  categoryId: number,
  categoryMap: Map<number, { name: string; parent: number }>
): string {
  const parts: string[] = [];
  let currentId: number | undefined = categoryId;
  const visited = new Set<number>();

  while (currentId && currentId !== 0 && !visited.has(currentId)) {
    visited.add(currentId);
    const cat = categoryMap.get(currentId);
    if (!cat) break;
    parts.unshift(cat.name);
    currentId = cat.parent || undefined;
  }

  return parts.join(" > ");
}

export function escapeCsvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function rowsToCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) =>
    row.map((cell) => escapeCsvField(String(cell ?? ""))).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCategoriesForWooCommerce(categories: { path: string }[]): string {
  return categories.map((c) => c.path).join(", ");
}

export function formatCategoriesForShopify(
  categories: { path: string; name: string }[],
  productType: string,
  tags: string[]
): { type: string; tags: string } {
  const categoryTags = categories.map((c) => c.path.replace(/ > /g, "/"));
  const allTags = [...new Set([...tags, ...categoryTags])];
  const type =
    productType ||
    (categories.length > 0
      ? categories[0].path.split(" > ").pop() || ""
      : "");

  return {
    type,
    tags: allTags.join(", "),
  };
}
