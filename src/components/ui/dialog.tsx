"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ open, title, description, onClose, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className={cn("w-full max-w-4xl rounded-3xl bg-white shadow-2xl", className)}>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭弹窗">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
