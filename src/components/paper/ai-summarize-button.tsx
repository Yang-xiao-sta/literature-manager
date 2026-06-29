"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { summarizePaperAction } from "@/actions/ai-actions";
import { Button } from "@/components/ui/button";

interface AiSummarizeButtonProps {
  paperId: string;
  hasAbstract: boolean;
  /** "detail" 用于详情页大按钮, "table" 用于表格行小按钮 */
  variant?: "detail" | "table";
}

export function AiSummarizeButton({ paperId, hasAbstract, variant = "detail" }: AiSummarizeButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!hasAbstract) {
      toast.error("该文献还没有填写摘要，请先填写摘要再使用 AI 总结。");
      return;
    }

    startTransition(async () => {
      const result = await summarizePaperAction(paperId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  if (variant === "table") {
    return (
      <button
        className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 ${
          hasAbstract
            ? "border-violet-200 text-violet-700"
            : "cursor-not-allowed border-slate-200 text-slate-400"
        }`}
        onClick={handleClick}
        disabled={pending || !hasAbstract}
        title={hasAbstract ? "AI 自动总结" : "需要先填写摘要"}
      >
        {pending ? (
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="mr-1 h-3.5 w-3.5" />
        )}
        AI 总结
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={pending || !hasAbstract}
      title={hasAbstract ? "AI 自动总结" : "需要先填写摘要"}
    >
      {pending ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-1 h-4 w-4" />
      )}
      {pending ? "AI 总结中..." : "AI 总结"}
    </Button>
  );
}
