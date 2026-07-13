// ========== 每日综合训练 打卡记录 ==========
// 独立于语法打卡(useDailyCheckinStore)，只负责综合训练的连续天数/历史/按模块统计。
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MixModule } from '../utils/dailyMix';

export interface DailyMixLog {
  date: string;            // YYYY-MM-DD
  total: number;           // 本次题数
  correct: number;         // 答对数
  byModule: Partial<Record<MixModule, { total: number; correct: number }>>;
}

interface DailyMixStore {
  streak: number;          // 连续打卡天数
  lastDate: string | null; // 最近完成日期 YYYY-MM-DD
  history: DailyMixLog[];  // 保留最近 120 天
  /** 完成一次综合训练打卡 */
  completeToday: (log: Omit<DailyMixLog, 'date'>) => void;
  isTodayDone: () => boolean;
  reset: () => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86400000);
}

export const useDailyMixStore = create<DailyMixStore>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastDate: null,
      history: [],

      completeToday: (log) => {
        const today = todayStr();
        const { lastDate, streak, history } = get();
        if (lastDate === today) {
          // 今日已打卡：仅覆盖当天记录，不重复累加 streak
          const rest = history.filter((h) => h.date !== today);
          set({ history: [{ date: today, ...log }, ...rest].slice(0, 120) });
          return;
        }
        let newStreak = 1;
        if (lastDate && daysBetween(lastDate, today) === 1) newStreak = streak + 1;
        const rest = history.filter((h) => h.date !== today);
        set({
          streak: newStreak,
          lastDate: today,
          history: [{ date: today, ...log }, ...rest].slice(0, 120),
        });
      },

      isTodayDone: () => get().lastDate === todayStr(),

      reset: () => set({ streak: 0, lastDate: null, history: [] }),
    }),
    { name: 'ket-daily-mix-v1' }
  )
);
