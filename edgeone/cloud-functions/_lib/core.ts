/**
 * KETZXT EdgeOne 后端 —— 共享业务逻辑
 *
 * 与 Cloudflare Worker 版本（worker/src/index.ts）保持同一套业务语义，
 * 但改用 EdgeOne Pages Cloud Functions 的运行时约定：
 *   - 环境变量从 context.env 读（不再是 CF 的 env 绑定）
 *   - fetch / FormData / Blob / atob / crypto.subtle 均可用（已实测）
 *   - 同步存储用 EdgeOne Blob（强一致读），不是 CF KV
 *
 * 安全：API Key 只存在于服务端环境变量，前端永远拿不到。
 * 前端在 LLM 不可用时必须降级到本地规则引擎（writingGrader.ts），不能因网络问题做不了作业。
 */

/** 环境变量集合（EdgeOne Makers 注入） */
export interface Env {
  DEEPSEEK_API_KEY?: string;
  SILICONFLOW_API_KEY?: string;
  /** 允许的来源（逗号分隔）。留空则允许全部 */
  ALLOWED_ORIGINS?: string;
}

/** 从 EdgeOne 的 context.env 读取配置（兼容不同注入方式） */
export function readEnv(context: any): Env {
  const src = context?.env || {};
  return {
    DEEPSEEK_API_KEY: src.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY,
    SILICONFLOW_API_KEY: src.SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEY,
    ALLOWED_ORIGINS: src.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS,
  };
}

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

export function error(message: string, status = 400): Response {
  return json({ ok: false, error: message }, status);
}

/** 统一的 LLM 调用（DeepSeek OpenAI 兼容接口） */
export async function callLLM(
  apiKey: string,
  system: string,
  user: string,
  maxTokens = 800
): Promise<string> {
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek ${resp.status}: ${text.slice(0, 300)}`);
  }
  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data?.choices?.[0]?.message?.content ?? '';
}

/** 从 LLM 返回里稳妥地解析 JSON（模型偶尔会带 markdown 代码块） */
export function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as T;
    } catch {
      return null;
    }
  }
}

export function clampScore(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 8);
  if (typeof v === 'string' && v.trim()) return [v];
  return [];
}

// ========== 写作批改 ==========

export interface WritingRequest {
  text: string;
  prompt: string;
  requirement: string;
  kind: 'email' | 'story';
  minWords: number;
  pointsCovered?: { label: string; covered: boolean }[];
}

const WRITING_SYSTEM = `你是 KET（A2）英语写作的批改老师，对象是中国五年级学生。
你的任务：批改一篇 KET A2 级别的短文（邮件 Part1 或短故事 Part2）。

批改原则：
1. 只看学生实际写的内容，不要脑补。
2. 评分要贴合 KET A2 的真实要求，不要用高年级标准苛刻。
3. 语气鼓励但诚实，指出问题时给出具体可执行的改法。
4. 不要输出 Markdown 符号或代码块，只输出 JSON。

必须输出的 JSON 结构：
{
  "contentScore": 0-100,        // 内容切题度：是否答到题目问的三件事
  "languageScore": 0-100,      // 语言质量：语法、词汇、句式准确度与地道程度
  "overallScore": 0-100,       // 综合分（KET 官方写作分档参考：Good/Weak）
  "contentComments": ["针对每个要点是否写到、写得如何的具体点评"],
  "languageComments": ["具体的语法/用词问题，引用学生的原句"],
  "suggestions": ["2-4 条最值得改进的建议，要具体可操作"],
  "betterVersion": "一篇同样内容、但语言更好的示范改写（保持学生原意，不要加新内容）"
}`;

export async function handleWriting(req: WritingRequest, env: Env): Promise<Response> {
  if (!env.DEEPSEEK_API_KEY) {
    return error('服务端未配置 DEEPSEEK_API_KEY（写作批改暂不可用）', 503);
  }
  const text = (req.text || '').trim();
  if (!text) return error('作文内容为空');
  if (text.length > 5000) return error('作文过长（上限 5000 字符）');

  const coveredHint = req.pointsCovered?.length
    ? '\n\n前端规则层已检测的要点覆盖情况（供参考，可能有误，以你实际判读为准）：\n' +
      req.pointsCovered
        .map((p) => `- ${p.label}：${p.covered ? '已覆盖' : '未覆盖'}`)
        .join('\n')
    : '';

  const user = `批改下面这篇 KET ${req.kind === 'email' ? 'Part1 邮件' : 'Part2 短故事'}。

【题目】
${req.prompt}

【要求】
${req.requirement}
（至少 ${req.minWords} 词）

【学生作文】
"""
${text}
"""${coveredHint}

请输出 JSON 格式的批改结果。`;

  try {
    const raw = await callLLM(env.DEEPSEEK_API_KEY, WRITING_SYSTEM, user, 1200);
    const parsed = parseJsonLoose<{
      contentScore: number;
      languageScore: number;
      overallScore: number;
      contentComments: string[];
      languageComments: string[];
      suggestions: string[];
      betterVersion: string;
    }>(raw);

    if (!parsed) {
      return json({ ok: true, degraded: true, message: 'AI 批改结果解析失败，请稍后重试' });
    }

    return json({
      ok: true,
      contentScore: clampScore(parsed.contentScore),
      languageScore: clampScore(parsed.languageScore),
      overallScore: clampScore(parsed.overallScore),
      contentComments: toStringArray(parsed.contentComments),
      languageComments: toStringArray(parsed.languageComments),
      suggestions: toStringArray(parsed.suggestions),
      betterVersion: typeof parsed.betterVersion === 'string' ? parsed.betterVersion : '',
    });
  } catch (e) {
    return error(`写作批改失败：${(e as Error).message}`, 502);
  }
}

// ========== 口语评分 ==========

export interface SpeechRequest {
  audioBase64?: string;
  mimeType?: string;
  question: string;
  keywords: string[];
  modelAnswer?: string;
  browserTranscript?: string;
}

const SPEECH_SYSTEM = `你是 KET（A2）英语口语的评分老师，对象是中国五年级学生。
学生录了一段英文回答。你要按 KET A2 口语的真实标准打分并给出改进建议。

评分原则：
1. 内容：是否回答了问题、是否用到了关键信息。
2. 语法：句子结构是否有明显错误（错误要指出并给正确说法）。
3. 流畅度：句子是否完整、衔接是否自然。
4. 词汇：是否够用、是否有误用。
5. 评分不要过于苛刻：只要意思能被理解，就应给出鼓励性的分数。

必须输出的 JSON 结构：
{
  "score": 0-100,              // 综合分（60 分视为达标）
  "contentScore": 0-100,       // 内容
  "grammarScore": 0-100,       // 语法
  "fluencyScore": 0-100,       // 流利度
  "vocabularyScore": 0-100,    // 词汇
  "transcript": "你从录音中识别出的原文",
  "feedback": "一段话总体评价（中文，2-3 句）",
  "grammarIssues": ["具体语法错误：学生说的原句 -> 正确说法"],
  "suggestions": ["2-4 条口语改进建议（中文，具体可操作）"],
  "sampleAnswer": "一段更好的示范回答（英文）"
}`;

export async function transcribe(
  apiKey: string,
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const bin = atob(audioBase64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  // 文件名扩展名要和 mime 对应，SiliconFlow 按扩展名识别格式
  const ext = mimeType.includes('mp4') ? 'mp4'
    : mimeType.includes('ogg') ? 'ogg'
    : mimeType.includes('wav') ? 'wav'
    : mimeType.includes('mpeg') || mimeType.includes('mp3') ? 'mp3'
    : 'webm';

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mimeType || 'audio/webm' }), `speech.${ext}`);
  form.append('model', 'FunAudioLLM/SenseVoiceSmall');
  form.append('language', 'en');

  const resp = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`SiliconFlow ${resp.status}: ${t.slice(0, 300)}`);
  }
  const data = (await resp.json()) as { text?: string };
  return (data?.text ?? '').trim();
}

export async function handleSpeech(req: SpeechRequest, env: Env): Promise<Response> {
  if (!env.DEEPSEEK_API_KEY) {
    return error('服务端未配置 DEEPSEEK_API_KEY（口语评分暂不可用）', 503);
  }
  const browserText = (req.browserTranscript || '').trim();
  if (!req.audioBase64 && !browserText) return error('缺少音频数据与识别文本');

  let transcript = '';
  let asrSource: 'cloud-asr' | 'browser' = 'browser';
  let asrError = '';

  if (env.SILICONFLOW_API_KEY && req.audioBase64) {
    try {
      transcript = await transcribe(
        env.SILICONFLOW_API_KEY,
        req.audioBase64,
        req.mimeType || 'audio/webm'
      );
      if (transcript) asrSource = 'cloud-asr';
    } catch (e) {
      asrError = (e as Error).message;
    }
  } else if (!env.SILICONFLOW_API_KEY) {
    asrError = '服务端未配置 SILICONFLOW_API_KEY（无法云端转写）';
  }

  if (!transcript) {
    if (browserText) {
      transcript = browserText;
      asrSource = 'browser';
    } else {
      return json({
        ok: false,
        error: `语音转写失败：${asrError || '未知原因'}`,
        degraded: true,
        hint: '浏览器未识别到内容，请重试或手动输入回答',
      });
    }
  }

  const user = `请评分下面这段 KET 口语回答。

【题目】
${req.question}

【关键信息点（参考答案应包含）】
${req.keywords.join('、')}
${req.modelAnswer ? `\n\n【参考答案】\n${req.modelAnswer}` : ''}

【学生的录音识别结果】
"""
${transcript}
"""

请输出 JSON 格式的评分结果。`;

  try {
    const raw = await callLLM(env.DEEPSEEK_API_KEY, SPEECH_SYSTEM, user, 1000);
    const parsed = parseJsonLoose<{
      score: number;
      contentScore: number;
      grammarScore: number;
      fluencyScore: number;
      vocabularyScore: number;
      transcript: string;
      feedback: string;
      grammarIssues: string[];
      suggestions: string[];
      sampleAnswer: string;
    }>(raw);

    if (!parsed) {
      return json({ ok: true, degraded: true, message: 'AI 评分结果解析失败，请稍后重试' });
    }

    return json({
      ok: true,
      asrSource,
      transcript: typeof parsed.transcript === 'string' && parsed.transcript ? parsed.transcript : transcript,
      score: clampScore(parsed.score),
      contentScore: clampScore(parsed.contentScore),
      grammarScore: clampScore(parsed.grammarScore),
      fluencyScore: clampScore(parsed.fluencyScore),
      vocabularyScore: clampScore(parsed.vocabularyScore),
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
      grammarIssues: toStringArray(parsed.grammarIssues),
      suggestions: toStringArray(parsed.suggestions),
      sampleAnswer: typeof parsed.sampleAnswer === 'string' ? parsed.sampleAnswer : '',
    });
  } catch (e) {
    return error(`口语评分失败：${(e as Error).message}`, 502);
  }
}
