// ========== 备考计划执行状态 ==========
// 负责：
//  - 计划起始日（第一次打开「今日备考」时锚定为当天，可在计划页重设）
//  - 推进游标 cursor：已推进到第几套题（= 当前该做的套索引）
//    · 进度式推进：只有「做完」或「跳过」才推进，没做完明天还是同一套（不浪费）
//  - 每日完成记录（题组判分结果、写作/口语完成情况、用时）
//  - 连续完成天数、总完成率（供计划页与首页展示）
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dateKey, diffDays } from '../data/dailyPlan';

export interface DailyItemResult {
  id: string;
  correct: boolean;
}

export interface WritingPointResult {
  label: string;
  covered: boolean;
  hitKeywords: string[];
  hint: string;
}

export interface WritingGrade {
  wordCount: number;
  minWords: number;
  wordCountOk: boolean;
  points: WritingPointResult[];
  pointsHit: number;
  pointsTotal: number;
  pointsPercent: number;
  passed: boolean;
  grammarIssues: { fragment: string; message: string; suggestion: string }[];
  summary: string;
}

export interface DailyLog {
  date: string;              // 实际完成的日历日 YYYY-MM-DD
  setIndex: number;          // 完成的是第几套题（进度游标）
  itemIds: string[];         // 当日客观题 id 列表
  results: DailyItemResult[];
  correctCount: number;
  totalCount: number;
  writingDone: boolean;
  writingWords: number;
  /** 写作批改详情（可选：旧版本日志没有此字段） */
  writingGrade?: WritingGrade;
  speakingDone: boolean;
  speakingPercent: number;  // 关键词覆盖率 0-100
  minutes: number;           // 用时（分钟）
  completedAt: string;       // ISO
}

interface PlanState {
  startDate: string | null;
  /** 推进游标：已完成（或跳过）的套数，即下一个该做的套索引 */
  cursor: number;
  logs: Record<string, DailyLog>;
  /** 被跳过的套（date -> setIndex），跳过后不算完成、连续天数会断 */
  skips: Record<string, number>;

  // actions
  ensureStartDate: (todayKey: string) => string;
  setStartDate: (date: string) => void;
  getLog: (date: string) => DailyLog | undefined;
  /** 做完一套：记录 + 推进游标 */
  completeDay: (log: DailyLog) => void;
  /** 跳过当前套：推进游标但不记完成（防卡死用） */
  skipDay: (date: string, setIndex: number) => void;
  isDone: (date: string) => boolean;
  /** 连续完成天数（按日历日连续，从今天或昨天往前数；跳过会断） */
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
      cursor: 0,
      logs: {},
      skips: {},

      ensureStartDate: (todayKey) => {
        const cur = get().startDate;
        if (cur) return cur;
        set({ startDate: todayKey });
        return todayKey;
      },

      // 重设起始日 = 重开计划（清空进度与游标）
      setStartDate: (date) => set({ startDate: date, cursor: 0, logs: {}, skips: {} }),

      getLog: (date) => get().logs[date],

      completeDay: (log) =>
        set((state) => ({
          logs: { ...state.logs, [log.date]: log },
          cursor: Math.max(state.cursor, log.setIndex + 1),
        })),

      skipDay: (date, setIndex) =>
        set((state) => ({
          skips: { ...state.skips, [date]: setIndex },
          cursor: Math.max(state.cursor, setIndex + 1),
        })),

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

      reset: () => set({ cursor: 0, logs: {}, skips: {} }),
    }),
    {
      name: 'ket-plan-v1',
    }
  )
);
