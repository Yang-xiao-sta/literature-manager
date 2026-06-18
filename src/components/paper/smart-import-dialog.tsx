"use client";

import { useState, useTransition } from "react";
import { Search, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import type { FolderOption } from "@/lib/folders";

interface LookupResult {
  title: string;
  authors: string;
  journal: string;
  journalAbbr: string;
  year: number | null;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  citationCount: number | null;
  abstract: string;
  sourceUrl: string;
  impactFactor: number | null;
  ifYear: number | null;
  jcrQuartile: string;
  casQuartile: string;
  error?: string;
}

interface SmartImportDialogProps {
  open: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultFolderId?: string;
  onImport: (data: LookupResult & { folderId: string; tags: string; status: string; rating?: number }) => void;
}

const MODE_LABELS: Record<string, string> = {
  doi: "DOI 查询",
  title: "标题查询",
  url: "链接查询",
};

const PLACEHOLDER_MAP: Record<string, string> = {
  doi: "输入 DOI，例如 10.1038/s41586-024-12345-6",
  title: "输入论文标题关键词",
  url: "输入论文链接（支持 doi.org 等）",
};

export function SmartImportDialog({
  open,
  onClose,
  folderOptions,
  defaultFolderId,
  onImport,
}: SmartImportDialogProps) {
  const [mode, setMode] = useState<"doi" | "title" | "url">("doi");
  const [input, setInput] = useState("");
  const [folderId, setFolderId] = useState(defaultFolderId || "");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importing, startImporting] = useTransition();
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("UNREAD");
  const [rating, setRating] = useState<number | undefined>(undefined);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (mode === "doi") params.set("doi", input.trim());
      else if (mode === "title") params.set("title", input.trim());
      else params.set("url", input.trim());
      const res = await fetch("/api/literature?" + params.toString());
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "查询失败");
        return;
      }
      setResult(data);
      if (data.journal) setTags(data.journal);
    } catch (e: any) {
      setError("网络错误: " + (e.message || "请检查网络连接"));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!result || !folderId) return;
    startImporting(async () => {
      onImport({ ...result, folderId, tags, status, rating });
      toast.success("文献信息已导入，请确认并保存");
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="智能导入文献"
      description="通过 DOI、标题或链接自动获取完整文献信息和影响因子"
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          {(["doi", "title", "url"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setError(""); }}
              className={"rounded-full px-4 py-1.5 text-sm font-medium transition " + (mode === m ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER_MAP[mode]}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            查询
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">文献信息已获取</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{result.title}</p>
                {result.doi && (
                  <a href={"https://doi.org/" + result.doi} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-sky-600 hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    {result.doi}
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-600">{result.authors || "作者信息未获取"}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{result.journal}</span>
                {result.journalAbbr && <span className="text-xs text-slate-400">({result.journalAbbr})</span>}
                {result.year && <Badge className="bg-slate-200 text-slate-700 text-xs">{result.year}</Badge>}
              </div>
              <div className="flex flex-wrap gap-3">
                {result.impactFactor != null && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    IF={result.impactFactor.toFixed(1)}
                    {result.ifYear && <span className="font-normal">({result.ifYear})</span>}
                  </span>
                )}
                {result.jcrQuartile && (
                  <span className="rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">JCR {result.jcrQuartile}</span>
                )}
                {result.casQuartile && (
                  <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">中科院 {result.casQuartile}</span>
                )}
                {result.citationCount != null && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">引用 {result.citationCount} 次</span>
                )}
              </div>
              {(result.volume || result.issue || result.pages) && (
                <p className="text-xs text-slate-500">
                  {[result.volume && "Vol." + result.volume, result.issue && "No." + result.issue, result.pages && "pp." + result.pages].filter(Boolean).join(", ")}
                </p>
              )}
              {result.abstract && (
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">{result.abstract}</p>
              )}
            </div>

            <div className="grid gap-3 border-t border-emerald-200 pt-4 md:grid-cols-2">
              <Field label="导入到文件夹" required>
                <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                  <option value="">请选择文件夹</option>
                  {folderOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{"　".repeat(opt.depth)}{opt.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="阅读状态">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                  <option value="UNREAD">未读</option>
                  <option value="READING">阅读中</option>
                  <option value="READ">已读</option>
                  <option value="SUMMARIZED">已总结</option>
                </select>
              </Field>
              <Field label="标签（逗号分隔）">
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="单细胞, 综述" />
              </Field>
              <Field label="重要程度 1-5">
                <Input type="number" min={1} max={5} value={rating ?? ""} onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)} placeholder="1-5" />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-emerald-200 pt-4">
              <Button variant="outline" onClick={onClose}>取消</Button>
              <Button onClick={handleImport} disabled={!folderId || importing}>
                {importing ? "导入中..." : "导入并填写详细"}
              </Button>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-sm text-slate-500">
            <p>输入 DOI、标题或链接后点击"查询"自动获取文献信息</p>
            <p className="mt-1 text-xs">查询失败时可以手动录入</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
