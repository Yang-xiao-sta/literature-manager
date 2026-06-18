import { ArrowDownWideNarrow, FolderOpenDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WorkspaceHeaderProps = {
  folderName?: string;
  folderPath: string[];
  totalFolders: number;
  totalPapers: number;
};

export function WorkspaceHeader({ folderName, folderPath, totalFolders, totalPapers }: WorkspaceHeaderProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(235,244,255,0.92))] p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-900 text-white">
              <FolderOpenDot className="mr-1 h-3.5 w-3.5" />
              本地 MVP
            </Badge>
            <Badge className="bg-sky-100 text-sky-700">{totalFolders} 个文件夹</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">{totalPapers} 篇文献</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">文献记录与总结管理网站</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            用树状分类管理研究方向，用表格记录核心信息，再把详细总结沉淀到单篇文献页面。当前聚焦本地可运行的科研文献管理 MVP。
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-600">
          <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
            <ArrowDownWideNarrow className="h-4 w-4" />
            当前文件夹
          </div>
          <p>{folderName ?? "请从左侧选择文件夹"}</p>
          <p className="mt-1 text-xs text-slate-500">{folderPath.length ? folderPath.join(" / ") : "未选择分类"}</p>
        </div>
      </div>
    </section>
  );
}
