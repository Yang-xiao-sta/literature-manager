import { prisma } from "@/lib/prisma";
import { safeJsonArrayParse } from "@/lib/utils";

type FolderRecord = Awaited<ReturnType<typeof prisma.folder.findMany>>[number];
type PaperSummary = {
  id: string;
  title: string;
};

export type FolderTreeNode = {
  id: string;
  name: string;
  parentId: string | null;
  paperCount: number;
  children: FolderTreeNode[];
};

export type FolderOption = {
  id: string;
  name: string;
  depth: number;
};

export async function getFolderTree() {
  const folders = await prisma.folder.findMany({
    include: {
      papers: {
        select: { id: true },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  const byId = new Map<
    string,
    FolderTreeNode & {
      parentId: string | null;
    }
  >();

  for (const folder of folders) {
    byId.set(folder.id, {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      paperCount: folder.papers.length,
      children: [],
    });
  }

  const roots: FolderTreeNode[] = [];

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const accumulate = (node: FolderTreeNode): number => {
    const childCount = node.children.reduce((sum, child) => sum + accumulate(child), 0);
    node.paperCount += childCount;
    node.children.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    return node.paperCount;
  };

  roots.forEach(accumulate);
  roots.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

  return roots;
}

export async function getFolderOptions() {
  const folders = await prisma.folder.findMany({
    orderBy: [{ name: "asc" }],
  });

  const byParent = new Map<string | null, FolderRecord[]>();

  for (const folder of folders) {
    const key = folder.parentId ?? null;
    const bucket = byParent.get(key) ?? [];
    bucket.push(folder);
    byParent.set(key, bucket);
  }

  const walk = (parentId: string | null = null, depth = 0): FolderOption[] => {
    const siblings = (byParent.get(parentId) ?? []).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    return siblings.flatMap((folder) => [{ id: folder.id, name: folder.name, depth }, ...walk(folder.id, depth + 1)]);
  };

  return walk();
}

export async function getFolderById(folderId: string) {
  return prisma.folder.findUnique({
    where: { id: folderId },
  });
}

export async function getPreferredFolderId() {
  const paper = await prisma.paper.findFirst({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      folderId: true,
    },
  });

  return paper?.folderId ?? null;
}

export async function getFolderPath(folderId: string) {
  const folders = await prisma.folder.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    },
  });

  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const path: string[] = [];
  let current = byId.get(folderId);

  while (current) {
    path.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

export function resolveRelatedTitles(allPapers: PaperSummary[], relatedPaperIds: string[]) {
  const titleMap = new Map(allPapers.map((paper) => [paper.id, paper.title]));
  return relatedPaperIds.map((id) => titleMap.get(id)).filter((title): title is string => Boolean(title));
}

export function parseStoredRelatedPaperIds(value: string) {
  return safeJsonArrayParse(value);
}
