import { z } from "zod";
import { PAPER_STATUS_OPTIONS } from "@/lib/constants";

const paperStatusValues = PAPER_STATUS_OPTIONS.map((item) => item.value);

const optionalInteger = (min: number, max: number, invalidTypeMessage: string, minMessage: string, maxMessage: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z.number().refine((number) => !Number.isNaN(number), invalidTypeMessage).int(invalidTypeMessage).min(min, minMessage).max(max, maxMessage).optional(),
  );

const optionalNumber = (min: number, max: number, invalidTypeMessage: string, minMessage: string, maxMessage: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z.number().refine((number) => !Number.isNaN(number), invalidTypeMessage).min(min, minMessage).max(max, maxMessage).optional(),
  );

const optionalUrl = z
  .string()
  .trim()
  .url("请输入有效链接")
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalDoi = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(value),
    "请输入有效 DOI",
  )
  .transform((value) => value || undefined);

export const folderFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "请输入文件夹名称")
    .max(80, "文件夹名称请控制在 80 个字符以内"),
  parentId: z.string().nullable().optional(),
});

export const figureSchema = z.object({
  id: z.string().optional(),
  imageUrl: optionalUrl.default(""),
  caption: z.string().trim().max(200, "图题请控制在 200 个字符以内").optional(),
  explanation: z.string().trim().max(2000, "图解释请控制在 2000 个字符以内").optional(),
});

export const paperFormSchema = z.object({
  id: z.string().optional(),
  folderId: z.string().min(1, "请选择所属文件夹"),
  title: z.string().trim().min(1, "请输入文献标题").max(300, "标题过长"),
  authors: z.string().trim().default(""),
  journal: z.string().trim().optional(),
  journalAbbr: z.string().trim().optional(),
  ifYear: optionalInteger(2000, 2100, 'IF年份必须为整数', '年份过早', '年份过晚'),
  jcrQuartile: z.string().trim().optional(),
  casQuartile: z.string().trim().optional(),
  volume: z.string().trim().optional(),
  issue: z.string().trim().optional(),
  pages: z.string().trim().optional(),
  citationCount: optionalInteger(0, 999999, '引用数必须为整数', '引用数不能为负数', '引用数过大'),
  year: optionalInteger(1900, 2100, "年份必须为整数", "年份过早", "年份过晚"),
  impactFactor: optionalNumber(0, 1000, "影响因子必须为数字", "影响因子不能为负数", "影响因子过大"),
  doi: optionalDoi.default(""),
  sourceUrl: optionalUrl.default(""),
  pdfUrl: optionalUrl.default(""),
  tags: z.string().trim().default(""),
  mainConclusion: z.string().trim().optional(),
  methods: z.string().trim().optional(),
  status: z.enum(paperStatusValues as [string, ...string[]], {
    message: "请选择有效阅读状态",
  }),
  rating: optionalInteger(1, 5, "重要程度必须为整数", "重要程度最低为 1", "重要程度最高为 5"),
  notes: z.string().trim().optional(),
  abstract: z.string().trim().optional(),
  background: z.string().trim().optional(),
  researchQuestion: z.string().trim().optional(),
  materials: z.string().trim().optional(),
  keyResults: z.string().trim().optional(),
  conclusion: z.string().trim().optional(),
  innovations: z.string().trim().optional(),
  limitations: z.string().trim().optional(),
  usefulIdeas: z.string().trim().optional(),
  personalNotes: z.string().trim().optional(),
  followUpIdeas: z.string().trim().optional(),
  relatedPaperIds: z.array(z.string()).default([]),
  figures: z.array(figureSchema).default([]),
});

export const paperFilterSchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["ALL", ...paperStatusValues] as [string, ...string[]]).default("ALL"),
  tag: z.string().trim().optional(),
  sort: z.string().default("updatedAt-desc"),
});

export const csvImportRecordSchema = z.object({
  title: z.string().trim().min(1, "title 不能为空"),
  authors: z.string().trim().optional().default(""),
  journal: z.string().trim().optional(),
  journalAbbr: z.string().trim().optional(),
  ifYear: optionalInteger(2000, 2100, 'IF年份必须为整数', '年份过早', '年份过晚'),
  jcrQuartile: z.string().trim().optional(),
  casQuartile: z.string().trim().optional(),
  volume: z.string().trim().optional(),
  issue: z.string().trim().optional(),
  pages: z.string().trim().optional(),
  citationCount: optionalInteger(0, 999999, '引用数必须为整数', '引用数不能为负数', '引用数过大'),
  year: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (!Number.isNaN(value) && Number.isInteger(value)), "year 必须为整数"),
  impactFactor: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || !Number.isNaN(value), "impactFactor 必须为数字"),
  doi: z.string().trim().optional().default(""),
  sourceUrl: z.string().trim().optional().default(""),
  pdfUrl: z.string().trim().optional().default(""),
  tags: z.string().trim().optional().default(""),
  mainConclusion: z.string().trim().optional().default(""),
  methods: z.string().trim().optional().default(""),
  status: z.enum(paperStatusValues as [string, ...string[]]).optional().default("UNREAD"),
  rating: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine(
      (value) => value === undefined || (!Number.isNaN(value) && Number.isInteger(value) && value >= 1 && value <= 5),
      "rating 必须为 1-5 的整数",
    ),
  notes: z.string().trim().optional().default(""),
});

export type FolderFormValues = z.infer<typeof folderFormSchema>;
export type PaperFormValues = z.infer<typeof paperFormSchema>;
export type PaperFilterValues = z.infer<typeof paperFilterSchema>;
export type CsvImportRecord = z.infer<typeof csvImportRecordSchema>;
