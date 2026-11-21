// ========== 手写产出草稿（防止下拉刷新 / 切后台 / 误触导致输入丢失）==========
//
// 只护住「输入中、尚未提交」的内容：text / attempts / accepted。
// 提交成功时调用方（WrittenProduction）立即 clear —— 因为提交即同步写入
// 持久 store（进度 / 造句存档），刷新后进度本就在，草稿不该残留导致重复计数。
//
// 按 账号(uid) + 题目 key 分片存 localStorage：
//   - 切账号天然隔离（key 里带 uid），换设备不带走半道题，故不进云同步
//   - 7 天过期 + 容量上限，避免 localStorage 无限膨胀
//   - 读写全程静默容错，存储满 / 隐私模式下不影响答题
import { getCurrentUser } from './auth';

const DRAFT_KEY = 'ket-written-draft-v1';
const MAX_DRAFTS = 60;
const TTL_MS = 7 * 24 * 3600 * 1000;

export interface WrittenDraft {
  text: string;
  attempts: number;
  accepted: string;
  savedAt: number;
}

function storageKey(): string {
  const uid = getCurrentUser()?.id ?? 'anon';
  return `${DRAFT_KEY}:${uid}`;
}

function readAll(): Record<string, WrittenDraft> {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as Record<string, WrittenDraft>) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, WrittenDraft>): void {
  try {
    const entries = Object.entries(map)
      .sort((a, b) => b[1].savedAt - a[1].savedAt)
      .slice(0, MAX_DRAFTS);
    localStorage.setItem(storageKey(), JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* 存储满 / 隐私模式：静默失败 */
  }
}

/** 保存草稿（合并，不覆盖未涉及的字段） */
export function saveWrittenDraft(key: string, patch: Partial<Pick<WrittenDraft, 'text' | 'attempts' | 'accepted'>>): void {
  if (!key) return;
  const all = readAll();
  const prev = all[key];
  all[key] = {
    text: patch.text ?? prev?.text ?? '',
    attempts: patch.attempts ?? prev?.attempts ?? 0,
    accepted: patch.accepted ?? prev?.accepted ?? '',
    savedAt: Date.now(),
  };
  writeAll(all);
}

/** 读取草稿（无 / 过期返回 null） */
export function loadWrittenDraft(key: string): WrittenDraft | null {
  if (!key) return null;
  const d = readAll()[key] ?? null;
  if (d && Date.now() - d.savedAt > TTL_MS) {
    clearWrittenDraft(key);
    return null;
  }
  return d;
}

/** 提交成功后清除草稿 */
export function clearWrittenDraft(key: string): void {
  if (!key) return;
  const all = readAll();
  if (!(key in all)) return;
  delete all[key];
  writeAll(all);
}
