/**
 * 跨设备同步客户端（走 WorkBuddy 云数据库）
 *
 * 场景（用户原话）：自己用，可能 2 个小孩、多台移动端，要求简单。
 *
 * 设计取舍：
 *   1. **整包同步**，不做细粒度增量 —— 四个 store 打包成一份 JSON 传上去。
 *      数据量小（几千条答题记录也就几百 KB），整包让冲突处理变得可预测。
 *   2. **合并而非覆盖** —— 下载云端数据后与本地合并再上传，
 *      避免「另一台设备刚做的题被这台旧数据冲掉」。
 *   3. **服务端不存明文密码** —— 本地 kid 账号用 PBKDF2 派生哈希存储；
 *      云端身份走 WorkBuddy 账号（邮箱验证码），不涉及本地密码。
 *   4. **失败不阻塞使用** —— 网络不通或未登录时同步失败并给出原因，
 *      应用继续本地可用，不影响做题。
 *
 * 身份的两层（刻意分开）：
 *   · 本地 kid 账号：决定这台设备上「当前是哪个孩子在用」（离线也能用）
 *   · 云端 WorkBuddy 账号：决定「这台设备连到云端的哪份数据」
 *   两者独立 —— 家长用一个云端账号即可同步所有孩子的进度（一个邮箱对应一个小孩，云端数据按 owner_id = 云端 uid 分区；
 *   同一小孩换设备登录后落到同一份云端数据，进度自动拉回。device_id 仅作诊断列保留）。
 */

import {
  getCurrentUser,
  getDisplayName,
  readNicknameProfile,
  applyRemoteNickname,
} from './auth';
import type { NicknameProfile } from './auth';
import { cloud } from './cloud';
import { getCloudSession, markCloudConnected } from './cloudAuth';
import { useProgressStore } from '../store/useProgressStore';
import { usePlanStore } from '../store/usePlanStore';
import { useDailyCheckinStore } from '../store/useDailyCheckinStore';
import { useVocabStore } from '../store/useVocabStore';
import {
  clampDailyCount, DAILY_NEW_OPTIONS, DAILY_REVIEW_OPTIONS,
  NEW_PER_DAY, REVIEW_PER_DAY,
} from './vocabSession';
import { mergeWrittenSentences } from './writtenProduction';
import {
  migrateGrammarPoint,
  newerGrammarPoint,
  todayString as grammarTodayString,
} from './grammarSchedule';
import type { PointProgress } from '../store/useDailyCheckinStore';
import type { VocabSentence } from '../types';

/** 云端同步表名 */
const TABLE = 'sync_payloads';

/** 本机设备标识（用于在云端区分同一账号下的不同设备/孩子数据） */
const DEVICE_ID_KEY = 'ket-sync-device-id';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/** 同步包的负载结构 */
export interface SyncPayload {
  progress: unknown;
  plan: unknown;
  checkin: unknown;
  /** 词汇记忆进度（盒子/到期日/三态） */
  vocab: unknown;
  /** 个人资料（目前只有昵称），随学习进度一起跨设备同步 */
  profile?: NicknameProfile;
  /** 客户端打包时间，用于判断新旧 */
  packedAt: string;
}

export interface SyncStatus {
  ok: boolean;
  message: string;
  /** 本次同步拉回并合并的记录条数 */
  merged?: number;
  updatedAt?: string;
}

// ========== 打包 / 解包 ==========

/** 把四个 store 的持久化数据打包 */
export function packPayload(): SyncPayload {
  return {
    progress: useProgressStore.getState(),
    plan: usePlanStore.getState(),
    checkin: useDailyCheckinStore.getState(),
    vocab: useVocabStore.getState(),
    profile: readNicknameProfile(),
    packedAt: new Date().toISOString(),
  };
}

/**
 * 把云端包合并进本地 store。
 *
 * 合并规则（按「记录级」而非「整块级」，避免一台设备的旧状态盖掉另一台的新状态）：
 *   - answerRecords / sessionRecords：按 id 去重，时间新的胜出
 *   - plan.logs：按日期合并，同日取 completedAt 更新的
 *   - plan.cursor：取较大值（进度只能前进）
 *   - checkin.points：B 档改为「整条按 updatedAt/lastSeen 取较新的一份」（box/dueAt/streak 是
 *     同一份状态，不能字段级取 max），再对 right/wrong/stage 取较大值、firstLearnedAt 取较早值
 *   - checkin.checkinDates：并集
 *   - checkin.streak / lastCheckinDate：取较新的
 *   - vocab.words：按 wordId 合并，lastSeen 较新的一方整条胜出
 *     （box/dueAt/streak 是同一份状态，必须整条取，不能字段级取 max 否则会自相矛盾）
 *   - vocab.placementDone：任一方已完成即视为完成
 *   - vocab.dailyNew / dailyReview：按 dailyCountsUpdatedAt 取较新的一份，值过白名单校验
 *   - vocab.sentences：按 id 并集（产出记录不参与 words 的 lastSeen 覆盖），按时间倒序截断
 *   - profile.nickname：按 nicknameUpdatedAt 取较新的一份，旧包无此字段则忽略
 */
export function mergePayload(remote: Partial<SyncPayload> | null | undefined): number {
  if (!remote) return 0;

  let mergedCount = 0;

  // ---- progress ----
  if (remote.progress) {
    const rp = remote.progress as {
      answerRecords?: Array<Record<string, any>>;
      sessionRecords?: Array<Record<string, any>>;
    };
    const local = useProgressStore.getState();

    if (Array.isArray(rp.answerRecords) && rp.answerRecords.length) {
      const byId = new Map<string, any>();
      for (const r of local.answerRecords) byId.set(r.id, r);
      for (const r of rp.answerRecords) {
        if (!r?.id) continue;
        const cur = byId.get(r.id);
        // 同一题记录：时间新的胜出；本地没有则直接加入
        if (!cur || String(r.answeredAt || '') > String(cur.answeredAt || '')) {
          // 无论新增还是覆盖，只要本地状态变了就计数
          mergedCount++;
          byId.set(r.id, r);
        }
      }
      const merged = [...byId.values()].sort(
        (a, b) => String(b.answeredAt || '').localeCompare(String(a.answeredAt || ''))
      );
      useProgressStore.setState({ answerRecords: merged.slice(0, 1000) } as any);
    }

    if (Array.isArray(rp.sessionRecords) && rp.sessionRecords.length) {
      const byId = new Map<string, any>();
      for (const s of local.sessionRecords) byId.set(s.id, s);
      for (const s of rp.sessionRecords) {
        if (!s?.id) continue;
        const cur = byId.get(s.id);
        if (!cur || String(s.completedAt || '') > String(cur.completedAt || '')) {
          mergedCount++;
          byId.set(s.id, s);
        }
      }
      const merged = [...byId.values()].sort(
        (a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || ''))
      );
      useProgressStore.setState({ sessionRecords: merged.slice(0, 200) } as any);
    }
  }

  // ---- plan ----
  if (remote.plan) {
    const rp = remote.plan as {
      startDate?: string | null;
      cursor?: number;
      logs?: Record<string, any>;
      skips?: Record<string, number>;
    };
    const local = usePlanStore.getState();
    const logs = { ...local.logs };
    for (const [date, log] of Object.entries(rp.logs || {})) {
      const cur = logs[date];
      if (!cur) {
        logs[date] = log;
        mergedCount++;
      } else if (String((log as any)?.completedAt || '') > String((cur as any)?.completedAt || '')) {
        logs[date] = log;
        mergedCount++;
      }
    }
    const skips = { ...local.skips, ...(rp.skips || {}) };
    usePlanStore.setState({
      // 起始日取较早的那个（谁先开始算谁的）
      startDate: pickEarlier(local.startDate, rp.startDate),
      cursor: Math.max(local.cursor, rp.cursor || 0),
      logs,
      skips,
    } as any);
  }

  // ---- checkin ----
  if (remote.checkin) {
    const rp = remote.checkin as {
      points?: Record<string, any>;
      streak?: number;
      lastCheckinDate?: string | null;
      checkinDates?: string[];
    };
    const local = useDailyCheckinStore.getState();
    const gToday = grammarTodayString();
    // mergePayload 直接 setState，绕过 persist 的 version migrate，本地旧结构也要补齐
    const points: Record<string, PointProgress> = {};
    for (const [id, p] of Object.entries(local.points)) {
      points[id] = migrateGrammarPoint(p, gToday);
    }
    for (const [id, raw] of Object.entries(rp.points || {})) {
      const r = migrateGrammarPoint(raw, gToday);
      const cur = points[id];
      if (!cur) {
        points[id] = r;
        mergedCount++;
      } else {
        // B 档：box / dueAt / streak / lastPromotedAt 是同一份状态，整条取较新的一份，
        // 字段级取 max 会造出「box=5 但 dueAt 还是昨天」这类自相矛盾的进度。
        const base = newerGrammarPoint(cur, r, gToday);
        points[id] = {
          ...base,
          introduced: cur.introduced || r.introduced,
          stage: Math.max(cur.stage, r.stage),
          right: Math.max(cur.right, r.right),
          wrong: Math.max(cur.wrong, r.wrong),
          firstLearnedAt: pickEarlier(cur.firstLearnedAt, r.firstLearnedAt) ?? base.firstLearnedAt,
          mastered: base.mastered || cur.mastered || r.mastered,
        };
      }
    }
    const dates = Array.from(new Set([...(local.checkinDates || []), ...(rp.checkinDates || [])])).sort();
    useDailyCheckinStore.setState({
      points,
      streak: Math.max(local.streak, rp.streak || 0),
      lastCheckinDate: pickLater(local.lastCheckinDate, rp.lastCheckinDate) ?? local.lastCheckinDate,
      checkinDates: dates,
    } as any);
  }

  // ---- vocab ----
  if (remote.vocab) {
    const rv = remote.vocab as {
      words?: Record<string, any>;
      currentThemeId?: string;
      placementDone?: boolean;
      placementAt?: string | null;
      lastSessionDate?: string | null;
      dailyNew?: number;
      dailyReview?: number;
      dailyCountsUpdatedAt?: string | null;
      sentences?: VocabSentence[];
    };
    const local = useVocabStore.getState();
    const merged: Record<string, any> = { ...local.words };
    for (const [id, p] of Object.entries(rv.words || {})) {
      if (!p?.wordId) continue;
      const cur = merged[id];
      // 整条按 lastSeen 取新，保证 box / dueAt / streak / status 是同一版本
      if (!cur || String(p.lastSeen || '') > String(cur.lastSeen || '')) {
        merged[id] = { ...p, wordId: id };
        mergedCount++;
      }
    }
    // 每日词量按修改时间取较新的一份；旧版同步包没有这两个字段时保持本机默认值。
    // 值一律过 clampDailyCount，云端脏数据不会把队列清空或变成 NaN。
    const localDailyStamp = String(local.dailyCountsUpdatedAt ?? '');
    const remoteDailyStamp = String(rv.dailyCountsUpdatedAt ?? '');
    const useRemoteDaily = Boolean(remoteDailyStamp) && remoteDailyStamp > localDailyStamp;
    const dailyNew = clampDailyCount(
      useRemoteDaily ? rv.dailyNew : local.dailyNew, NEW_PER_DAY, DAILY_NEW_OPTIONS
    );
    const dailyReview = clampDailyCount(
      useRemoteDaily ? rv.dailyReview : local.dailyReview, REVIEW_PER_DAY, DAILY_REVIEW_OPTIONS
    );
    const dailyCountsUpdatedAt = useRemoteDaily ? remoteDailyStamp : (localDailyStamp || null);
    // 造句记录与记忆状态分开合并：words 会被 lastSeen 较新的一方整条覆盖，
    // 句子若塞在 words 里会被另一台设备冲掉。旧同步包没有 sentences 时保持本地。
    const localSentences = local.sentences ?? [];
    const sentences = mergeWrittenSentences(
      localSentences,
      Array.isArray(rv.sentences) ? rv.sentences : []
    );
    useVocabStore.setState({
      words: merged,
      currentThemeId: local.currentThemeId || rv.currentThemeId || '',
      placementDone: local.placementDone || Boolean(rv.placementDone),
      placementAt: pickLater(local.placementAt, rv.placementAt),
      lastSessionDate: pickLater(local.lastSessionDate, rv.lastSessionDate),
      dailyNew,
      dailyReview,
      dailyCountsUpdatedAt,
      sentences,
    } as any);
    if (useRemoteDaily) mergedCount++;
    if (sentences.length > localSentences.length) mergedCount += sentences.length - localSentences.length;
  }

  // ---- profile（昵称）：按 nicknameUpdatedAt 取较新的一份 ----
  // 旧版同步包没有该字段，applyRemoteNickname 会直接忽略，不会把昵称清空。
  if (remote.profile) {
    if (applyRemoteNickname(remote.profile.nickname ?? '', remote.profile.nicknameUpdatedAt)) {
      mergedCount++;
    }
  }

  return mergedCount;
}

function pickEarlier(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a < b ? a : b;
}

function pickLater(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a > b ? a : b;
}

// ========== 云端读写 ==========

/** 读本账号（owner_id = 云端 uid）在云端的同步行 */
async function readCloudRow(): Promise<{ id: number; payload: any; updated_at: string } | null> {
  const session = await getCloudSession();
  const ownerId = session?.userId;
  if (!ownerId) throw new Error('未连接云端');

  const { data, error } = await cloud.database
    .from(TABLE)
    .select('id, payload, updated_at')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message || '读取云端数据失败');
  const row = (data as any[])?.[0];
  return row ? { id: row.id, payload: row.payload, updated_at: row.updated_at } : null;
}

/** 写入本设备在云端的同步行（存在则更新，否则插入） */
async function writeCloudRow(payload: SyncPayload): Promise<string> {
  const deviceId = getDeviceId();
  const user = getCurrentUser();
  // 云端行的展示名跟随个人中心昵称（仅为诊断可读，不参与数据合并）
  const ownerName = user ? getDisplayName(user) : null;

  const existing = await readCloudRow();

  if (existing) {
    const { data, error } = await cloud.database
      .from(TABLE)
      .update({ payload, owner_name: ownerName, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select();
    if (error) throw new Error(error.message || '更新云端数据失败');
    const affected = Array.isArray(data) ? data : [];
    if (affected.length === 0) {
      throw new Error('云端更新未生效（可能被权限拦截）');
    }
    return existing.updated_at;
  }

  const { data, error } = await cloud.database
    .from(TABLE)
    .insert({ payload, device_id: deviceId, owner_name: ownerName })
    .select();
  if (error) throw new Error(error.message || '写入云端数据失败');
  const affected = Array.isArray(data) ? data : [];
  if (affected.length === 0) {
    throw new Error('云端写入未生效（可能被权限拦截）');
  }
  return (affected[0] as any)?.updated_at ?? new Date().toISOString();
}

// ========== 对外接口 ==========
// 注：isCloudConnected / markCloudConnected 已迁至 cloudAuth.ts（云端会话与
// 本机标记同属一处管理），此处仅从 cloudAuth 导入后复用，不再本地定义。

/**
 * 拉取云端数据并合并到本地。
 *
 * 前置：已登录云端账号（WorkBuddy Auth）。
 */
export async function syncPull(): Promise<SyncStatus> {
  const session = await getCloudSession();
  if (!session) {
    return { ok: false, message: '未连接云端，请先在登录页用邮箱连接' };
  }
  try {
    const row = await readCloudRow();
    if (!row) {
      return { ok: true, message: '云端还没有这台设备的数据，将上传本地数据', merged: 0 };
    }
    const merged = mergePayload(row.payload);
    markCloudConnected(true);
    return {
      ok: true,
      message: merged > 0 ? `已同步 ${merged} 条新记录` : '已是最新',
      merged,
      updatedAt: row.updated_at,
    };
  } catch (e) {
    return { ok: false, message: `拉取失败：${(e as Error).message}` };
  }
}

/**
 * 上传本地数据（合并云端已有内容后回传，保证云端是完整状态）。
 */
export async function syncPush(): Promise<SyncStatus> {
  const session = await getCloudSession();
  if (!session) {
    return { ok: false, message: '未连接云端，请先在登录页用邮箱连接' };
  }
  try {
    // 先拉一次合并，避免用旧数据覆盖云端
    const row = await readCloudRow();
    if (row) mergePayload(row.payload);

    const updatedAt = await writeCloudRow(packPayload());
    markCloudConnected(true);
    return { ok: true, message: '已上传', updatedAt };
  } catch (e) {
    return { ok: false, message: `上传失败：${(e as Error).message}` };
  }
}

/**
 * 完整同步：拉取 + 合并 + 上传。
 * 首次连接云端时用它把本机数据推上去。
 */
export async function syncNow(): Promise<SyncStatus> {
  const session = await getCloudSession();
  if (!session) {
    return { ok: false, message: '未连接云端，请先在登录页用邮箱连接' };
  }
  try {
    const row = await readCloudRow();
    const merged = row ? mergePayload(row.payload) : 0;
    const updatedAt = await writeCloudRow(packPayload());
    markCloudConnected(true);
    return {
      ok: true,
      message: merged > 0 ? `已同步 ${merged} 条新记录` : '同步完成',
      merged,
      updatedAt,
    };
  } catch (e) {
    return { ok: false, message: `同步失败：${(e as Error).message}` };
  }
}
