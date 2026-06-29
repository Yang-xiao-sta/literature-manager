import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveDatabaseUrl() {
  // 优先使用 TURSO_DATABASE_URL（远程 Turso 数据库）
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return tursoUrl;
  }

  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (!rawUrl.startsWith("file:./") && !rawUrl.startsWith("file:../")) {
    return rawUrl;
  }

  // 本地 SQLite 文件：将相对路径转为绝对路径
  const prismaDir = path.dirname(fileURLToPath(import.meta.url));
  const relativeFilePath = rawUrl.replace(/^file:/, "");
  const absolutePath = path.resolve(prismaDir, relativeFilePath);

  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

const client = createClient({
  url: resolveDatabaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  "PRAGMA foreign_keys = ON",
  `
    CREATE TABLE IF NOT EXISTS Folder (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      parentId TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
      FOREIGN KEY (folderId) REFERENCES Folder(id) ON DELETE CASCADE
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
      FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE
    )
  `,
  "CREATE INDEX IF NOT EXISTS Folder_parentId_idx ON Folder(parentId)",
  "CREATE INDEX IF NOT EXISTS Paper_folderId_title_idx ON Paper(folderId, title)",
  "CREATE INDEX IF NOT EXISTS Paper_status_year_idx ON Paper(status, year)",
  "CREATE INDEX IF NOT EXISTS Paper_doi_idx ON Paper(doi)",
  "CREATE INDEX IF NOT EXISTS Figure_paperId_idx ON Figure(paperId)",
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
