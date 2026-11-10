// ========== 语法每日打卡状态 ==========
// 用 zustand + persist 持久化到 localStorage。负责：
//  - 各语法点的学习进度（introduced / stage / 正确错误数 / Leitner 盒子）
//  - 连续打卡 streak、日历热力图数据、每日完成判定
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ROADMAP } from '../data/grammarRoadmap';
import userScopedStorage from './userScopedStorage';
import {
  applyGrammarAnswer,
  applyGrammarProduction,
  emptyGrammarPoint,
  isGrammarMastered,
  migrateGrammarPoint,
  pickNextGrammarPointId,
  todayString,
  type GrammarPointProgress,
} from '../utils/grammarSchedule';

// B 档：字段定义移到 grammarSchedule.ts 纯函数层，store 与 session 生成器共用同一份。
export type PointProgress = GrammarPointProgress;

export interface TodayAnswer {
  grammarId: string;
  phase: 'review' | 'learn' | 'contrast' | 'production' | 'mixed';
  correct: boolean;
}

export interface TodayLog {
  date: string; // YYYY-MM-DD
  newPointId: string | null; // 今日主学的新语法点（额外练习可能为 null）
  items: TodayAnswer[];
  servedIds: string[]; // 今日已出过的题目 id（主打卡），供额外练习去重
}

interface DailyCheckinState {
  points: Record<string, PointProgress>;
  streak: number;
  lastCheckinDate: string | null; // YYYY-MM-DD
  checkinDates: string[]; // 已打卡日期，用于热力图
  todayLog: TodayLog | null; // 今日答题明细，用于打卡结果总结

  // actions
  ensurePoint: (id: string) => void;
  getPoint: (id: string) => PointProgress;
  recordQuestion: (grammarId: string, isCorrect: boolean) => void;
  /** B 档：手写产出只更新「连续手写正确」，不动 box / dueAt；跳过不调用 */
  recordProduction: (grammarId: string, isCorrect: boolean) => void;
  logAnswer: (grammarId: string, phase: TodayAnswer['phase'], isCorrect: boolean) => void;
  setTodayNewPoint: (id: string | null) => void;
  markServed: (id: string) => void; // 记录主打卡已出过的题目，供额外练习去重
  finishPoint: (grammarId: string, stageReached: number) => void;
  completeCheckin: (todayStr: string) => void;
  getNextNewPointId: () => string | null;
  isTodayDone: (todayStr: string) => boolean;
  reset: () => void;
}

function emptyPoint(id: string): PointProgress {
  return emptyGrammarPoint(id);
}

function diffDays(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export const useDailyCheckinStore = create<DailyCheckinState>()(
  persist(
    (set, get) => ({
      points: {},
      streak: 0,
      lastCheckinDate: null,
      checkinDates: [],

      todayLog: null,

      ensurePoint: (id) => {
        set((state) => {
          if (state.points[id]) return state;
          return { points: { ...state.points, [id]: emptyPoint(id) } };
        });
      },

      getPoint: (id) => {
        const p = get().points[id];
        return p ? migrateGrammarPoint(p) : emptyPoint(id);
      },

      // B 档：一天最多升一级 + dueAt 0/1/3/7/15 排期，全部走纯函数层
      recordQuestion: (grammarId, isCorrect) => {
        set((state) => {
          const prev = state.points[grammarId] ?? emptyPoint(grammarId);
          const { next } = applyGrammarAnswer(prev, isCorrect, todayString());
          return { points: { ...state.points, [grammarId]: next } };
        });
      },

      // B 档：手写产出计入「连续手写正确」，是熟练判定的证据之一；不动排期
      recordProduction: (grammarId, isCorrect) => {
        set((state) => {
          const prev = state.points[grammarId] ?? emptyPoint(grammarId);
          const { next } = applyGrammarProduction(prev, isCorrect, todayString());
          return { points: { ...state.points, [grammarId]: next } };
        });
      },

      logAnswer: (grammarId, phase, isCorrect) => {
        set((state) => {
          const t = todayString();
          const base =
            state.todayLog && state.todayLog.date === t
              ? state.todayLog
              : { date: t, newPointId: null, items: [] as TodayAnswer[], servedIds: [] as string[] };
          return {
            todayLog: {
              ...base,
              items: [...base.items, { grammarId, phase, correct: isCorrect }],
            },
          };
        });
      },

      setTodayNewPoint: (id) => {
        set((state) => {
          const t = todayString();
          const base =
            state.todayLog && state.todayLog.date === t
              ? state.todayLog
              : { date: t, newPointId: null, items: [] as TodayAnswer[], servedIds: [] as string[] };
          return { todayLog: { ...base, newPointId: id } };
        });
      },

      markServed: (id) => {
        set((state) => {
          const t = todayString();
          const base =
            state.todayLog && state.todayLog.date === t
              ? state.todayLog
              : { date: t, newPointId: null, items: [] as TodayAnswer[], servedIds: [] as string[] };
          if (base.servedIds.includes(id)) return state;
          return { todayLog: { ...base, servedIds: [...base.servedIds, id] } };
        });
      },

      finishPoint: (grammarId, stageReached) => {
        set((state) => {
          const t = todayString();
          const p = migrateGrammarPoint(state.points[grammarId] ?? emptyPoint(grammarId), t);
          // B 档：混合测验正确率只作当日反馈，不再直接把 stage 顶到 4（熟练）。
          // 熟练只能由 isGrammarMastered 判定；旧数据 stage=4 予以保留，不倒退。
          const next: PointProgress = {
            ...p,
            introduced: true,
            stage: p.stage >= 4 ? 4 : Math.max(p.stage, Math.min(2, stageReached)),
            firstLearnedAt: p.firstLearnedAt ?? t,
            lastSeen: t,
            updatedAt: t,
          };
          next.mastered = isGrammarMastered(next, t);
          return { points: { ...state.points, [grammarId]: next } };
        });
      },

      completeCheckin: (todayStr) => {
        set((state) => {
          if (state.lastCheckinDate === todayStr) return state; // 今天已打卡
          const days = state.lastCheckinDate ? diffDays(state.lastCheckinDate, todayStr) : 999;
          const newStreak = days === 1 ? state.streak + 1 : 1;
          const dates = state.checkinDates.includes(todayStr)
            ? state.checkinDates
            : [...state.checkinDates, todayStr];
          return {
            streak: newStreak,
            lastCheckinDate: todayStr,
            checkinDates: dates,
          };
        });
      },

      // B 档：下一个未学过的点；都学过则取已学但未熟练的（按新判据，不再看 stage<4）
      getNextNewPointId: () => pickNextGrammarPointId(get().points, ROADMAP, todayString()),

      isTodayDone: (todayStr) => get().lastCheckinDate === todayStr,

      reset: () => set({ points: {}, streak: 0, lastCheckinDate: null, checkinDates: [] }),
    }),
    {
      name: 'ket-daily-checkin-v1', // 不改名：改名会丢掉用户已有的打卡进度
      storage: createJSONStorage(() => userScopedStorage),
      // B 档：旧版 points 没有 dueAt / streak / firstLearnedAt 等字段，
      // 版本升到 2，rehydrate 时逐条补齐；旧 stage=4 保留为熟练，不倒退。
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted && typeof persisted === 'object' ? persisted : {}) as Record<string, unknown>;
        if (version < 2) {
          const t = todayString();
          const raw = (state.points ?? {}) as Record<string, unknown>;
          state.points = Object.fromEntries(
            Object.entries(raw).map(([id, p]) => [id, migrateGrammarPoint(p, t)])
          );
        }
        return state as unknown as DailyCheckinState;
      },
    }
  )
);

export { todayString, diffDays };
