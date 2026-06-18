import type { Figure, Paper, PaperStatus } from "@prisma/client";
import { safeJsonArrayParse, splitTags } from "@/lib/utils";
import type { PaperFormValues } from "@/lib/schemas";

export type PaperWithFigures = Paper & {
  figures: Figure[];
};

export function toPaperViewModel(paper: PaperWithFigures) {
  return {
    ...paper,
    tags: safeJsonArrayParse(paper.tags),
    relatedPaperIds: safeJsonArrayParse(paper.relatedPaperIds),
  };
}

export function toPaperCreateInput(values: PaperFormValues) {
  return {
    folderId: values.folderId,
    title: values.title,
    authors: values.authors,
    journal: values.journal || null,
    journalAbbr: values.journalAbbr || null,
    ifYear: values.ifYear ?? null,
    jcrQuartile: values.jcrQuartile || null,
    casQuartile: values.casQuartile || null,
    volume: values.volume || null,
    issue: values.issue || null,
    pages: values.pages || null,
    citationCount: values.citationCount ?? null,
    year: values.year ?? null,
    impactFactor: values.impactFactor ?? null,
    doi: values.doi || null,
    sourceUrl: values.sourceUrl || null,
    pdfUrl: values.pdfUrl || null,
    tags: JSON.stringify(splitTags(values.tags)),
    mainConclusion: values.mainConclusion || null,
    methods: values.methods || null,
    status: values.status as PaperStatus,
    rating: values.rating ?? null,
    notes: values.notes || null,
    abstract: values.abstract || null,
    background: values.background || null,
    researchQuestion: values.researchQuestion || null,
    materials: values.materials || null,
    keyResults: values.keyResults || null,
    conclusion: values.conclusion || null,
    innovations: values.innovations || null,
    limitations: values.limitations || null,
    usefulIdeas: values.usefulIdeas || null,
    personalNotes: values.personalNotes || null,
    followUpIdeas: values.followUpIdeas || null,
    relatedPaperIds: JSON.stringify(values.relatedPaperIds),
  };
}

export function toPaperFormValues(paper: ReturnType<typeof toPaperViewModel>): PaperFormValues {
  return {
    id: paper.id,
    folderId: paper.folderId,
    title: paper.title,
    authors: paper.authors,
    journal: paper.journal ?? "",
    journalAbbr: paper.journalAbbr ?? "",
    ifYear: paper.ifYear ?? undefined,
    jcrQuartile: paper.jcrQuartile ?? "",
    casQuartile: paper.casQuartile ?? "",
    volume: paper.volume ?? "",
    issue: paper.issue ?? "",
    pages: paper.pages ?? "",
    citationCount: paper.citationCount ?? undefined,
    year: paper.year ?? undefined,
    impactFactor: paper.impactFactor ?? undefined,
    doi: paper.doi ?? "",
    sourceUrl: paper.sourceUrl ?? "",
    pdfUrl: paper.pdfUrl ?? "",
    tags: paper.tags.join(", "),
    mainConclusion: paper.mainConclusion ?? "",
    methods: paper.methods ?? "",
    status: paper.status,
    rating: paper.rating ?? undefined,
    notes: paper.notes ?? "",
    abstract: paper.abstract ?? "",
    background: paper.background ?? "",
    researchQuestion: paper.researchQuestion ?? "",
    materials: paper.materials ?? "",
    keyResults: paper.keyResults ?? "",
    conclusion: paper.conclusion ?? "",
    innovations: paper.innovations ?? "",
    limitations: paper.limitations ?? "",
    usefulIdeas: paper.usefulIdeas ?? "",
    personalNotes: paper.personalNotes ?? "",
    followUpIdeas: paper.followUpIdeas ?? "",
    relatedPaperIds: paper.relatedPaperIds,
    figures: paper.figures.map((figure) => ({
      id: figure.id,
      imageUrl: figure.imageUrl,
      caption: figure.caption ?? "",
      explanation: figure.explanation ?? "",
    })),
  };
}
