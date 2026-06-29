const DEEPSEEK_API_BASE = "https://api.deepseek.com/v1/chat/completions";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json_object" | "text";
}

export interface DeepSeekError {
  ok: false;
  error: string;
}

export interface DeepSeekSuccess<T> {
  ok: true;
  data: T;
}

export type DeepSeekResult<T> = DeepSeekSuccess<T> | DeepSeekError;

/**
 * 调用 DeepSeek Chat API 并返回解析后的 JSON 结果。
 * 默认使用 JSON mode (response_format: json_object)。
 */
export async function deepseekChat<T = Record<string, unknown>>(
  messages: DeepSeekMessage[],
  options: DeepSeekRequestOptions = {},
): Promise<DeepSeekResult<T>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return { ok: false, error: "请先配置 DEEPSEEK_API_KEY 环境变量。" };
  }

  const {
    model = "deepseek-chat",
    temperature = 0.7,
    maxTokens = 4096,
    responseFormat = "json_object",
  } = options;

  try {
    const response = await fetch(DEEPSEEK_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: responseFormat === "json_object" ? { type: "json_object" } : undefined,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "未知错误");
      return { ok: false, error: `DeepSeek API 错误 (${response.status}): ${errorBody}` };
    }

    const json = await response.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return { ok: false, error: "DeepSeek 返回了空的响应内容。" };
    }

    // JSON mode 下尝试解析返回内容
    try {
      const parsed = JSON.parse(content) as T;
      return { ok: true, data: parsed };
    } catch {
      // 如果 JSON 解析失败但 responseFormat 不是 json_object，将原始内容作为 data
      if (responseFormat !== "json_object") {
        return { ok: true, data: content as unknown as T };
      }
      return { ok: false, error: "DeepSeek 返回了非 JSON 格式内容，请重试。" };
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, error: "DeepSeek API 请求超时，请稍后重试。" };
    }
    return { ok: false, error: `请求 DeepSeek API 时出错: ${(error as Error).message}` };
  }
}
