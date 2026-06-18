"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { folderFormSchema } from "@/lib/schemas";
import { errorResult, successResult, type ActionResult } from "@/lib/action-state";
import { toActionError } from "@/lib/server-action-helpers";

export async function createFolderAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const values = folderFormSchema.parse(input);

    const folder = await prisma.folder.create({
      data: {
        name: values.name,
        parentId: values.parentId ?? null,
      },
    });

    revalidatePath("/");
    return successResult("文件夹已创建。", { id: folder.id });
  } catch (error) {
    const failure = toActionError(error);
    return { ...failure, data: undefined };
  }
}

export async function renameFolderAction(input: unknown): Promise<ActionResult> {
  try {
    const values = folderFormSchema.extend({ id: folderFormSchema.shape.id.unwrap() }).parse(input);

    await prisma.folder.update({
      where: { id: values.id },
      data: {
        name: values.name,
      },
    });

    revalidatePath("/");
    return successResult("文件夹已重命名。");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteFolderAction(input: unknown): Promise<ActionResult> {
  try {
    const payload = folderFormSchema.pick({ id: true }).extend({
      id: folderFormSchema.shape.id.unwrap(),
      confirmName: folderFormSchema.shape.name,
    }).parse(input);

    const folder = await prisma.folder.findUnique({
      where: { id: payload.id },
    });

    if (!folder) {
      return errorResult("文件夹不存在或已被删除。");
    }

    if (folder.name !== payload.confirmName) {
      return errorResult("确认名称不匹配，请重新输入文件夹名称。");
    }

    await prisma.folder.delete({
      where: { id: payload.id },
    });

    revalidatePath("/");
    return successResult("文件夹及其子内容已删除。");
  } catch (error) {
    return toActionError(error);
  }
}
