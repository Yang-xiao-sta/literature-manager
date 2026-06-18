export const PAPER_STATUS_OPTIONS = [
  { value: "UNREAD", label: "未读" },
  { value: "READING", label: "阅读中" },
  { value: "READ", label: "已读" },
  { value: "SUMMARIZED", label: "已总结" },
] as const;

export const PAPER_SORT_OPTIONS = [
  { value: "updatedAt-desc", label: "最近更新" },
  { value: "year-desc", label: "年份从新到旧" },
  { value: "year-asc", label: "年份从旧到新" },
  { value: "impactFactor-desc", label: "影响因子从高到低" },
  { value: "rating-desc", label: "重要程度从高到低" },
  { value: "title-asc", label: "标题 A-Z" },
] as const;

export const CSV_IMPORT_FIELDS = [
  "title",
  "authors",
  "journal",
  "year",
  "impactFactor",
  "doi",
  "sourceUrl",
  "pdfUrl",
  "tags",
  "mainConclusion",
  "methods",
  "status",
  "rating",
  "notes",
] as const;
