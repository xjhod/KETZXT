/**
 * 从云端模型目录里挑一个「能直接返回文本」的模型。
 *
 * 为什么不能直接取列表第一个（2026-11-08 实测踩坑）：
 *   目录里第一个可用模型是 `hy4free`，标记 `onlyReasoning: true`。
 *   这类推理型模型在流式响应里把内容全部放进 `delta.reasoning_content`，
 *   `delta.content` 恒为空串（47 个帧、finish_reason=length，content 长度为 0）。
 *   而 llm.ts 的 callLlmText 只累加 delta.content -> 拿到空文本 ->
 *   口语 / 写作 AI 批改一律失败，界面表现为「评分不能用」。
 *
 * 因此：优先选非推理的纯文本模型；没有就退回推理型（llm.ts 另有兜底解析）。
 * 目录会随平台更新，所以不凭空造 id：所有候选都必须来自 models.list() 的真实结果。
 */

export interface CloudModel {
  id: string;
  name?: string;
  disabled?: boolean;
  /** true = 只输出思考链，delta.content 可能始终为空 */
  onlyReasoning?: boolean;
  supportsImages?: boolean;
}

export interface PickedModel {
  id: string;
  name: string;
}

/** 路由别名，不是具体模型 */
const ALIAS_IDS = new Set(['auto', 'default']);
/** 图像 / 视频 / 音频类模型，不能用来做文本评分 */
const NON_TEXT_ID = /image|video|audio|tts|embed|edit|draw/i;

/**
 * 实测偏好：非推理、能稳定输出 json_object、响应快。
 * 按顺序找第一个在目录里真实存在的；平台下线模型时自动跳到下一个。
 */
const PREFERRED_TEXT_MODELS = [
  'hunyuan-chat',
  'glm-4.6',
  'glm-4.7',
  'glm-5.0',
];

function isTextModel(m: CloudModel | null | undefined): boolean {
  if (!m || typeof m.id !== 'string' || !m.id.trim()) return false;
  if (m.disabled === true) return false;
  if (ALIAS_IDS.has(m.id)) return false;
  return !NON_TEXT_ID.test(m.id);
}

/**
 * @param models cloud.llm.models.list() 的原始结果（允许非数组 / 脏数据）
 * @returns 选中的模型；目录为空或全是别名时返回 null（调用方必须显式处理）
 */
export function pickTextModel(models: unknown): PickedModel | null {
  const list: CloudModel[] = (Array.isArray(models) ? models : [])
    .filter((m): m is CloudModel => isTextModel(m as CloudModel));
  if (list.length === 0) return null;

  const plain = list.filter((m) => m.onlyReasoning !== true);
  const pool = plain.length > 0 ? plain : list;

  let chosen: CloudModel | undefined;
  for (const id of PREFERRED_TEXT_MODELS) {
    chosen = pool.find((m) => m.id === id);
    if (chosen) break;
  }
  if (!chosen) chosen = pool[0];

  return { id: chosen.id, name: chosen.name ?? chosen.id };
}
