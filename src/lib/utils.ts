import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeJsonArrayParse(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function joinTags(tags: string[]): string {
  return tags.join(", ");
}

export function splitTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatNullableText(value: string | null | undefined) {
  return value?.trim() ? value : "未填写";
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function downloadCsvFilename(folderName: string) {
  const safeName = folderName.replace(/[\\/:*?"<>|]/g, "-");
  return `${safeName || "papers"}-${new Date().toISOString().slice(0, 10)}.csv`;
}
