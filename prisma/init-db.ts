import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (!rawUrl.startsWith("file:./") && !rawUrl.startsWith("file:../")) {
    return rawUrl;
  }

  const prismaDir = path.dirname(fileURLToPath(import.meta.url));
  const relativeFilePath = rawUrl.replace(/^file:/, "");
  const absolutePath = path.resolve(prismaDir, relativeFilePath);

  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

const client = createClient({
  url: resolveDatabaseUrl(),
});

const statements = [
  "PRAGMA foreign_keys = ON",
  `
    CREATE TABLE IF NOT EXISTS Folder (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      parentId TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT Folder_parentId_fkey FOREIGN KEY (parentId) REFERENCES Folder(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Paper (
      id TEXT PRIMARY KEY NOT NULL,
      folderId TEXT NOT NULL,
      title TEXT NOT NULL,
      authors TEXT NOT NULL,
      journal TEXT,
      journalAbbr TEXT,
      year INTEGER,
      impactFactor REAL,
      ifYear INTEGER,
      jcrQuartile TEXT,
      casQuartile TEXT,
      volume TEXT,
      issue TEXT,
      pages TEXT,
      citationCount INTEGER,
      doi TEXT,
      sourceUrl TEXT,
      pdfUrl TEXT,
      tags TEXT NOT NULL,
      mainConclusion TEXT,
      methods TEXT,
      status TEXT NOT NULL DEFAULT 'UNREAD',
      rating INTEGER,
      notes TEXT,
      abstract TEXT,
      background TEXT,
      researchQuestion TEXT,
      materials TEXT,
      keyResults TEXT,
      conclusion TEXT,
      innovations TEXT,
      limitations TEXT,
      usefulIdeas TEXT,
      personalNotes TEXT,
      followUpIdeas TEXT,
      relatedPaperIds TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT Paper_folderId_fkey FOREIGN KEY (folderId) REFERENCES Folder(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Figure (
      id TEXT PRIMARY KEY NOT NULL,
      paperId TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      caption TEXT,
      explanation TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT Figure_paperId_fkey FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `,
  "CREATE INDEX IF NOT EXISTS Folder_parentId_idx ON Folder(parentId)",
  "CREATE INDEX IF NOT EXISTS Paper_folderId_title_idx ON Paper(folderId, title)",
  "CREATE INDEX IF NOT EXISTS Paper_status_year_idx ON Paper(status, year)",
  "CREATE INDEX IF NOT EXISTS Paper_doi_idx ON Paper(doi)",
  "CREATE INDEX IF NOT EXISTS Figure_paperId_idx ON Figure(paperId)",
  "DROP TRIGGER IF EXISTS Folder_updatedAt_trigger",
  `
    CREATE TRIGGER Folder_updatedAt_trigger
    AFTER UPDATE ON Folder
    FOR EACH ROW
    BEGIN
      UPDATE Folder SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `,
  "DROP TRIGGER IF EXISTS Paper_updatedAt_trigger",
  `
    CREATE TRIGGER Paper_updatedAt_trigger
    AFTER UPDATE ON Paper
    FOR EACH ROW
    BEGIN
      UPDATE Paper SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `,
  "DROP TRIGGER IF EXISTS Figure_updatedAt_trigger",
  `
    CREATE TRIGGER Figure_updatedAt_trigger
    AFTER UPDATE ON Figure
    FOR EACH ROW
    BEGIN
      UPDATE Figure SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `,
];

async function main() {
  for (const statement of statements) {
    await client.execute(statement);
  }

  console.log("Database schema initialized.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
