import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:prisma/dev.db",
});

const migrations = [
  "ALTER TABLE Paper ADD COLUMN journalAbbr TEXT",
  "ALTER TABLE Paper ADD COLUMN ifYear INTEGER",
  "ALTER TABLE Paper ADD COLUMN jcrQuartile TEXT",
  "ALTER TABLE Paper ADD COLUMN casQuartile TEXT",
  "ALTER TABLE Paper ADD COLUMN volume TEXT",
  "ALTER TABLE Paper ADD COLUMN issue TEXT",
  "ALTER TABLE Paper ADD COLUMN pages TEXT",
  "ALTER TABLE Paper ADD COLUMN citationCount INTEGER",
  "CREATE INDEX IF NOT EXISTS Paper_doi_idx ON Paper(doi)",
];

async function main() {
  for (const sql of migrations) {
    try {
      await client.execute(sql);
      console.log("OK:", sql.substring(0, 40));
    } catch (e: any) {
      if (e.message && e.message.includes("duplicate column")) {
        console.log("SKIP:", sql.substring(0, 30));
      } else {
        console.log("ERR:", e.message ? e.message.substring(0, 80) : e);
      }
    }
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
