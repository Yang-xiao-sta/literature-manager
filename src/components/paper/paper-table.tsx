"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Papa from "papaparse";
import { Download, Eye, FileUp, FolderTree, PencilLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePaperAction, importCsvPapersAction } from "@/actions/paper-actions";
import { SmartImportDialog } from "@/components/paper/smart-import-dialog";
import { AutoClassifyDialog } from "@/components/paper/auto-classify-dialog";
import { AiSummarizeButton } from "@/components/paper/ai-summarize-button";
import { PaperFormDialog } from "@/components/paper/paper-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PAPER_SORT_OPTIONS, PAPER_STATUS_OPTIONS } from "@/lib/constants";
import type { FolderOption } from "@/lib/folders";
import type { PaperFormValues } from "@/lib/schemas";
import { formatDateTime, joinTags } from "@/lib/utils";

type TablePaper = {
  id: string;
  folderId: string;
  title: string;
  authors: string;
  journal: string | null;
  year: number | null;
  impactFactor: number | null;
  doi: string | null;
  sourceUrl: string | null;
  pdfUrl: string | null;
  tags: string[];
  mainConclusion: string | null;
  methods: string | null;
  status: string;
  rating: number | null;
  notes: string | null;
  abstract?: string | null;
  background?: string | null;
  researchQuestion?: string | null;
  materials?: string | null;
  keyResults?: string | null;
  conclusion?: string | null;
  innovations?: string | null;
  limitations?: string | null;
  usefulIdeas?: string | null;
  personalNotes?: string | null;
  followUpIdeas?: string | null;
  relatedPaperIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  figures: Array<{ id: string; imageUrl?: string; caption?: string | null; explanation?: string | null }>;
};

type PaperTableProps = {
  papers: TablePaper[];
  folderId?: string;
  folderName?: string;
  folderOptions: FolderOption[];
};

const columnHelper = createColumnHelper<TablePaper>();

export function PaperTable({ papers, folderId, folderName, folderOptions }: PaperTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paperDialogOpen, setPaperDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<PaperFormValues | undefined>();
  const [deletePaper, setDeletePaper] = useState<{ id: string; title: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvFilename, setCsvFilename] = useState("");
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [classifyOpen, setClassifyOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "标题",
        cell: ({ row }) => (
          <div className="min-w-60 max-w-72">
            <p className="line-clamp-2 font-medium text-slate-900">{row.original.title}</p>
            <p className="mt-1 text-xs text-slate-500">{row.original.journal || "未填写期刊"}</p>
          </div>
        ),
      }),
      columnHelper.accessor("authors", {
        header: "作者",
        cell: ({ getValue }) => <span className="block max-w-52 truncate">{getValue() || "未填写"}</span>,
      }),
      columnHelper.accessor("year", {
        header: "年份",
        cell: ({ getValue }) => getValue() ?? "-",
      }),
      columnHelper.accessor("impactFactor", {
        header: "影响因子",
        cell: ({ getValue }) => (getValue() ? getValue()?.toFixed(1) : "-"),
      }),
      columnHelper.accessor("tags", {
        header: "标签",
        cell: ({ getValue }) => (
          <div className="max-w-48">
            <p className="truncate text-sm text-slate-700" title={joinTags(getValue())}>
              {getValue().length ? joinTags(getValue()) : "未添加"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("mainConclusion", {
        header: "主要结论",
        cell: ({ getValue }) => (
          <div className="max-w-64">
            <p className="line-clamp-2 text-sm text-slate-600" title={getValue() ?? ""}>
              {getValue() || "未填写"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "状态",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      }),
      columnHelper.accessor("rating", {
        header: "重要程度",
        cell: ({ getValue }) => (getValue() ? `${getValue()}/5` : "-"),
      }),
      columnHelper.accessor("figures", {
        header: "图表数",
        cell: ({ getValue }) => getValue().length,
      }),
      columnHelper.accessor("updatedAt", {
        header: "更新时间",
        cell: ({ getValue }) => <span className="text-xs text-slate-500">{formatDateTime(getValue())}</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "操作",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link href={`/papers/${row.original.id}`} className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Eye className="mr-1 h-3.5 w-3.5" />
              查看总结
            </Link>
            <AiSummarizeButton paperId={row.original.id} hasAbstract={!!row.original.abstract} variant="table" />
            <button
              className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setEditingPaper(toEditValues(row.original));
                setPaperDialogOpen(true);
              }}
            >
              <PencilLine className="mr-1 h-3.5 w-3.5" />
              编辑
            </button>
            <button
              className="inline-flex items-center rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              onClick={() => setDeletePaper({ id: row.original.id, title: row.original.title })}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              删除
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: papers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const updateQuery = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (folderId) {
      params.set("folderId", folderId);
    }

    router.push(`/?${params.toString()}`);
  };

  const handleDelete = () => {
    if (!deletePaper) {
      return;
    }

    startTransition(async () => {
      const result = await deletePaperAction(deletePaper);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDeletePaper(null);
      router.refresh();
    });
  };

  const handleImport = () => {
    if (!folderId) {
      toast.error("请先选择一个文件夹。");
      return;
    }

    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length) {
      toast.error(`CSV 解析失败：${parsed.errors[0]?.message ?? "格式错误"}`);
      return;
    }

    startTransition(async () => {
      const result = await importCsvPapersAction({
        folderId,
        records: parsed.data,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setCsvText("");
      setImportOpen(false);
      router.refresh();
    });
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    setCsvFilename(file.name);
    setCsvText(text);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{folderName ? `${folderName} 文献表格` : "请选择文件夹"}</p>
              <p className="mt-1 text-xs text-slate-500">支持搜索、筛选、排序、导入导出，以及进入详细总结页继续补充。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setEditingPaper(undefined);
                  setPaperDialogOpen(true);
                }}
                disabled={!folderId}
              >
                <Plus className="mr-1 h-4 w-4" />
                添加文献
              </Button>
              <Button variant="secondary" onClick={() => setSmartImportOpen(true)} disabled={!folderId}>
                <Sparkles className="mr-1 h-4 w-4" />
                智能导入
              </Button>
              <Button variant="secondary" onClick={() => setClassifyOpen(true)} disabled={!folderId}>
                <FolderTree className="mr-1 h-4 w-4" />
                一键整理
              </Button>
              <Button variant="secondary" onClick={() => setImportOpen(true)} disabled={!folderId}>
                <FileUp className="mr-1 h-4 w-4" />
                导入 CSV
              </Button>
              <a
                href={folderId ? `/api/folders/${folderId}/export` : undefined}
                className={`inline-flex h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium ${
                  folderId ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "pointer-events-none bg-slate-100 text-slate-400"
                }`}
              >
                <Download className="mr-1 h-4 w-4" />
                导出 CSV
              </a>

      <SmartImportDialog
        open={smartImportOpen}
        onClose={() => setSmartImportOpen(false)}
        folderOptions={folderOptions}
        defaultFolderId={folderId}
        onImport={(data) => {
          setEditingPaper({
            folderId: data.folderId,
            title: data.title,
            authors: data.authors,
            journal: data.journal || "",
            journalAbbr: data.journalAbbr || "",
            year: data.year ?? undefined,
            impactFactor: data.impactFactor ?? undefined,
            ifYear: data.ifYear ?? undefined,
            jcrQuartile: data.jcrQuartile || "",
            casQuartile: data.casQuartile || "",
            volume: data.volume || "",
            issue: data.issue || "",
            pages: data.pages || "",
            citationCount: data.citationCount ?? undefined,
            doi: data.doi || "",
            sourceUrl: data.sourceUrl || "",
            tags: data.tags || "",
            status: (data.status || "UNREAD") as "UNREAD" | "READING" | "READ" | "SUMMARIZED",
            rating: data.rating ?? undefined,
            mainConclusion: data.abstract || "",
            methods: "",
            notes: "",
            abstract: data.abstract || "",
            pdfUrl: "",
            background: "",
            researchQuestion: "",
            materials: "",
            keyResults: "",
            conclusion: "",
            innovations: "",
            limitations: "",
            usefulIdeas: "",
            personalNotes: "",
            followUpIdeas: "",
            relatedPaperIds: [],
            figures: [],
          } as PaperFormValues);
          setPaperDialogOpen(true);
        }}
      />

      <AutoClassifyDialog
        open={classifyOpen}
        onClose={() => setClassifyOpen(false)}
      />
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Field label="搜索">
              <Input
                defaultValue={searchParams.get("q") ?? ""}
                placeholder="标题 / 作者 / 期刊 / 标签"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateQuery("q", (event.target as HTMLInputElement).value);
                  }
                }}
              />
            </Field>
            <Field label="阅读状态">
              <Select value={searchParams.get("status") ?? "ALL"} onChange={(event) => updateQuery("status", event.target.value)}>
                <option value="ALL">全部状态</option>
                {PAPER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="标签筛选">
              <Input
                defaultValue={searchParams.get("tag") ?? ""}
                placeholder="输入标签后回车"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateQuery("tag", (event.target as HTMLInputElement).value);
                  }
                }}
              />
            </Field>
            <Field label="排序">
              <Select value={searchParams.get("sort") ?? "updatedAt-desc"} onChange={(event) => updateQuery("sort", event.target.value)}>
                {PAPER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {!folderId ? (
          <EmptyState title="还没有选择文件夹" description="先从左侧选择研究分类，再开始管理该文件夹下的文献。" />
        ) : papers.length === 0 ? (
          <EmptyState
            title="当前文件夹暂时没有文献"
            description="可以直接手动添加一篇文献，或者把固定字段的 CSV 内容导入进来。"
            actionLabel="添加文献"
            onAction={() => {
              setEditingPaper(undefined);
              setPaperDialogOpen(true);
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4 align-top text-sm text-slate-700">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PaperFormDialog
        open={paperDialogOpen}
        onClose={() => setPaperDialogOpen(false)}
        folderOptions={folderOptions}
        defaultFolderId={folderId}
        initialValues={editingPaper}
      />

      <Dialog open={Boolean(deletePaper)} onClose={() => setDeletePaper(null)} title="删除文献" description="删除后无法恢复，请确认。">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            将要删除的文献：
            <span className="font-medium text-slate-900">{deletePaper?.title}</span>
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeletePaper(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={pending}>
              {pending ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="导入 CSV"
        description="请粘贴 CSV 内容。支持 title, authors, journal, year, impactFactor, doi, sourceUrl, pdfUrl, tags, mainConclusion, methods, status, rating, notes。"
      >
        <div className="space-y-4">
          <Field label="CSV 内容">
            <input
              type="file"
              accept=".csv,text/csv"
              className="mb-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700"
              onChange={(event) => {
                void handleFileChange(event.target.files?.[0] ?? null);
              }}
            />
            {csvFilename ? <p className="mb-2 text-xs text-slate-500">已载入文件：{csvFilename}</p> : null}
            <textarea
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              className="min-h-72 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="title,authors,journal,year..."
            />
          </Field>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-600">
            <p className="font-medium text-slate-700">导入提示</p>
            <p>状态值请使用：UNREAD、READING、READ、SUMMARIZED。</p>
            <p>标签字段可以使用英文逗号或中文逗号分隔。</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImport} disabled={pending || !csvText.trim()}>
              <FileUp className="mr-1 h-4 w-4" />
              {pending ? "导入中..." : "开始导入"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = PAPER_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
  const className =
    status === "SUMMARIZED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "READ"
        ? "bg-sky-100 text-sky-700"
        : status === "READING"
          ? "bg-amber-100 text-amber-700"
          : "bg-slate-100 text-slate-700";

  return <Badge className={className}>{label}</Badge>;
}

function toEditValues(paper: TablePaper): PaperFormValues {
  return {
    id: paper.id,
    folderId: paper.folderId,
    title: paper.title,
    authors: paper.authors,
    journal: paper.journal ?? "",
    journalAbbr: (paper as any).journalAbbr ?? "",
    year: paper.year ?? undefined,
    impactFactor: paper.impactFactor ?? undefined,
    ifYear: (paper as any).ifYear ?? undefined,
    jcrQuartile: (paper as any).jcrQuartile ?? "",
    casQuartile: (paper as any).casQuartile ?? "",
    volume: (paper as any).volume ?? "",
    issue: (paper as any).issue ?? "",
    pages: (paper as any).pages ?? "",
    citationCount: (paper as any).citationCount ?? undefined,
    doi: paper.doi ?? "",
    sourceUrl: paper.sourceUrl ?? "",
    pdfUrl: paper.pdfUrl ?? "",
    tags: joinTags(paper.tags),
    mainConclusion: paper.mainConclusion ?? "",
    methods: paper.methods ?? "",
    status: paper.status as PaperFormValues["status"],
    rating: paper.rating ?? undefined,
    notes: paper.notes ?? "",
    abstract: paper.abstract ?? "",
    background: paper.background ?? "",
    researchQuestion: paper.researchQuestion ?? "",
    materials: paper.materials ?? "",
    keyResults: paper.keyResults ?? "",
    conclusion: paper.conclusion ?? "",
    innovations: paper.innovations ?? "",
    limitations: paper.limitations ?? "",
    usefulIdeas: paper.usefulIdeas ?? "",
    personalNotes: paper.personalNotes ?? "",
    followUpIdeas: paper.followUpIdeas ?? "",
    relatedPaperIds: paper.relatedPaperIds ?? [],
    figures: paper.figures.map((figure) => ({
      id: figure.id,
      imageUrl: figure.imageUrl ?? "",
      caption: figure.caption ?? "",
      explanation: figure.explanation ?? "",
    })),
  };
}
