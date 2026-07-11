// ========== 语法每日打卡状态 ==========
// 用 zustand + persist 持久化到 localStorage。负责：
//  - 各语法点的学习进度（introduced / stage / 正确错误数 / Leitner 盒子）
//  - 连续打卡 streak、日历热力图数据、每日完成判定
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROADMAP } from '../data/grammarRoadmap';

export interface PointProgress {
  grammarId: string;
  introduced: boolean; // 是否已被作为"今日新点"学过
  stage: number; // 0 未开始 / 1 已学 / 2 已对比产出 / 4 熟练
  right: number;
  wrong: number;
  box: number; // Leitner 盒子 1-5（越大越久才复习，错题回到 1）
  lastSeen: string | null; // 最近一次练习日期 YYYY-MM-DD
}

interface DailyCheckinState {
  points: Record<string, PointProgress>;
  streak: number;
  lastCheckinDate: string | null; // YYYY-MM-DD
  checkinDates: string[]; // 已打卡日期，用于热力图

  // actions
  ensurePoint: (id: string) => void;
  getPoint: (id: string) => PointProgress;
  recordQuestion: (grammarId: string, isCorrect: boolean) => void;
  finishPoint: (grammarId: string, stageReached: number) => void;
  completeCheckin: (todayStr: string) => void;
  getNextNewPointId: () => string | null;
  isTodayDone: (todayStr: string) => boolean;
  reset: () => void;
}

function emptyPoint(id: string): PointProgress {
  return { grammarId: id, introduced: false, stage: 0, right: 0, wrong: 0, box: 1, lastSeen: null };
}

function todayString(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
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

      ensurePoint: (id) => {
        set((state) => {
          if (state.points[id]) return state;
          return { points: { ...state.points, [id]: emptyPoint(id) } };
        });
      },

      getPoint: (id) => {
        const p = get().points[id];
        return p ?? emptyPoint(id);
      },

      recordQuestion: (grammarId, isCorrect) => {
        set((state) => {
          const prev = state.points[grammarId] ?? emptyPoint(grammarId);
          const box = isCorrect ? Math.min(5, prev.box + 1) : 1;
          const next: PointProgress = {
            ...prev,
            right: prev.right + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
            box,
            lastSeen: todayString(),
          };
          return { points: { ...state.points, [grammarId]: next } };
        });
      },

      finishPoint: (grammarId, stageReached) => {
        set((state) => {
          const prev = state.points[grammarId] ?? emptyPoint(grammarId);
          const next: PointProgress = {
            ...prev,
            introduced: true,
            stage: Math.max(prev.stage, stageReached),
            lastSeen: todayString(),
          };
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

      // 下一个尚未"学过"的语法点；若都学过，返回第一个未熟练(stage<4)的点用于强化
      getNextNewPointId: () => {
        const { points } = get();
        for (const id of ROADMAP) {
          if (!points[id]?.introduced) return id;
        }
        for (const id of ROADMAP) {
          if ((points[id]?.stage ?? 0) < 4) return id;
        }
        return null; // 全部熟练
      },

      isTodayDone: (todayStr) => get().lastCheckinDate === todayStr,

      reset: () => set({ points: {}, streak: 0, lastCheckinDate: null, checkinDates: [] }),
    }),
    {
      name: 'ket-daily-checkin-v1',
    }
  )
);

export { todayString, diffDays };
