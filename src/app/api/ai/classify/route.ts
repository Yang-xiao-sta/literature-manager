import { NextRequest, NextResponse } from "next/server";
import { deepseekChat } from "@/lib/deepseek";

const SYSTEM_PROMPT = `你是一位学术文献分类助手。请根据每篇文献的标题和摘要，判断其所属的研究领域/主题，并与已有的文件夹匹配。

输入格式：
{
  "papers": [{ "id": "paperId", "title": "标题", "abstract": "摘要" }],
  "existingFolders": [{ "id": "folderId", "name": "文件夹名" }]
}

返回 JSON 格式：
{
  "classifications": [
    {
      "paperId": "文献ID",
      "suggestedFolderId": "匹配的文件夹ID（如果 existingFolders 中有合适的）",
      "suggestedNewFolder": "如果没有匹配的文件夹，建议的新文件夹名称"
    }
  ]
}

规则：
1. 优先使用 existingFolders 中已有的文件夹（用 id 引用）
2. 如果没有匹配的文件夹，则建议一个新文件夹名称（用 suggestedNewFolder 字段）
3. 只返回合法的 JSON，不要添加额外说明文字`;

interface ClassifyRequest {
  papers: Array<{ id: string; title: string; abstract: string }>;
  folders: Array<{ id: string; name: string }>;
}

interface ClassifyResponse {
  classifications: Array<{
    paperId: string;
    suggestedFolderId?: string;
    suggestedNewFolder?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClassifyRequest = await request.json();

    if (!body.papers || !Array.isArray(body.papers) || body.papers.length === 0) {
      return NextResponse.json(
        { error: "请提供至少一篇文献（papers）。" },
        { status: 400 },
      );
    }

    if (!body.folders || !Array.isArray(body.folders)) {
      return NextResponse.json(
        { error: "请提供文件夹列表（folders）。" },
        { status: 400 },
      );
    }

    const userContent = JSON.stringify({
      papers: body.papers,
      existingFolders: body.folders,
    });

    const result = await deepseekChat<ClassifyResponse>([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ]);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: `请求处理失败: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
