import { Prisma, type PaperStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toPaperViewModel } from "@/lib/paper-mappers";
import type { PaperFilterValues } from "@/lib/schemas";

export async function getFolderPapers(folderId: string, filters: PaperFilterValues) {
  const where: Prisma.PaperWhereInput = {
    folderId,
    ...(filters.status !== "ALL" ? { status: filters.status as PaperStatus } : {}),
    ...(filters.tag
      ? {
          tags: {
            contains: `"${filters.tag}"`,
          },
        }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q } },
            { authors: { contains: filters.q } },
            { journal: { contains: filters.q } },
            { mainConclusion: { contains: filters.q } },
            { methods: { contains: filters.q } },
            { tags: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const orderBy = resolveSort(filters.sort);

  const papers = await prisma.paper.findMany({
    where,
    include: {
      figures: true,
    },
    orderBy,
  });

  return papers.map(toPaperViewModel);
}

export async function getPaperById(paperId: string) {
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    include: {
      folder: true,
      figures: true,
    },
  });

  if (!paper) {
    return null;
  }

  return {
    ...toPaperViewModel(paper),
    folder: paper.folder,
  };
}

export async function getAllPapersForRelations() {
  return prisma.paper.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: "asc" },
  });
}

function resolveSort(sort: string): Prisma.PaperOrderByWithRelationInput[] {
  switch (sort) {
    case "year-desc":
      return [{ year: "desc" }, { updatedAt: "desc" }];
    case "year-asc":
      return [{ year: "asc" }, { updatedAt: "desc" }];
    case "impactFactor-desc":
      return [{ impactFactor: "desc" }, { updatedAt: "desc" }];
    case "rating-desc":
      return [{ rating: "desc" }, { updatedAt: "desc" }];
    case "title-asc":
      return [{ title: "asc" }];
    case "updatedAt-desc":
    default:
      return [{ updatedAt: "desc" }];
  }
}
