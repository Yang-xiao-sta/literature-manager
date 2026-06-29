"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deepseekChat } from "@/lib/deepseek";
import { errorResult, successResult, type ActionResult } from "@/lib/action-state";
import { toActionError } from "@/lib/server-action-helpers";

// ---- 总结 ----

export async function summarizePaperAction(paperId: string): Promise<ActionResult> {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      select: { id: true, title: true, abstract: true, journal: true },
    });

    if (!paper) {
      return errorResult("文献不存在或已被删除。");
    }

    if (!paper.abstract || !paper.abstract.trim()) {
      return errorResult("该文献还没有填写摘要，请先填写摘要再使用 AI 总结。");
    }

    const userContent = [
      paper.title ? `标题：${paper.title}` : "",
      paper.journal ? `期刊：${paper.journal}` : "",
      `摘要：${paper.abstract}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await deepseekChat<{
      background: string;
      researchQuestion: string;
      methods: string;
      materials: string;
      keyResults: string;
      conclusion: string;
      innovations: string;
      limitations: string;
      usefulIdeas: string;
      followUpIdeas: string;
    }>([
      {
        role: "system",
        content:
          "你是一位专业的学术文献分析助手。请根据用户提供的文献摘要（以及可选的标题和期刊），生成结构化的详细中文总结。请严格按照 JSON 格式返回，字段包括：background, researchQuestion, methods, materials, keyResults, conclusion, innovations, limitations, usefulIdeas, followUpIdeas。只返回 JSON，不要添加额外文字。",
      },
      { role: "user", content: userContent },
    ]);

    if (!result.ok) {
      return errorResult(result.error);
    }

    const d = result.data;

    await prisma.paper.update({
      where: { id: paperId },
      data: {
        background: d.background || null,
        researchQuestion: d.researchQuestion || null,
        methods: d.methods || null,
        materials: d.materials || null,
        keyResults: d.keyResults || null,
        conclusion: d.conclusion || null,
        innovations: d.innovations || null,
        limitations: d.limitations || null,
        usefulIdeas: d.usefulIdeas || null,
        followUpIdeas: d.followUpIdeas || null,
        status: "SUMMARIZED",
      },
    });

    revalidatePath("/");
    revalidatePath(`/papers/${paperId}`);

    return successResult("AI 总结已完成，文献状态已更新为「已总结」。");
  } catch (error) {
    return toActionError(error);
  }
}

// ---- 自动分类 ----

export async function autoClassifyAction(folderId?: string): Promise<
  ActionResult<{
    movedCount: number;
    newFolderCount: number;
    skippedCount: number;
    errors: string[];
  }>
> {
  try {
    // 查询所有有摘要的论文
    const papers = await prisma.paper.findMany({
      where: {
        abstract: { not: null },
        ...(folderId ? { folderId } : {}),
      },
      select: { id: true, title: true, abstract: true },
    });

    if (papers.length === 0) {
      return successResult("没有找到有摘要的文献需要分类。", {
        movedCount: 0,
        newFolderCount: 0,
        skippedCount: 0,
        errors: [],
      });
    }

    // 查询所有文件夹
    const folders = await prisma.folder.findMany({
      select: { id: true, name: true },
    });

    const userContent = JSON.stringify({
      papers: papers.map((p) => ({ id: p.id, title: p.title, abstract: p.abstract })),
      existingFolders: folders.map((f) => ({ id: f.id, name: f.name })),
    });

    const result = await deepseekChat<{
      classifications: Array<{
        paperId: string;
        suggestedFolderId?: string;
        suggestedNewFolder?: string;
      }>;
    }>([
      {
        role: "system",
        content:
          "你是一位学术文献分类助手。请根据每篇文献的标题和摘要，判断其所属的研究领域/主题，并与已有的文件夹匹配。返回 JSON 格式：{ \"classifications\": [{ \"paperId\": \"...\", \"suggestedFolderId\": \"...\" 或 \"suggestedNewFolder\": \"...\" }] }。优先使用 existingFolders 中已有的文件夹 id；如果没有匹配的文件夹，则建议一个新的文件夹名称。只返回 JSON，不要添加额外文字。",
      },
      { role: "user", content: userContent },
    ]);

    if (!result.ok) {
      return errorResult(result.error) as ActionResult<{
        movedCount: number;
        newFolderCount: number;
        skippedCount: number;
        errors: string[];
      }>;
    }

    const classifications = result.data.classifications || [];
    let movedCount = 0;
    let newFolderCount = 0;
    const errors: string[] = [];

    for (const item of classifications) {
      try {
        // 检查 paper 是否存在
        const paper = await prisma.paper.findUnique({
          where: { id: item.paperId },
          select: { id: true },
        });
        if (!paper) {
          errors.push(`文献 ${item.paperId} 不存在，已跳过`);
          continue;
        }

        let targetFolderId: string | null = null;

        if (item.suggestedFolderId) {
          // 使用已有文件夹
          const folder = folders.find((f) => f.id === item.suggestedFolderId);
          if (folder) {
            targetFolderId = item.suggestedFolderId;
          }
        }

        if (!targetFolderId && item.suggestedNewFolder) {
          // 创建新文件夹
          const newFolder = await prisma.folder.create({
            data: { name: item.suggestedNewFolder.trim() },
          });
          targetFolderId = newFolder.id;
          newFolderCount++;
        }

        if (targetFolderId) {
          await prisma.paper.update({
            where: { id: item.paperId },
            data: { folderId: targetFolderId },
          });
          movedCount++;
        }
      } catch (e) {
        errors.push(`处理文献 ${item.paperId} 时出错: ${(e as Error).message}`);
      }
    }

    revalidatePath("/");

    const message = `整理完成：移动了 ${movedCount} 篇文献，新建了 ${newFolderCount} 个文件夹${errors.length ? `，${errors.length} 个错误` : ""}。`;
    return successResult(message, {
      movedCount,
      newFolderCount,
      skippedCount: papers.length - movedCount,
      errors,
    });
  } catch (error) {
    const failure = toActionError(error);
    return failure as ActionResult<{
      movedCount: number;
      newFolderCount: number;
      skippedCount: number;
      errors: string[];
    }>;
  }
}
