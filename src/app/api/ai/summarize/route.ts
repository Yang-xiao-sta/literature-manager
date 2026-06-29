import { NextRequest, NextResponse } from "next/server";
import { deepseekChat } from "@/lib/deepseek";

const SYSTEM_PROMPT = `你是一位专业的学术文献分析助手。请根据用户提供的文献摘要（以及可选的标题和期刊），生成结构化的详细中文总结。

请严格按照以下 JSON 格式返回，每个字段用中文填写：

{
  "background": "研究背景与领域现状",
  "researchQuestion": "研究问题与目标",
  "methods": "实验/研究方法与技术路线",
  "materials": "数据集或实验材料",
  "keyResults": "主要结果与核心发现",
  "conclusion": "主要结论",
  "innovations": "创新点与贡献",
  "limitations": "局限性",
  "usefulIdeas": "可借鉴之处",
  "followUpIdeas": "后续可做方向"
}

请确保：
1. 只返回合法的 JSON，不要添加额外说明文字
2. 每个字段内容应简洁准确，避免冗长
3. 若摘要信息不足以填写某个字段，可写"文中未明确提及"`;

interface SummarizeRequest {
  abstract: string;
  title?: string;
  journal?: string;
}

interface SummarizeResponse {
  background: string;
  researchQuestion: string;
  methods: string;
  materials: string;
  keyResults: string;
  conclusion: string;
  innovations: string;
  limitations: string;
  usefulIdeas: string;
  followUpIdeas: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SummarizeRequest = await request.json();

    if (!body.abstract || !body.abstract.trim()) {
      return NextResponse.json(
        { error: "请提供文献摘要（abstract）。" },
        { status: 400 },
      );
    }

    // 构建用户消息
    const userContent = [
      body.title ? `标题：${body.title}` : "",
      body.journal ? `期刊：${body.journal}` : "",
      `摘要：${body.abstract}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await deepseekChat<SummarizeResponse>([
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
