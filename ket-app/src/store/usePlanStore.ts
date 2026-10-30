// ========== 备考计划执行状态 ==========
// 负责：
//  - 计划起始日（第一次打开「今日备考」时锚定为当天，可在计划页重设）
//  - 每日完成记录（题组判分结果、写作/口语完成情况、用时）
//  - 连续完成天数、总完成率（供计划页与首页展示）
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dateKey, diffDays } from '../data/dailyPlan';

export interface DailyItemResult {
  id: string;
  correct: boolean;
}

export interface DailyLog {
  date: string;              // YYYY-MM-DD
  itemIds: string[];         // 当日客观题 id 列表
  results: DailyItemResult[];
  correctCount: number;
  totalCount: number;
  writingDone: boolean;
  writingWords: number;
  speakingDone: boolean;
  speakingPercent: number;  // 关键词覆盖率 0-100
  minutes: number;           // 用时（分钟）
  completedAt: string;       // ISO
}

interface PlanState {
  startDate: string | null;
  logs: Record<string, DailyLog>;

  // actions
  ensureStartDate: (todayKey: string) => string;
  setStartDate: (date: string) => void;
  getLog: (date: string) => DailyLog | undefined;
  saveLog: (log: DailyLog) => void;
  isDone: (date: string) => boolean;
  /** 连续完成天数（从今天或昨天往前数） */
  getStreak: (todayKey: string) => number;
  /** 已完成天数 */
  getCompletedCount: () => number;
  /** 已完成的日期列表（升序） */
  getCompletedDates: () => string[];
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      startDate: null,
      logs: {},

      ensureStartDate: (todayKey) => {
        const cur = get().startDate;
        if (cur) return cur;
        set({ startDate: todayKey });
        return todayKey;
      },

      setStartDate: (date) => set({ startDate: date }),

      getLog: (date) => get().logs[date],

      saveLog: (log) => set((state) => ({ logs: { ...state.logs, [log.date]: log } })),

      isDone: (date) => Boolean(get().logs[date]),

      getStreak: (todayKey) => {
        const { logs, startDate } = get();
        if (!startDate) return 0;
        // 今天是开始日之前 → 未开始
        if (diffDays(startDate, todayKey) < 0) return 0;
        let streak = 0;
        let cursor = todayKey;
        // 今天没完成就从昨天开始数（今天还有机会）
        if (!logs[cursor]) {
          const y = new Date(todayKey);
          y.setDate(y.getDate() - 1);
          cursor = dateKey(y);
        }
        while (logs[cursor]) {
          streak++;
          const d = new Date(cursor);
          d.setDate(d.getDate() - 1);
          cursor = dateKey(d);
        }
        return streak;
      },

      getCompletedCount: () => Object.keys(get().logs).length,

      getCompletedDates: () => Object.keys(get().logs).sort(),

      reset: () => set({ logs: {} }),
    }),
    {
      name: 'ket-plan-v1',
    }
  )
);
