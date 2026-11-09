// ========== 词汇记忆进度（跨天队列 + Leitner 盒子）==========
//
// 与旧版 WordProgress（types/index.ts，仅拼写计数）互不影响：
// 旧体系记录「做对过几道拼写题」，新体系记录「这个词在记忆时间轴上的位置」。
//
// 设计口径（2026-11-07 定稿）：
//   · 主键 wordId；themeId 只作分组标签（词库里主题 ID 有重复，不能当主键）
//   · 0/1/3/7/15 天是工程默认值，不宣称是艾宾浩斯最优参数
//   · 听写是唯一掌握证据；选词义、跟读都不进这里
//   · 掌握 = 到 Box 5 + 连续 2 次听写正确 + 距首次学习 ≥ 7 天
//   · 答错回 Box 1、当天重新排队，当轮立即重做由 UI 负责
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import userScopedStorage from './userScopedStorage';
import type {
  PlacementChoice,
  VocabBox,
  VocabRoute,
  VocabWordProgress,
} from '../types';
import {
  applyDictation, emptyProgress, addDays, BOX_INTERVAL_DAYS,
} from '../utils/vocabSchedule';

// 日期/间隔/判据统一放在 vocabSchedule（纯函数、可 Node 实跑），此处只做 re-export
export {
  BOX_INTERVAL_DAYS, MASTER_STREAK, MASTER_MIN_DAYS,
  todayString, addDays, daysBetween,
} from '../utils/vocabSchedule';

export interface DictationOutcome {
  boxBefore: VocabBox;
  boxAfter: VocabBox;
  mastered: boolean;
  correct: boolean;
}

interface VocabState {
  words: Record<string, VocabWordProgress>;
  /** 当前主题（新词从它取），仅作界面默认，不参与数据分区 */
  currentThemeId: string;
  placementDone: boolean;
  placementAt: string | null;
  lastSessionDate: string | null;
  /** 每日新词 / 复习题量（用户可自定义），随学习进度云同步 */
  dailyNew: number;
  dailyReview: number;
  dailyCountsUpdatedAt: string | null;

  ensureWord: (wordId: string, themeId: string, route: VocabRoute, today: string) => void;
  recordDictation: (
    wordId: string, themeId: string, route: VocabRoute, correct: boolean, today: string
  ) => DictationOutcome;
  /** 首次入场测：known → Box 3，unsure → Box 2，unknown 保持未学 */
  completePlacement: (
    choices: Record<string, { themeId: string; route: VocabRoute; choice: PlacementChoice }>,
    today: string
  ) => void;
  setCurrentTheme: (themeId: string) => void;
  setDailyCounts: (dailyNew: number, dailyReview: number) => void;
  markSessionDate: (today: string) => void;
  /** 主题卡里手动把某个词重新排进今天的队列 */
  requeueWord: (wordId: string, today: string) => void;
  isDoneToday: (today: string) => boolean;
  reset: () => void;
}

export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      words: {},
      currentThemeId: '',
      placementDone: false,
      placementAt: null,
      lastSessionDate: null,
      dailyNew: 6,
      dailyReview: 8,
      dailyCountsUpdatedAt: null,

      ensureWord: (wordId, themeId, route, today) => {
        set((state) => {
          if (state.words[wordId]) return state;
          return {
            words: {
              ...state.words,
              [wordId]: emptyProgress(wordId, themeId, route, today),
            },
          };
        });
      },

      recordDictation: (wordId, themeId, route, correct, today) => {
        const base = get().words[wordId] ?? emptyProgress(wordId, themeId, route, today);
        const prev: VocabWordProgress = {
          ...base,
          themeId: base.themeId || themeId,
          route: base.route || route,
        };
        const { boxBefore, boxAfter, mastered, next } = applyDictation(prev, correct, today);
        set((state) => ({ words: { ...state.words, [wordId]: next } }));
        return { boxBefore, boxAfter, mastered, correct };
      },

      completePlacement: (choices, today) => {
        set((state) => {
          const words = { ...state.words };
          for (const [wordId, info] of Object.entries(choices)) {
            if (info.choice === 'unknown') continue;
            const box: VocabBox = info.choice === 'known' ? 3 : 2;
            words[wordId] = {
              ...(words[wordId] ?? emptyProgress(wordId, info.themeId, info.route, today)),
              wordId,
              themeId: info.themeId,
              route: info.route,
              box,
              dueAt: addDays(today, BOX_INTERVAL_DAYS[box]),
              status: 'learning',
            };
          }
          return { words, placementDone: true, placementAt: today };
        });
      },

      setCurrentTheme: (themeId) => set({ currentThemeId: themeId }),
      setDailyCounts: (dailyNew, dailyReview) => set({
        dailyNew,
        dailyReview,
        dailyCountsUpdatedAt: new Date().toISOString(),
      }),
      markSessionDate: (today) => set({ lastSessionDate: today }),
      requeueWord: (wordId, today) => {
        set((state) => {
          const prev = state.words[wordId];
          if (!prev) return state;
          return {
            words: {
              ...state.words,
              [wordId]: { ...prev, dueAt: today, box: 1, streak: 0, status: 'learning' },
            },
          };
        });
      },
      isDoneToday: (today) => get().lastSessionDate === today,
      reset: () => set({
        words: {}, placementDone: false, placementAt: null, lastSessionDate: null,
        dailyNew: 6, dailyReview: 8, dailyCountsUpdatedAt: null,
      }),
    }),
    {
      name: 'ket-vocab-v1', // 实际按当前用户隔离为 ket-vocab-v1:<uid>
      storage: createJSONStorage(() => userScopedStorage),
    }
  )
);
