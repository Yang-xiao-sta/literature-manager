import { FolderTree } from "@/components/workspace/folder-tree";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { PaperTable } from "@/components/paper/paper-table";
import { getFolderById, getFolderOptions, getFolderPath, getFolderTree, getPreferredFolderId } from "@/lib/folders";
import { getFolderPapers } from "@/lib/papers";
import { paperFilterSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const rawSearchParams = await searchParams;
  const normalized = {
    folderId: typeof rawSearchParams.folderId === "string" ? rawSearchParams.folderId : undefined,
    q: typeof rawSearchParams.q === "string" ? rawSearchParams.q : undefined,
    status: typeof rawSearchParams.status === "string" ? rawSearchParams.status : undefined,
    tag: typeof rawSearchParams.tag === "string" ? rawSearchParams.tag : undefined,
    sort: typeof rawSearchParams.sort === "string" ? rawSearchParams.sort : undefined,
  };

  const [folderTree, folderOptions, preferredFolderId, totalFolders, totalPapers] = await Promise.all([
    getFolderTree(),
    getFolderOptions(),
    getPreferredFolderId(),
    prisma.folder.count(),
    prisma.paper.count(),
  ]);

  const activeFolderId = normalized.folderId ?? preferredFolderId ?? undefined;
  const filters = paperFilterSchema.parse({
    q: normalized.q,
    status: normalized.status,
    tag: normalized.tag,
    sort: normalized.sort,
  });

  const [activeFolder, folderPath, papers] = activeFolderId
    ? await Promise.all([
        getFolderById(activeFolderId),
        getFolderPath(activeFolderId),
        getFolderPapers(activeFolderId, filters),
      ])
    : [null, [], []];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(208,220,255,0.45),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(182,219,194,0.35),_transparent_22%),linear-gradient(180deg,_#f6f8fb_0%,_#eef3f8_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <WorkspaceHeader
          folderName={activeFolder?.name}
          folderPath={folderPath}
          totalFolders={totalFolders}
          totalPapers={totalPapers}
        />
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="min-h-[680px]">
            <FolderTree folders={folderTree} activeFolderId={activeFolderId} />
          </aside>
          <section className="min-w-0">
            <PaperTable papers={papers} folderId={activeFolderId} folderName={activeFolder?.name} folderOptions={folderOptions} />
          </section>
        </div>
      </div>
    </main>
  );
}
