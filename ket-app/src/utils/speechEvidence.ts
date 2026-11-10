// ========== 口语练习本机证据（IndexedDB）==========
// 只存当前设备，绝不进 sync payload、绝不上传云端。
// 儿童语音合规：音频不落服务端、不写日志，7 天自动清除，用户可一键清空。
// 用途：分数可复核（回放 + 重评 + 「我觉得评错了」），以及后续 P2 做人工标注校准集。

const DB_NAME = 'ket-speaking-evidence';
const STORE = 'records';
const DB_VERSION = 1;

export const EVIDENCE_TTL_DAYS = 7;

export type AsrSource = 'browser' | 'edited' | 'manual' | 'none';
export type ScoreSource = 'local' | 'llm';

export interface SpeechEvidence {
  id: string;
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
    tx.objectStore(STORE).put(record);
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
    return found ?? null;
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
    const all = await requestToPromise<SpeechEvidence[]>(
      tx.objectStore(STORE).getAll() as IDBRequest<SpeechEvidence[]>
    );
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
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
    if (!prev) return false;
    store.put({ ...prev, ...patch, id, updatedAt: new Date().toISOString() });
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

export async function clearSpeechEvidence(): Promise<boolean> {
  if (!speechEvidenceAvailable()) return false;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    await txDone(tx);
    return true;
  } catch {
    return false;
  }
}
