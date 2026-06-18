"use server";

import { PaperStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toPaperCreateInput } from "@/lib/paper-mappers";
import { csvImportRecordSchema, paperFormSchema } from "@/lib/schemas";
import { errorResult, successResult, type ActionResult } from "@/lib/action-state";
import { toActionError } from "@/lib/server-action-helpers";
import { splitTags } from "@/lib/utils";

export async function upsertPaperAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const values = paperFormSchema.parse(input);
    const paperData = toPaperCreateInput(values);

    const paper = values.id
      ? await prisma.paper.update({
          where: { id: values.id },
          data: {
            ...paperData,
            figures: {
              deleteMany: {},
              create: values.figures
                .filter((figure) => figure.imageUrl)
                .map((figure) => ({
                  imageUrl: figure.imageUrl,
                  caption: figure.caption || null,
                  explanation: figure.explanation || null,
                })),
            },
          },
        })
      : await prisma.paper.create({
          data: {
            ...paperData,
            figures: {
              create: values.figures
                .filter((figure) => figure.imageUrl)
                .map((figure) => ({
                  imageUrl: figure.imageUrl,
                  caption: figure.caption || null,
                  explanation: figure.explanation || null,
                })),
            },
          },
        });

    revalidatePath("/");
    revalidatePath(`/papers/${paper.id}`);

    return successResult(values.id ? "文献已更新。" : "文献已创建。", { id: paper.id });
  } catch (error) {
    const failure = toActionError(error);
    return { ...failure, data: undefined };
  }
}

export async function deletePaperAction(input: unknown): Promise<ActionResult> {
  try {
    const payload = paperFormSchema
      .pick({ id: true, title: true })
      .extend({
        id: z.string().min(1, "缺少文献 ID"),
      })
      .parse(input);

    const paper = await prisma.paper.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });

    if (!paper) {
      return errorResult("文献不存在或已被删除。");
    }

    await prisma.paper.delete({
      where: { id: payload.id },
    });

    revalidatePath("/");
    revalidatePath(`/papers/${payload.id}`);
    return successResult("文献已删除。");
  } catch (error) {
    return toActionError(error);
  }
}

export async function importCsvPapersAction(input: unknown): Promise<ActionResult<{ successCount: number; failureCount: number }>> {
  try {
    const payload = z
      .object({
        folderId: z.string().min(1, "请选择导入目标文件夹"),
        records: z.array(z.record(z.string(), z.string())),
      })
      .parse(input);

    let successCount = 0;
    let failureCount = 0;

    for (const record of payload.records) {
      const parsed = csvImportRecordSchema.safeParse(record);

      if (!parsed.success) {
        failureCount += 1;
        continue;
      }

      await prisma.paper.create({
        data: {
          folderId: payload.folderId,
          title: parsed.data.title,
          authors: parsed.data.authors,
          journal: parsed.data.journal || null,
          journalAbbr: null,
          year: parsed.data.year ?? null,
          ifYear: null,
          jcrQuartile: null,
          casQuartile: null,
          volume: null,
          issue: null,
          pages: null,
          citationCount: null,
          impactFactor: parsed.data.impactFactor ?? null,
          doi: parsed.data.doi || null,
          sourceUrl: parsed.data.sourceUrl || null,
          pdfUrl: parsed.data.pdfUrl || null,
          tags: JSON.stringify(splitTags(parsed.data.tags)),
          mainConclusion: parsed.data.mainConclusion || null,
          methods: parsed.data.methods || null,
          status: parsed.data.status as PaperStatus,
          rating: parsed.data.rating ?? null,
          notes: parsed.data.notes || null,
          relatedPaperIds: JSON.stringify([]),
        },
      });

      successCount += 1;
    }

    revalidatePath("/");
    return successResult(`CSV 导入完成：成功 ${successCount} 条，失败 ${failureCount} 条。`, { successCount, failureCount });
  } catch (error) {
    const failure = toActionError(error);
    return { ...failure, data: undefined };
  }
}
