/**
 * AI 增强批改的前端调用层（走 WorkBuddy 云服务，免密钥）。
 *
 * 设计原则：**LLM 是增强，不是依赖**。
 *  - 网络不通 / 服务不可用 / 模型列表为空 / 返回异常 → 一律降级到本地规则引擎
 *    （writingGrader.ts 的要点覆盖 + 语法提示），孩子照样能做完作业、看到反馈。
 *  - 前端永远拿不到任何 API Key（云服务代持）。
 *
 * 与云服务 API 的两个硬约束（踩过才知道）：
 *  1. **只支持流式**（stream: true）。传 false 会在发请求前就被 SDK 拒绝
 *     （error.code = 'request_stream_required'）。一次性任务也要用流式，
 *     自己把 SSE 片段拼成完整文本再 JSON.parse。
 *  2. **必须带 system message**。messages[0] 必须是 role:'system'，
 *     SDK 不会替你补默认值，缺了会直接失败。
 */

import { cloud, pickModel } from './cloud';

// ========== 类型 ==========

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

/** 口语评分结果（基于文字内容评分，不含发音/语调/流利度） */
export interface LlmSpeechResult {
  transcript: string;
  score: number;
  contentScore: number;
  grammarScore: number;
  vocabularyScore: number;
  feedback: string;
  grammarIssues: string[];
  suggestions: string[];
  sampleAnswer: string;
}

export interface LlmStatus {
  available: boolean;
  llm: boolean;
  /** 云端语音转写是否可用。云服务无音频模型，恒为 false；口语评分只基于文本 */
  asr: boolean;
  /** 不可用时的原因（给用户看） */
  reason?: string;
}

/** 单次 LLM 调用的超时上限（毫秒）。云端模型慢时必须能自己放弃。 */
const TIMEOUT_MS = 60_000;

// ========== 底层调用 ==========

/**
 * 调用云端 LLM 并收集完整文本。
 *
 * @param system 系统提示（必须是稳定的行为/安全规则，不要放用户输入）
 * @param user 用户内容
 * @param maxTokens 最大输出长度
 */
async function callLlmText(
  system: string,
  user: string,
  maxTokens = 1200
): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const model = await pickModel();
    if (!model) {
      return { ok: false, reason: '云服务没有可用模型' };
    }

    let text = '';
    let reasoning = '';
    for await (const chunk of cloud.llm.chat.completions.create({
      model: model.id,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      stream: true,
      response_format: { type: 'json_object' },
      signal: controller.signal,
    })) {
      const delta = chunk.choices[0]?.delta as
        | { content?: string; reasoning_content?: string }
        | undefined;
      if (delta?.content) text += delta.content;
      // 推理型模型（onlyReasoning）把正文放在 reasoning_content，content 恒为空。
      // pickModel 已优先选普通文本模型，这里再留一层兜底，避免平台换模型后直接失效。
      else if (delta?.reasoning_content) reasoning += delta.reasoning_content;
    }

    if (!text.trim()) {
      if (reasoning.trim() && /\{[\s\S]*\}/.test(reasoning)) {
        // parseJsonLoose 会从思考文本里抽出 JSON 对象
        return { ok: true, text: reasoning };
      }
      return {
        ok: false,
        reason: reasoning.trim()
          ? '模型只返回了思考内容，未生成评分结果，请重试'
          : '模型返回内容为空',
      };
    }
    return { ok: true, text };
  } catch (e) {
    const err = e as Error & { error?: { code?: string } };
    if (err?.name === 'AbortError') {
      return { ok: false, reason: `请求超时（${TIMEOUT_MS / 1000}s）` };
    }
    // 结构性错误优先展示 code，便于区分配额/权限/模型问题
    const code = err?.error?.code;
    return { ok: false, reason: code ? `${code}: ${err.message}` : err.message || '未知错误' };
  } finally {
    clearTimeout(timer);
  }
}

/** 从模型返回里稳妥地解析 JSON（模型偶尔会带 markdown 代码块） */
function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
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

function clampScore(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 8);
  if (typeof v === 'string' && v.trim()) return [v];
  return [];
}

// ========== 对外接口 ==========

/**
 * 查后端是否可用（启动时调一次，决定要不要显示「AI 批改」入口）。
 * 失败不抛异常 —— 返回 available=false + 原因。
 */
export async function fetchLlmStatus(): Promise<LlmStatus> {
  try {
    const model = await pickModel();
    if (!model) {
      return { available: false, llm: false, asr: false, reason: '云服务无可用模型' };
    }
    // asr 固定为 false：云服务 33 个模型里没有音频模型，不具备云端语音转写能力。
    // 口语评分只能基于浏览器识别结果或用户手动输入的文字（见 gradeSpeechWithLLM）。
    return { available: true, llm: true, asr: false };
  } catch (e) {
    return { available: false, llm: false, asr: false, reason: (e as Error).message };
  }
}

/** 写作批改用的系统提示（保持与原 EdgeOne 后端一致的行为） */
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
  const text = (params.text || '').trim();
  if (!text) return null;

  const coveredHint = params.pointsCovered?.length
    ? '\n\n前端规则层已检测的要点覆盖情况（供参考，可能有误，以你实际判读为准）：\n' +
      params.pointsCovered.map((p) => `- ${p.label}：${p.covered ? '已覆盖' : '未覆盖'}`).join('\n')
    : '';

  const user = `批改下面这篇 KET ${params.kind === 'email' ? 'Part1 邮件' : 'Part2 短故事'}。

【题目】
${params.prompt}

【要求】
${params.requirement}
（至少 ${params.minWords} 词）

【学生作文】
"""
${text}
"""${coveredHint}

请输出 JSON 格式的批改结果。`;

  const res = await callLlmText(WRITING_SYSTEM, user, 1200);
  if (!res.ok) {
    console.warn('[LLM] 写作批改降级到规则引擎：', res.reason);
    return null;
  }

  const parsed = parseJsonLoose<{
    contentScore: number;
    languageScore: number;
    overallScore: number;
    contentComments: string[];
    languageComments: string[];
    suggestions: string[];
    betterVersion: string;
  }>(res.text);

  if (!parsed) {
    console.warn('[LLM] 写作批改结果解析失败，降级到规则引擎');
    return null;
  }

  return {
    contentScore: clampScore(parsed.contentScore),
    languageScore: clampScore(parsed.languageScore),
    overallScore: clampScore(parsed.overallScore),
    contentComments: toStringArray(parsed.contentComments),
    languageComments: toStringArray(parsed.languageComments),
    suggestions: toStringArray(parsed.suggestions),
    betterVersion: typeof parsed.betterVersion === 'string' ? parsed.betterVersion : '',
  };
}

/** 口语评分用的系统提示 */
const SPEECH_SYSTEM = `你是 KET（A2）英语口语的评分老师，对象是中国五年级学生。
学生说了一段英文回答。你要按 KET A2 口语的真实标准打分并给出改进建议。

评分原则：
1. 内容：是否回答了问题、是否用到了关键信息。
2. 语法：句子结构是否有明显错误（错误要指出并给正确说法）。
3. 词汇：是否够用、是否有误用。
4. 评分不要过于苛刻：只要意思能被理解，就应给出鼓励性的分数。

⚠️ 重要前提：你只看到学生**输入或转写的文字**，听不到真实发音、语调与流利度。
因此不要凭空给出"流利度""发音"类分数，也不要在建议里假定学生说得快慢或结巴。
只基于文字内容评价内容、语法、词汇即可。

必须输出的 JSON 结构：
{
  "score": 0-100,              // 综合分（60 分视为达标）
  "contentScore": 0-100,       // 内容
  "grammarScore": 0-100,       // 语法
  "vocabularyScore": 0-100,    // 词汇
  "transcript": "你收到的学生回答原文",
  "feedback": "一段话总体评价（中文，2-3 句）",
  "grammarIssues": ["具体语法错误：学生原句 -> 正确说法"],
  "suggestions": ["2-4 条口语改进建议（中文，具体可操作，聚焦内容/语法/词汇）"],
  "sampleAnswer": "一段更好的示范回答（英文）"
}`;

/**
 * 口语评分。
 *
 * ⚠️ 云服务的 33 个模型里**没有音频模型**，所以转写（ASR）仍需外部 ASR 服务。
 * 当前策略：
 *   - 有 browserTranscript（浏览器识别结果或用户手动输入）→ 直接送 LLM 评分
 *   - 只有音频、没有文本 → 无法评分，返回明确原因让前端提示用户手动输入
 *
 * 之所以不保留 EdgeOne 后端做 ASR 转发：那个域名对大陆网络只有 3 小时有效的预览链接，
 * 不能作为长期依赖。
 */
export async function gradeSpeechWithLLM(params: {
  browserTranscript?: string;
  question: string;
  keywords: string[];
  modelAnswer?: string;
}): Promise<{ ok: true; data: LlmSpeechResult } | { ok: false; reason: string }> {
  const browserText = (params.browserTranscript || '').trim();
  if (!browserText) {
    return {
      ok: false,
      reason: '还没有可评分的文字。请在输入框打出你的英文回答（或让浏览器识别出文字）后再评分',
    };
  }

  const user = `请评分下面这段 KET 口语回答。

【题目】
${params.question}

【关键信息点（参考答案应包含）】
${params.keywords.join('、')}
${params.modelAnswer ? `\n\n【参考答案】\n${params.modelAnswer}` : ''}

【学生的回答】
"""
${browserText}
"""

请输出 JSON 格式的评分结果。`;

  const res = await callLlmText(SPEECH_SYSTEM, user, 1000);
  if (!res.ok) {
    return { ok: false, reason: res.reason };
  }

  const parsed = parseJsonLoose<{
    score: number;
    contentScore: number;
    grammarScore: number;
    vocabularyScore: number;
    transcript: string;
    feedback: string;
    grammarIssues: string[];
    suggestions: string[];
    sampleAnswer: string;
  }>(res.text);

  if (!parsed) {
    return { ok: false, reason: 'AI 评分结果解析失败，请稍后重试' };
  }

  return {
    ok: true,
    data: {
      transcript:
        typeof parsed.transcript === 'string' && parsed.transcript ? parsed.transcript : browserText,
      score: clampScore(parsed.score),
      contentScore: clampScore(parsed.contentScore),
      grammarScore: clampScore(parsed.grammarScore),
      vocabularyScore: clampScore(parsed.vocabularyScore),
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
      grammarIssues: toStringArray(parsed.grammarIssues),
      suggestions: toStringArray(parsed.suggestions),
      sampleAnswer: typeof parsed.sampleAnswer === 'string' ? parsed.sampleAnswer : '',
    },
  };
}
