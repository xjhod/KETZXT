/**
 * LLM 增强批改的前端调用层。
 *
 * 设计原则：**LLM 是增强，不是依赖**。
 *  - 网络不通 / 服务没部署 / 没配 Key / 返回异常 → 一律降级到本地规则引擎
 *    （writingGrader.ts 的要点覆盖 + 语法提示），孩子照样能做完作业、看到反馈。
 *  - 前端永远拿不到 API Key（Key 在 Worker 的 Secret 里）。
 */

// 后端地址：默认读 VITE_LLM_API_BASE；没配就用同域 /llm（可在反代或本地开发时用）
const BASE =
  (import.meta.env.VITE_LLM_API_BASE as string | undefined)?.replace(/\/$/, '') || '/llm';

const TIMEOUT_MS = 45_000;

/** 写作增强批改结果 */
export interface LlmWritingResult {
  contentScore: number;
  languageScore: number;
  overallScore: number;
  contentComments: string[];
  languageComments: string[];
  suggestions: string[];
  betterVersion: string;
}

/** 口语评分结果 */
export interface LlmSpeechResult {
  /** cloud-asr = 云端转写；browser = 用浏览器识别结果 */
  asrSource?: 'cloud-asr' | 'browser';
  transcript: string;
  score: number;
  contentScore: number;
  grammarScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  feedback: string;
  grammarIssues: string[];
  suggestions: string[];
  sampleAnswer: string;
}

export interface LlmStatus {
  available: boolean;
  llm: boolean;
  asr: boolean;
}

/** 统一的请求封装：超时 + 错误归一化 + 永不抛异常（调用方只需看 ok） */
async function postJson<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; reason: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await resp.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, reason: `服务端返回非 JSON（HTTP ${resp.status}）` };
    }
    if (!resp.ok || json?.ok === false) {
      return { ok: false, reason: json?.error || json?.message || `HTTP ${resp.status}` };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    const err = e as Error;
    if (err.name === 'AbortError') return { ok: false, reason: '请求超时' };
    return { ok: false, reason: err.message || '网络错误' };
  } finally {
    clearTimeout(timer);
  }
}

/** 查后端是否可用（启动时调一次，决定要不要显示「AI 批改」入口） */
export async function fetchLlmStatus(): Promise<LlmStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const resp = await fetch(`${BASE}/api/health`, { signal: controller.signal });
    if (!resp.ok) return { available: false, llm: false, asr: false };
    const j = await resp.json();
    return { available: Boolean(j?.llm), llm: Boolean(j?.llm), asr: Boolean(j?.asr) };
  } catch {
    return { available: false, llm: false, asr: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 写作增强批改。失败时返回 null —— 调用方继续用规则层结果，功能不降级。
 */
export async function gradeWritingWithLLM(params: {
  text: string;
  prompt: string;
  requirement: string;
  kind: 'email' | 'story';
  minWords: number;
  pointsCovered?: { label: string; covered: boolean }[];
}): Promise<LlmWritingResult | null> {
  const res = await postJson<LlmWritingResult>('/api/grade-writing', params);
  if (!res.ok) {
    console.warn('[LLM] 写作批改降级到规则引擎：', res.reason);
    return null;
  }
  // 服务端可能返回 degraded（解析失败）→ 同样降级
  if ((res.data as any)?.degraded) {
    console.warn('[LLM] 写作批改返回 degraded，降级到规则引擎');
    return null;
  }
  return res.data;
}

/**
 * 口语评分。需要音频 base64。
 * 失败时返回 { ok: false, reason } —— 调用方可降级到浏览器自带识别的关键词评分。
 */
export async function gradeSpeechWithLLM(params: {
  audioBase64?: string;
  mimeType?: string;
  question: string;
  keywords: string[];
  modelAnswer?: string;
  /** 浏览器自带识别结果：服务端没配云端 ASR 时用它兜底 */
  browserTranscript?: string;
}): Promise<{ ok: true; data: LlmSpeechResult } | { ok: false; reason: string }> {
  return postJson<LlmSpeechResult>('/api/grade-speech', params);
}

/** Blob → base64（去掉 data URL 前缀） */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('读取音频失败'));
    reader.readAsDataURL(blob);
  });
}
