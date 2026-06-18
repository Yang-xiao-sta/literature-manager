import { notFound } from "next/navigation";
import { PaperDetailClient } from "@/components/paper/paper-detail-client";
import { getFolderOptions, resolveRelatedTitles } from "@/lib/folders";
import { toPaperFormValues } from "@/lib/paper-mappers";
import { getAllPapersForRelations, getPaperById } from "@/lib/papers";

type PaperDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaperDetailPage({ params }: PaperDetailPageProps) {
  const { id } = await params;
  const [paper, folderOptions, allPapers] = await Promise.all([getPaperById(id), getFolderOptions(), getAllPapersForRelations()]);

  if (!paper) {
    notFound();
  }

  const relatedTitles = resolveRelatedTitles(allPapers, paper.relatedPaperIds);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(208,220,255,0.45),_transparent_26%),linear-gradient(180deg,_#f6f8fb_0%,_#eef3f8_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <PaperDetailClient paper={paper} folderOptions={folderOptions} relatedTitles={relatedTitles} initialValues={toPaperFormValues(paper)} />
      </div>
    </main>
  );
}
