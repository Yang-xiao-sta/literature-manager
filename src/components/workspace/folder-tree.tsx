"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ChevronDown, ChevronRight, FilePenLine, FolderPlus, FolderTree as FolderTreeIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createFolderAction, deleteFolderAction, renameFolderAction } from "@/actions/folder-actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FolderTreeNode } from "@/lib/folders";
import { cn } from "@/lib/utils";

type FolderTreeProps = {
  folders: FolderTreeNode[];
  activeFolderId?: string;
};

type FolderDialogMode = "create-root" | "create-child" | "rename" | "delete";

type FolderDialogState = {
  mode: FolderDialogMode;
  folder?: FolderTreeNode;
} | null;

export function FolderTree({ folders, activeFolderId }: FolderTreeProps) {
  const [dialogState, setDialogState] = useState<FolderDialogState>(null);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [expandedIds, setExpandedIds] = useState<string[]>(() => collectExpandedIds(folders, activeFolderId));

  const selectedTitle = useMemo(() => dialogState?.folder?.name ?? "", [dialogState]);

  const closeDialog = () => {
    setDialogState(null);
    setName("");
  };

  const openDialog = (mode: FolderDialogMode, folder?: FolderTreeNode) => {
    setDialogState({ mode, folder });
    setName(mode === "rename" || mode === "delete" ? folder?.name ?? "" : "");
  };

  const submitDialog = () => {
    if (!dialogState) {
      return;
    }

    startTransition(async () => {
      let result;

      if (dialogState.mode === "create-root") {
        result = await createFolderAction({ name, parentId: null });
      } else if (dialogState.mode === "create-child" && dialogState.folder) {
        result = await createFolderAction({ name, parentId: dialogState.folder.id });
      } else if (dialogState.mode === "rename" && dialogState.folder) {
        result = await renameFolderAction({ id: dialogState.folder.id, name, parentId: dialogState.folder.parentId });
      } else if (dialogState.mode === "delete" && dialogState.folder) {
        result = await deleteFolderAction({ id: dialogState.folder.id, name: dialogState.folder.name, confirmName: name });
      } else {
        return;
      }

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      closeDialog();
    });
  };

  const toggleExpanded = (folderId: string) => {
    setExpandedIds((current) => (current.includes(folderId) ? current.filter((id) => id !== folderId) : [...current, folderId]));
  };

  return (
    <>
      <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">文献分类树</p>
            <p className="text-xs text-slate-500">支持无限层级，删除时级联删除</p>
          </div>
          <Button size="sm" onClick={() => openDialog("create-root")}>
            <FolderPlus className="mr-1 h-4 w-4" />
            新建
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {folders.length ? (
            <div className="space-y-1">
              {folders.map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  activeFolderId={activeFolderId}
                  expandedIds={expandedIds}
                  onToggleExpanded={toggleExpanded}
                  onCreateChild={(targetFolder) => openDialog("create-child", targetFolder)}
                  onRename={(targetFolder) => openDialog("rename", targetFolder)}
                  onDelete={(targetFolder) => openDialog("delete", targetFolder)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
              <FolderTreeIcon className="mb-3 h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">还没有文件夹</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">先建立一个研究方向文件夹，右侧就可以开始录入文献。</p>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(dialogState)}
        onClose={closeDialog}
        title={resolveDialogTitle(dialogState?.mode)}
        description={resolveDialogDescription(dialogState)}
        className="max-w-xl"
      >
        <div className="space-y-4">
          <Field
            label={dialogState?.mode === "delete" ? "请输入文件夹名称确认删除" : "文件夹名称"}
            hint={dialogState?.mode === "delete" ? `需要输入“${selectedTitle}”才能继续。` : "建议使用研究方向、课题或实验主题命名。"}
          >
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入文件夹名称" />
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button variant={dialogState?.mode === "delete" ? "danger" : "default"} onClick={submitDialog} disabled={pending}>
              {pending ? "处理中..." : dialogState?.mode === "delete" ? "确认删除" : "保存"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

type FolderNodeProps = {
  folder: FolderTreeNode;
  activeFolderId?: string;
  expandedIds: string[];
  onToggleExpanded: (folderId: string) => void;
  onCreateChild: (folder: FolderTreeNode) => void;
  onRename: (folder: FolderTreeNode) => void;
  onDelete: (folder: FolderTreeNode) => void;
  depth?: number;
};

function FolderNode({
  folder,
  activeFolderId,
  expandedIds,
  onToggleExpanded,
  onCreateChild,
  onRename,
  onDelete,
  depth = 0,
}: FolderNodeProps) {
  const hasChildren = folder.children.length > 0;
  const isExpanded = expandedIds.includes(folder.id);
  const isActive = activeFolderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-2xl px-2 py-1.5 transition hover:bg-slate-100",
          isActive ? "bg-slate-900 text-white hover:bg-slate-900" : "text-slate-700",
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <button
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/5"
          onClick={() => (hasChildren ? onToggleExpanded(folder.id) : undefined)}
          aria-label={hasChildren ? "展开或折叠文件夹" : "文件夹"}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>
        <Link href={`/?folderId=${folder.id}`} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1" prefetch={false}>
          <span className="truncate text-sm font-medium">{folder.name}</span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px]",
              isActive ? "bg-white/15 text-white" : "bg-slate-200 text-slate-600",
            )}
          >
            {folder.paperCount}
          </span>
        </Link>
        <div className={cn("flex items-center gap-1 opacity-0 transition group-hover:opacity-100", isActive ? "opacity-100" : "")}>
          <ActionIcon title="新建子文件夹" onClick={() => onCreateChild(folder)}>
            <FolderPlus className="h-4 w-4" />
          </ActionIcon>
          <ActionIcon title="重命名" onClick={() => onRename(folder)}>
            <FilePenLine className="h-4 w-4" />
          </ActionIcon>
          <ActionIcon title="删除" onClick={() => onDelete(folder)}>
            <Trash2 className="h-4 w-4" />
          </ActionIcon>
        </div>
      </div>
      {hasChildren && isExpanded ? (
        <div className="mt-1 space-y-1">
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              activeFolderId={activeFolderId}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
              onCreateChild={onCreateChild}
              onRename={onRename}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ActionIcon({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/5" title={title} aria-label={title} onClick={onClick}>
      {children}
    </button>
  );
}

function collectExpandedIds(folders: FolderTreeNode[], activeFolderId?: string) {
  const expanded = new Set<string>();

  const walk = (nodes: FolderTreeNode[], parents: string[]) => {
    for (const node of nodes) {
      if (node.id === activeFolderId) {
        parents.forEach((parentId) => expanded.add(parentId));
      }
      walk(node.children, [...parents, node.id]);
    }
  };

  walk(folders, []);
  return Array.from(expanded);
}

function resolveDialogTitle(mode?: FolderDialogMode) {
  switch (mode) {
    case "create-root":
      return "新建文件夹";
    case "create-child":
      return "新建子文件夹";
    case "rename":
      return "重命名文件夹";
    case "delete":
      return "删除文件夹";
    default:
      return "文件夹";
  }
}

function resolveDialogDescription(state: FolderDialogState) {
  if (!state) {
    return "";
  }

  if (state.mode === "delete") {
    return "此操作会级联删除所有子文件夹和文献记录，请谨慎操作。";
  }

  if (state.mode === "create-child") {
    return `将在“${state.folder?.name ?? ""}”下创建子文件夹。`;
  }

  if (state.mode === "rename") {
    return `正在修改“${state.folder?.name ?? ""}”的名称。`;
  }

  return "建立新的一级研究分类。";
}
