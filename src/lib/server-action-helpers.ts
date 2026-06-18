import { ZodError } from "zod";
import { errorResult } from "@/lib/action-state";

export function zodErrorToFieldErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}

export function toActionError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResult("表单校验未通过，请检查输入内容。", zodErrorToFieldErrors(error));
  }

  if (error instanceof Error) {
    return errorResult(error.message);
  }

  return errorResult("操作失败，请稍后重试。");
}
