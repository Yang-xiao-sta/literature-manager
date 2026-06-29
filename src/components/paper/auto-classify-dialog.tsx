"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { autoClassifyAction } from "@/actions/ai-actions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AutoClassifyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AutoClassifyDialog({ open, onClose }: AutoClassifyDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClassify = () => {
    startTransition(async () => {
      const result = await autoClassifyAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const data = result.data;
      if (data) {
        const parts: string[] = [];
        if (data.movedCount > 0) parts.push(`移动了 ${data.movedCount} 篇文献`);
        if (data.newFolderCount > 0) parts.push(`新建了 ${data.newFolderCount} 个文件夹`);
        if (data.errors.length > 0) parts.push(`${data.errors.length} 个错误`);

        toast.success(parts.length > 0 ? `整理完成：${parts.join("，")}。` : "无需整理的文献。");
      } else {
        toast.success(result.message);
      }

      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="一键整理文献"
      description="根据文献摘要自动分类到对应文件夹，可能创建新的文件夹。"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <FolderTree className="h-5 w-5 text-violet-700" />
            </div>
            <div className="space-y-2 text-sm leading-6 text-slate-600">
              <p>
                此功能将扫描<strong>所有已有摘要</strong>的文献，利用 AI 分析每篇文献的研究主题，
                并自动移动到最匹配的文件夹中。
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>已有匹配文件夹的文献将自动移动到对应文件夹</li>
                <li>没有匹配文件夹的文献将自动创建新文件夹</li>
                <li>没有摘要的文献不会被处理</li>
              </ul>
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                ⚠️ 此操作会移动文献到其他文件夹，如果文件夹结构较多请谨慎使用。
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            取消
          </Button>
          <Button onClick={handleClassify} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在分析整理中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                开始整理
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
