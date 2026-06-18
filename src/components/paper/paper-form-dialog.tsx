"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { upsertPaperAction } from "@/actions/paper-actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAPER_STATUS_OPTIONS } from "@/lib/constants";
import { paperFormSchema, type PaperFormValues } from "@/lib/schemas";
import type { FolderOption } from "@/lib/folders";
import { SubmitButton } from "@/components/ui/form-actions";
import type { z } from "zod";

type PaperFormDialogProps = {
  open: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultFolderId?: string;
  initialValues?: PaperFormValues;
  onSaved?: (paperId: string) => void;
  title?: string;
};

const emptyValues: PaperFormValues = {
  folderId: "",
  title: "",
  authors: "",
  journal: "",
  journalAbbr: "",
  year: undefined,
  ifYear: undefined,
  jcrQuartile: "",
  casQuartile: "",
  volume: "",
  issue: "",
  pages: "",
  citationCount: undefined,
  impactFactor: undefined,
  doi: "",
  sourceUrl: "",
  pdfUrl: "",
  tags: "",
  mainConclusion: "",
  methods: "",
  status: "UNREAD",
  rating: undefined,
  notes: "",
  abstract: "",
  background: "",
  researchQuestion: "",
  materials: "",
  keyResults: "",
  conclusion: "",
  innovations: "",
  limitations: "",
  usefulIdeas: "",
  personalNotes: "",
  followUpIdeas: "",
  relatedPaperIds: [],
  figures: [],
};

type PaperFormInputValues = z.input<typeof paperFormSchema>;

export function PaperFormDialog({
  open,
  onClose,
  folderOptions,
  defaultFolderId,
  initialValues,
  onSaved,
  title,
}: PaperFormDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<PaperFormInputValues, undefined, PaperFormValues>({
    resolver: zodResolver(paperFormSchema),
    defaultValues: initialValues ?? {
      ...emptyValues,
        folderId: defaultFolderId ?? "",
    },
  });

  const figures = useFieldArray({
    control: form.control,
    name: "figures",
  });

  useEffect(() => {
    form.reset(
      initialValues ?? {
        ...emptyValues,
        folderId: defaultFolderId ?? "",
      },
    );
  }, [defaultFolderId, form, initialValues, open]);

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertPaperAction(values);

      if (!result.ok) {
        toast.error(result.message);
        if (result.fieldErrors) {
          for (const [path, message] of Object.entries(result.fieldErrors)) {
            form.setError(path as keyof PaperFormInputValues, { message });
          }
        }
        return;
      }

      toast.success(result.message);
      router.refresh();
      onSaved?.(result.data?.id ?? values.id ?? "");
      onClose();
    });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title ?? (initialValues?.id ? "编辑文献" : "添加文献")}
      description="支持基础信息、总结内容和图表记录一并维护。"
    >
      <form className="space-y-8" onSubmit={submit}>
        <section className="grid gap-4 md:grid-cols-2">
          <Field label="标题" error={form.formState.errors.title?.message} required className="md:col-span-2">
            <Input {...form.register("title")} placeholder="请输入文献标题" />
          </Field>
          <Field label="作者" error={form.formState.errors.authors?.message}>
            <Input {...form.register("authors")} placeholder="多位作者可用分号分隔" />
          </Field>
          <Field label="所属文件夹" error={form.formState.errors.folderId?.message} required>
            <Select {...form.register("folderId")}>
              <option value="">请选择文件夹</option>
              {folderOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {"　".repeat(option.depth)}
                  {option.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="期刊">
            <Input {...form.register("journal")} placeholder="例如 Nature" />
          </Field>
          <Field label="期刊缩写" className="md:col-span-2">
            <Input {...form.register("journalAbbr")} placeholder="ISO 4 缩写，如 Nat. Methods" />
          </Field>
          <Field label="发表年份" error={form.formState.errors.year?.message}>
            <Input {...form.register("year")} type="number" placeholder="2024" />
          </Field>
          <Field label="卷">
            <Input {...form.register("volume")} placeholder="Vol." />
          </Field>
          <Field label="期">
            <Input {...form.register("issue")} placeholder="No." />
          </Field>
          <Field label="页码">
            <Input {...form.register("pages")} placeholder="123-145" />
          </Field>
          <Field label="影响因子" error={form.formState.errors.impactFactor?.message}>
            <Input {...form.register("impactFactor")} type="number" step="0.1" placeholder="12.5" />
          </Field>
          <Field label="IF 年份" error={form.formState.errors.ifYear?.message}>
            <Input {...form.register("ifYear")} type="number" placeholder="2023" />
          </Field>
          <Field label="JCR 分区">
            <Input {...form.register("jcrQuartile")} placeholder="Q1" />
          </Field>
          <Field label="中科院分区">
            <Input {...form.register("casQuartile")} placeholder="1区" />
          </Field>
          <Field label="DOI" error={form.formState.errors.doi?.message}>
            <Input {...form.register("doi")} placeholder="10.xxxx/xxxx" />
          </Field>
          <Field label="引用次数" error={form.formState.errors.citationCount?.message}>
            <Input {...form.register("citationCount")} type="number" placeholder="0" />
          </Field>
          <Field label="原文链接" error={form.formState.errors.sourceUrl?.message}>
            <Input {...form.register("sourceUrl")} placeholder="https://..." />
          </Field>
          <Field label="PDF 链接或路径" error={form.formState.errors.pdfUrl?.message}>
            <Input {...form.register("pdfUrl")} placeholder="https://... 或本地映射路径" />
          </Field>
          <Field label="标签" className="md:col-span-2">
            <Input {...form.register("tags")} placeholder="免疫检查点, 单细胞, 综述" />
          </Field>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Field label="阅读状态" error={form.formState.errors.status?.message}>
            <Select {...form.register("status")}>
              {PAPER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="重要程度" error={form.formState.errors.rating?.message}>
            <Input {...form.register("rating")} type="number" min={1} max={5} placeholder="1-5" />
          </Field>
          <Field label="主要结论" className="md:col-span-2">
            <Textarea {...form.register("mainConclusion")} placeholder="简洁记录该文献最核心的结论" />
          </Field>
          <Field label="关键方法" className="md:col-span-2">
            <Textarea {...form.register("methods")} placeholder="记录方法学关键词、实验设计或分析框架" />
          </Field>
          <Field label="备注" className="md:col-span-2">
            <Textarea {...form.register("notes")} placeholder="补充待阅读点、可复现内容或组会提示" />
          </Field>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Field label="摘要" className="md:col-span-2">
            <Textarea {...form.register("abstract")} />
          </Field>
          <Field label="研究背景">
            <Textarea {...form.register("background")} />
          </Field>
          <Field label="研究问题">
            <Textarea {...form.register("researchQuestion")} />
          </Field>
          <Field label="实验材料/数据集">
            <Textarea {...form.register("materials")} />
          </Field>
          <Field label="主要结果">
            <Textarea {...form.register("keyResults")} />
          </Field>
          <Field label="主要结论">
            <Textarea {...form.register("conclusion")} />
          </Field>
          <Field label="创新点">
            <Textarea {...form.register("innovations")} />
          </Field>
          <Field label="局限性">
            <Textarea {...form.register("limitations")} />
          </Field>
          <Field label="可借鉴之处">
            <Textarea {...form.register("usefulIdeas")} />
          </Field>
          <Field label="个人思考">
            <Textarea {...form.register("personalNotes")} />
          </Field>
          <Field label="后续可做" className="md:col-span-2">
            <Textarea {...form.register("followUpIdeas")} />
          </Field>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">图表记录</h3>
              <p className="text-xs text-slate-500">可添加图片 URL、图题和图表解释。</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => figures.append({ imageUrl: "", caption: "", explanation: "" })}
            >
              <Plus className="mr-1 h-4 w-4" />
              添加图表
            </Button>
          </div>
          <div className="space-y-4">
            {figures.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
                <Field label="图片 URL" error={form.formState.errors.figures?.[index]?.imageUrl?.message} className="md:col-span-2">
                  <Input {...form.register(`figures.${index}.imageUrl`)} placeholder="https://..." />
                </Field>
                <Field label="图题">
                  <Input {...form.register(`figures.${index}.caption`)} placeholder="例如 图 2：释药曲线" />
                </Field>
                <Field label="图解释">
                  <Textarea {...form.register(`figures.${index}.explanation`)} placeholder="用一句话解释这张图为什么重要" />
                </Field>
                <div className="md:col-span-2 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => figures.remove(index)}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    删除图表
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <SubmitButton type="submit" pending={pending}>
            保存
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
