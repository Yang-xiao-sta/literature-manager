import Papa from "papaparse";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAPER_STATUS_OPTIONS } from "@/lib/constants";
import { downloadCsvFilename, joinTags, safeJsonArrayParse } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      folderId: string;
    }>;
  },
) {
  const { folderId } = await context.params;

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: { id: true, name: true },
  });

  if (!folder) {
    return new Response("Folder not found", { status: 404 });
  }

  const papers = await prisma.paper.findMany({
    where: { folderId },
    orderBy: { updatedAt: "desc" },
  });

  const csv = Papa.unparse(
    papers.map((paper) => ({
      title: paper.title,
      authors: paper.authors,
      journal: paper.journal ?? "",
      year: paper.year ?? "",
      impactFactor: paper.impactFactor ?? "",
      doi: paper.doi ?? "",
      sourceUrl: paper.sourceUrl ?? "",
      pdfUrl: paper.pdfUrl ?? "",
      tags: joinTags(safeJsonArrayParse(paper.tags)),
      mainConclusion: paper.mainConclusion ?? "",
      methods: paper.methods ?? "",
      status: paper.status,
      statusLabel: PAPER_STATUS_OPTIONS.find((item) => item.value === paper.status)?.label ?? paper.status,
      rating: paper.rating ?? "",
      notes: paper.notes ?? "",
    })),
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadCsvFilename(folder.name))}"`,
    },
  });
}
