import { NextRequest, NextResponse } from "next/server";

// Crossref API base URL
const CROSSREF_BASE = "https://api.crossref.org/works";
const OPENALEX_BASE = "https://api.openalex.org/works";

interface LookupResult {
  title: string;
  authors: string;
  journal: string;
  journalAbbr: string;
  year: number | null;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  citationCount: number | null;
  abstract: string;
  sourceUrl: string;
  impactFactor: number | null;
  ifYear: number | null;
  jcrQuartile: string;
  casQuartile: string;
  error?: string;
}

// Impact factor cache (limited built-in data for common journals)
const IF_CACHE: Record<string, { if: number; year: number; jcr: string; cas: string }> = {
  "nature": { if: 50.5, year: 2023, jcr: "Q1", cas: "1区" },
  "science": { if: 44.7, year: 2023, jcr: "Q1", cas: "1区" },
  "cell": { if: 45.5, year: 2023, jcr: "Q1", cas: "1区" },
  "nature methods": { if: 36.1, year: 2023, jcr: "Q1", cas: "1区" },
  "nature biotechnology": { if: 33.1, year: 2023, jcr: "Q1", cas: "1区" },
  "nature genetics": { if: 31.7, year: 2023, jcr: "Q1", cas: "1区" },
  "nature medicine": { if: 58.7, year: 2023, jcr: "Q1", cas: "1区" },
  "nature communications": { if: 14.7, year: 2023, jcr: "Q1", cas: "1区" },
  "nature materials": { if: 37.2, year: 2023, jcr: "Q1", cas: "1区" },
  "nature nanotechnology": { if: 38.1, year: 2023, jcr: "Q1", cas: "1区" },
  "nature chemistry": { if: 19.2, year: 2023, jcr: "Q1", cas: "1区" },
  "nature physics": { if: 17.6, year: 2023, jcr: "Q1", cas: "1区" },
  "nature neuroscience": { if: 21.2, year: 2023, jcr: "Q1", cas: "1区" },
  "nature immunology": { if: 27.7, year: 2023, jcr: "Q1", cas: "1区" },
  "nature cell biology": { if: 17.3, year: 2023, jcr: "Q1", cas: "1区" },
  "pnas": { if: 9.4, year: 2023, jcr: "Q1", cas: "1区" },
  "science advances": { if: 11.7, year: 2023, jcr: "Q1", cas: "1区" },
  "elife": { if: 6.4, year: 2023, jcr: "Q1", cas: "1区" },
  "nucleic acids research": { if: 16.6, year: 2023, jcr: "Q1", cas: "1区" },
  "genome biology": { if: 10.1, year: 2023, jcr: "Q1", cas: "1区" },
  "genome research": { if: 6.2, year: 2023, jcr: "Q1", cas: "1区" },
  "plos one": { if: 2.9, year: 2023, jcr: "Q2", cas: "3区" },
  "scientific reports": { if: 3.8, year: 2023, jcr: "Q2", cas: "3区" },
  "bmc genomics": { if: 3.5, year: 2023, jcr: "Q2", cas: "3区" },
  "bioinformatics": { if: 4.4, year: 2023, jcr: "Q1", cas: "2区" },
  "briefings in bioinformatics": { if: 6.8, year: 2023, jcr: "Q1", cas: "1区" },
  "acs nano": { if: 15.8, year: 2023, jcr: "Q1", cas: "1区" },
  "nano letters": { if: 9.6, year: 2023, jcr: "Q1", cas: "1区" },
  "advanced materials": { if: 27.4, year: 2023, jcr: "Q1", cas: "1区" },
  "advanced functional materials": { if: 18.5, year: 2023, jcr: "Q1", cas: "1区" },
  "acs applied materials": { if: 8.3, year: 2023, jcr: "Q1", cas: "2区" },
  "biomaterials": { if: 12.8, year: 2023, jcr: "Q1", cas: "1区" },
  "journal of the american chemical society": { if: 14.4, year: 2023, jcr: "Q1", cas: "1区" },
  "angewandte chemie": { if: 16.1, year: 2023, jcr: "Q1", cas: "1区" },
  "chemical reviews": { if: 51.4, year: 2023, jcr: "Q1", cas: "1区" },
  "chemical society reviews": { if: 40.4, year: 2023, jcr: "Q1", cas: "1区" },
  "cancer research": { if: 12.5, year: 2023, jcr: "Q1", cas: "1区" },
  "cancer cell": { if: 48.8, year: 2023, jcr: "Q1", cas: "1区" },
  "cancer discovery": { if: 29.7, year: 2023, jcr: "Q1", cas: "1区" },
  "immunity": { if: 25.5, year: 2023, jcr: "Q1", cas: "1区" },
  "science translational medicine": { if: 15.8, year: 2023, jcr: "Q1", cas: "1区" },
  "blood": { if: 21.0, year: 2023, jcr: "Q1", cas: "1区" },
  "circulation": { if: 35.5, year: 2023, jcr: "Q1", cas: "1区" },
  "circulation research": { if: 16.5, year: 2023, jcr: "Q1", cas: "1区" },
  "european heart journal": { if: 37.6, year: 2023, jcr: "Q1", cas: "1区" },
  "lancet": { if: 98.4, year: 2023, jcr: "Q1", cas: "1区" },
  "lancet oncology": { if: 41.6, year: 2023, jcr: "Q1", cas: "1区" },
  "jama": { if: 63.1, year: 2023, jcr: "Q1", cas: "1区" },
  "bmj": { if: 93.6, year: 2023, jcr: "Q1", cas: "1区" },
  "new england journal of medicine": { if: 96.2, year: 2023, jcr: "Q1", cas: "1区" },
};

function lookupImpactFactor(journalName: string): { if: number; year: number; jcr: string; cas: string } | null {
  if (!journalName) return null;
  const key = journalName.toLowerCase().trim();
  // Exact match
  if (IF_CACHE[key]) return IF_CACHE[key];
  // Partial match
  for (const [name, data] of Object.entries(IF_CACHE)) {
    if (key.includes(name) || name.includes(key)) {
      return data;
    }
  }
  return null;
}

function formatAuthors(authors: Array<{ given?: string; family?: string; name?: string }>): string {
  return authors
    .filter(a => a.family || a.name)
    .map(a => {
      if (a.family && a.given) {
        const initials = a.given.split(" ").map((n: string) => n[0]?.toUpperCase() || "").join("");
        return a.family + " " + initials;
      }
      return a.name || a.family || "";
    })
    .slice(0, 10)
    .join("; ");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const doi = searchParams.get("doi");
  const title = searchParams.get("title");
  const url = searchParams.get("url");

  try {
    let result: LookupResult | null = null;

    // Try DOI lookup first
    if (doi) {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, "").trim();
      const crossrefUrl = CROSSREF_BASE + "/" + encodeURIComponent(cleanDoi);
      
      const res = await fetch(crossrefUrl, {
        headers: { "User-Agent": "LiteratureManager/1.0 (mailto:research@example.com)" },
        signal: AbortSignal.timeout(10000),
      });
      
      if (res.ok) {
        const data = await res.json();
        const msg = data.message;
        if (msg) {
          const journalName = (msg["container-title"]?.[0] || msg["short-container-title"]?.[0] || "") as string;
          const ifInfo = lookupImpactFactor(journalName);
          
          result = {
            title: (msg.title?.[0] || "") as string,
            authors: formatAuthors(msg.author || []),
            journal: journalName,
            journalAbbr: (msg["short-container-title"]?.[0] || "") as string,
            year: (msg["published-print"]?.["date-parts"]?.[0]?.[0] || 
                   msg["created"]?.["date-parts"]?.[0]?.[0] || null) as number | null,
            volume: (msg.volume || "") as string,
            issue: (msg.issue || "") as string,
            pages: (msg.page || "") as string,
            doi: msg.DOI as string,
            citationCount: (msg["is-referenced-by-count"] || null) as number | null,
            abstract: (msg.abstract || "") as string,
            sourceUrl: msg.URL ? ("https://doi.org/" + msg.DOI) : "",
            impactFactor: ifInfo?.if ?? null,
            ifYear: ifInfo?.year ?? null,
            jcrQuartile: ifInfo?.jcr ?? "",
            casQuartile: ifInfo?.cas ?? "",
          };
        }
      }
    }

    // Try title lookup if DOI failed or not provided
    if (!result && title) {
      const crossrefUrl = CROSSREF_BASE + "?query.title=" + encodeURIComponent(title) + "&rows=1";
      
      const res = await fetch(crossrefUrl, {
        headers: { "User-Agent": "LiteratureManager/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      
      if (res.ok) {
        const data = await res.json();
        const items = data.message?.items;
        if (items?.length > 0) {
          const msg = items[0];
          const journalName = (msg["container-title"]?.[0] || "") as string;
          const ifInfo = lookupImpactFactor(journalName);
          
          result = {
            title: (msg.title?.[0] || "") as string,
            authors: formatAuthors(msg.author || []),
            journal: journalName,
            journalAbbr: (msg["short-container-title"]?.[0] || "") as string,
            year: (msg["published-print"]?.["date-parts"]?.[0]?.[0] || 
                   msg["created"]?.["date-parts"]?.[0]?.[0] || null) as number | null,
            volume: (msg.volume || "") as string,
            issue: (msg.issue || "") as string,
            pages: (msg.page || "") as string,
            doi: msg.DOI as string,
            citationCount: (msg["is-referenced-by-count"] || null) as number | null,
            abstract: (msg.abstract || "") as string,
            sourceUrl: msg.URL ? ("https://doi.org/" + msg.DOI) : "",
            impactFactor: ifInfo?.if ?? null,
            ifYear: ifInfo?.year ?? null,
            jcrQuartile: ifInfo?.jcr ?? "",
            casQuartile: ifInfo?.cas ?? "",
          };
        }
      }
    }

    if (!result) {
      return NextResponse.json({
        error: "未找到匹配的文献信息。请尝试输入完整 DOI 或手动填写。",
      }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Literature lookup error:", error);
    return NextResponse.json({
      error: "查询失败：" + (error.message || "网络错误，请稍后重试"),
    }, { status: 500 });
  }
}
