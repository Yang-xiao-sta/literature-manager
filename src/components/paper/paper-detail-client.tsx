"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, PencilLine } from "lucide-react";
import { PaperFormDialog } from "@/components/paper/paper-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { PAPER_STATUS_OPTIONS } from "@/lib/constants";
import type { FolderOption } from "@/lib/folders";
import type { PaperFormValues } from "@/lib/schemas";
import { formatDateTime, formatNullableText, joinTags } from "@/lib/utils";

type FigureItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
  explanation: string | null;
};

type PaperDetail = {
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
  abstract: string | null;
  background: string | null;
  researchQuestion: string | null;
  materials: string | null;
  keyResults: string | null;
  conclusion: string | null;
  innovations: string | null;
  limitations: string | null;
  usefulIdeas: string | null;
  personalNotes: string | null;
  followUpIdeas: string | null;
  relatedPaperIds: string[];
  createdAt: Date;
  updatedAt: Date;
  folder: {
    id: string;
    name: string;
  };
  figures: FigureItem[];
};

type PaperDetailClientProps = {
  paper: PaperDetail;
  folderOptions: FolderOption[];
  relatedTitles: string[];
  initialValues: PaperFormValues;
};

export function PaperDetailClient({ paper, folderOptions, relatedTitles, initialValues }: PaperDetailClientProps) {
  const [editing, setEditing] = useState(false);

  const statusLabel = useMemo(() => PAPER_STATUS_OPTIONS.find((option) => option.value === paper.status)?.label ?? paper.status, [paper.status]);

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <Link href={`/?folderId=${paper.folderId}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
                <ArrowLeft className="mr-1 h-4 w-4" />
                返回当前文件夹
              </Link>
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{paper.folder.name}</Badge>
                  <Badge className="bg-slate-900 text-white">{statusLabel}</Badge>
                  {paper.rating ? <Badge className="bg-amber-100 text-amber-700">重要程度 {paper.rating}/5</Badge> : null}
                </div>
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950">{paper.title}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {paper.authors || "未填写作者"} · {paper.journal || "未填写期刊"} · {paper.year || "年份未填"}
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                <MetaItem label="影响因子" value={paper.impactFactor ? paper.impactFactor.toFixed(1) : "未填写"} />
                <MetaItem label="DOI" value={paper.doi ?? "未填写"} />
                <MetaItem label="原文链接" value={paper.sourceUrl ?? "未填写"} link={paper.sourceUrl ?? undefined} />
                <MetaItem label="PDF 链接" value={paper.pdfUrl ?? "未填写"} link={paper.pdfUrl ?? undefined} />
                <MetaItem label="标签" value={joinTags(paper.tags) || "未填写"} />
                <MetaItem label="最近更新" value={formatDateTime(paper.updatedAt)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <PencilLine className="mr-1 h-4 w-4" />
                编辑文献
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard title="详细总结" description="适合继续按 Markdown 风格补充长文本。">
              <div className="grid gap-5 md:grid-cols-2">
                <MarkdownBlock title="摘要" content={paper.abstract} className="md:col-span-2" />
                <MarkdownBlock title="研究背景" content={paper.background} />
                <MarkdownBlock title="研究问题" content={paper.researchQuestion} />
                <MarkdownBlock title="实验 / 研究方法" content={paper.methods} />
                <MarkdownBlock title="数据集或实验材料" content={paper.materials} />
                <MarkdownBlock title="主要结果" content={paper.keyResults} />
                <MarkdownBlock title="主要结论" content={paper.conclusion ?? paper.mainConclusion} />
                <MarkdownBlock title="创新点" content={paper.innovations} />
                <MarkdownBlock title="局限性" content={paper.limitations} />
                <MarkdownBlock title="可借鉴之处" content={paper.usefulIdeas} />
                <MarkdownBlock title="个人思考" content={paper.personalNotes ?? paper.notes} />
                <MarkdownBlock title="后续可做" content={paper.followUpIdeas} className="md:col-span-2" />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="图表记录" description="图像可先使用 URL，后续可以无缝替换为本地上传或对象存储。">
              <div className="space-y-4">
                {paper.figures.length ? (
                  paper.figures.map((figure) => (
                    <div key={figure.id} className="overflow-hidden rounded-3xl border border-slate-200">
                      <div className="relative h-56 bg-slate-100">
                        <Image src={figure.imageUrl} alt={figure.caption ?? "文献图表"} fill unoptimized className="object-cover" />
                      </div>
                      <div className="space-y-2 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">{figure.caption || "未填写图题"}</p>
                        <p className="text-sm leading-6 text-slate-600">{figure.explanation || "未填写图表解释"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">当前文献还没有图表记录。</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="快速摘要" description="帮助你在总览和筛选时快速回忆这篇文章。">
              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <SummaryRow label="主要结论" value={paper.mainConclusion} />
                <SummaryRow label="关键方法" value={paper.methods} />
                <SummaryRow label="备注" value={paper.notes} />
                <SummaryRow label="关联文献" value={relatedTitles.length ? relatedTitles.join("；") : "暂未关联"} />
                <SummaryRow label="创建时间" value={formatDateTime(paper.createdAt)} />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <PaperFormDialog open={editing} onClose={() => setEditing(false)} folderOptions={folderOptions} initialValues={initialValues} title="编辑文献与详细总结" />
    </>
  );
}

function MetaItem({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="mt-2 line-clamp-2 break-all text-sm text-sky-700 hover:underline">
          {value}
        </a>
      ) : (
        <p className="mt-2 break-all text-sm text-slate-700">{value}</p>
      )}
    </div>
  );
}

function MarkdownBlock({ title, content, className }: { title: string; content: string | null; className?: string }) {
  return (
    <div className={className}>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
        {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p>{formatNullableText(content)}</p>}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{formatNullableText(value)}</p>
    </div>
  );
}
