// ========== 口语练习本机证据（IndexedDB）==========
// 只存当前设备，绝不进 sync payload、绝不上传云端。
// 儿童语音合规：音频不落服务端、不写日志，7 天自动清除，用户可一键清空。
// 用途：分数可复核（回放 + 重评 + 「我觉得评错了」），以及后续 P2 做人工标注校准集。
//
// 多账号隔离：一台设备两个孩子时，录音证据按当前账号 uid 过滤，A 看不到 B 的。
// 新记录写入时自动盖 uid；读取/更新/清空都只碰当前账号的。旧版无 uid 的记录
// （多账号功能之前存的）暂对当前账号可见，7 天 TTL 到期自动清掉，不做破坏性迁移。

import { getCurrentUser } from './auth';

const DB_NAME = 'ket-speaking-evidence';
const STORE = 'records';
const DB_VERSION = 1;

export const EVIDENCE_TTL_DAYS = 7;

export type AsrSource = 'browser' | 'edited' | 'manual' | 'none';
export type ScoreSource = 'local' | 'llm';

export interface SpeechEvidence {
  id: string;
  /** 所属账号 uid（多账号隔离）；旧记录可能缺失，读取时按「无 uid = 当前账号」兼容 */
  uid?: string;
  questionId: string;
  part: 1 | 2;
  createdAt: string;
  updatedAt: string;
  /** 原始录音；手动输入时为 null */
  audio: Blob | null;
  audioMime: string;
  audioBytes: number;
  /** ASR 原始输出，保留不覆盖，便于对照误识别 */
  rawTranscript: string;
  asrSource: AsrSource;
  /** 孩子确认 / 修改后、真正送进评分的定稿文字 */
  confirmedText: string;
  score: number | null;
  scoreSource: ScoreSource | null;
  /** 云端 LLM 实际使用的模型 id，便于复现评分 */
  modelId: string | null;
  /** AI 评分原始返回对象（仅本机） */
  llmResult: unknown | null;
  /** 「我觉得评错了」标记 */
  flagged: boolean;
}

export function speechEvidenceAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

/** 当前账号 uid；未登录时返回空串（证据面板在登录后才会用） */
function currentUid(): string {
  return getCurrentUser()?.id ?? '';
}

/**
 * 记录是否属于当前账号。
 * 旧记录没有 uid 字段（多账号功能之前存的），视为当前账号可见，避免升级后
 * 自己以前录的证据突然消失；7 天 TTL 会自然清掉，不做破坏性迁移。
 */
function belongsToCurrent(rec: SpeechEvidence, uid: string): boolean {
  return !rec.uid || rec.uid === uid;
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 请求失败'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB 事务失败'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB 事务被中止'));
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error('无法打开本机录音证据库'));
      };
    });
  }
  return dbPromise;
}

/** 整条写入（同 id 覆盖），失败不外抛——本机证据不能影响答题主流程 */
export async function putSpeechEvidence(record: SpeechEvidence): Promise<boolean> {
  if (!speechEvidenceAvailable()) return false;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    // 写入时盖当前账号 uid；已在别处带 uid 的（如回写）保持原值不动
    tx.objectStore(STORE).put({ ...record, uid: record.uid || currentUid() });
    await txDone(tx);
    return true;
  } catch (e) {
    console.warn('[speech-evidence] 写入失败：', e);
    return false;
  }
}

export async function getSpeechEvidence(id: string): Promise<SpeechEvidence | null> {
  if (!speechEvidenceAvailable()) return null;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readonly');
    const found = await requestToPromise<SpeechEvidence | undefined>(
      tx.objectStore(STORE).get(id) as IDBRequest<SpeechEvidence | undefined>
    );
    return found && belongsToCurrent(found, currentUid()) ? found : null;
  } catch {
    return null;
  }
}

/** 按时间倒序列出最近的证据，供本机复核面板使用 */
export async function listSpeechEvidence(limit = 12): Promise<SpeechEvidence[]> {
  if (!speechEvidenceAvailable()) return [];
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readonly');
    const uid = currentUid();
    const all = await requestToPromise<SpeechEvidence[]>(
      tx.objectStore(STORE).getAll() as IDBRequest<SpeechEvidence[]>
    );
    return all
      .filter((r) => belongsToCurrent(r, uid))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** 局部更新（重评、标记评错）；不存在时静默跳过 */
export async function patchSpeechEvidence(
  id: string,
  patch: Partial<SpeechEvidence>
): Promise<boolean> {
  if (!speechEvidenceAvailable()) return false;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const prev = await requestToPromise<SpeechEvidence | undefined>(
      store.get(id) as IDBRequest<SpeechEvidence | undefined>
    );
    if (!prev || !belongsToCurrent(prev, currentUid())) return false;
    store.put({ ...prev, ...patch, id, uid: prev.uid || currentUid(), updatedAt: new Date().toISOString() });
    await txDone(tx);
    return true;
  } catch (e) {
    console.warn('[speech-evidence] 更新失败：', e);
    return false;
  }
}

/** 清掉超过 TTL 的记录，返回删除条数 */
export async function pruneSpeechEvidence(ttlDays = EVIDENCE_TTL_DAYS): Promise<number> {
  if (!speechEvidenceAvailable()) return 0;
  try {
    const cutoff = Date.now() - ttlDays * 24 * 60 * 60 * 1000;
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const all = await requestToPromise<SpeechEvidence[]>(
      store.getAll() as IDBRequest<SpeechEvidence[]>
    );
    const expired = all.filter((r) => new Date(r.createdAt).getTime() < cutoff);
    for (const r of expired) store.delete(r.id);
    await txDone(tx);
    return expired.length;
  } catch {
    return 0;
  }
}

/** 只清空当前账号的证据（多账号设备互不误删）；旧的无 uid 记录也算当前账号的 */
export async function clearSpeechEvidence(): Promise<boolean> {
  if (!speechEvidenceAvailable()) return false;
  try {
    const db = await openDb();
    const uid = currentUid();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const all = await requestToPromise<SpeechEvidence[]>(
      store.getAll() as IDBRequest<SpeechEvidence[]>
    );
    for (const r of all) {
      if (belongsToCurrent(r, uid)) store.delete(r.id);
    }
    await txDone(tx);
    return true;
  } catch {
    return false;
  }
}
