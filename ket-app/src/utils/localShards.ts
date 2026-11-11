/**
 * 本机学习数据分片诊断（只读，绝不写回）
 *
 * 四个 store 的 localStorage 键是 `${base}:${uid}`。换账号登录后
 * rehydrateAllStores() 会切到新 uid 分片，老分片仍在磁盘上但界面看不到。
 * 这个模块只统计「本机有哪些分片、各有多少条记录」，用于判断老进度在不在本机、
 * 两个设备是不是同一个 uid。不做自动合并 —— 多个孩子的数据混在一起更难拆。
 */

export interface ShardInfo {
  uid: string;
  isCurrent: boolean;
  bytes: number;
  answerRecords: number;
  sessionRecords: number;
  vocabWords: number;
  grammarPoints: number;
  planLogs: number;
  sentences: number;
  storeKeys: string[];
}

/** 只依赖这三个方法，便于在 Node 里用 mock 真实执行纯函数 */
export interface StorageLike {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
}

const BASE_KEYS = [
  'ket-progress-v1',
  'ket-plan-v1',
  'ket-daily-checkin-v1',
  'ket-vocab-v1',
];

function countArray(v: unknown): number {
  return Array.isArray(v) ? v.length : 0;
}

function countObject(v: unknown): number {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? Object.keys(v as Record<string, unknown>).length
    : 0;
}

/** zustand persist 落盘结构：{ state: {...}, version: n } */
function stateOf(raw: string): Record<string, any> {
  try {
    const parsed = JSON.parse(raw);
    const s = parsed?.state;
    return s && typeof s === 'object' ? s : {};
  } catch {
    return {};
  }
}

export function inspectLocalShards(
  currentUid: string | null,
  storage: StorageLike
): ShardInfo[] {
  const byUid = new Map<string, ShardInfo>();
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k) keys.push(k);
  }

  for (const key of keys) {
    const base = BASE_KEYS.find((b) => key.startsWith(b + ':'));
    if (!base) continue;
    const uid = key.slice(base.length + 1);
    if (!uid || uid.includes('__migrated__')) continue;
    const raw = storage.getItem(key);
    if (raw == null) continue;

    let info = byUid.get(uid);
    if (!info) {
      info = {
        uid,
        isCurrent: uid === currentUid,
        bytes: 0,
        answerRecords: 0,
        sessionRecords: 0,
        vocabWords: 0,
        grammarPoints: 0,
        planLogs: 0,
        sentences: 0,
        storeKeys: [],
      };
      byUid.set(uid, info);
    }
    info.bytes += raw.length;
    info.storeKeys.push(base);

    const s = stateOf(raw);
    if (base === 'ket-progress-v1') {
      info.answerRecords = countArray(s.answerRecords);
      info.sessionRecords = countArray(s.sessionRecords);
    } else if (base === 'ket-plan-v1') {
      info.planLogs = countObject(s.logs);
    } else if (base === 'ket-daily-checkin-v1') {
      info.grammarPoints = countObject(s.points);
    } else if (base === 'ket-vocab-v1') {
      info.vocabWords = countObject(s.words);
      info.sentences = countArray(s.sentences);
    }
  }

  return [...byUid.values()].sort(
    (a, b) => (b.bytes - a.bytes) || a.uid.localeCompare(b.uid)
  );
}

/** UI 展示用：不把完整 uid 摊在屏幕上 */
export function maskUid(uid: string): string {
  if (uid.length <= 12) return uid;
  return uid.slice(0, 6) + '…' + uid.slice(-4);
}
