import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ========================
// 数据类型定义
// ========================

export type ModuleType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking';
export type ExerciseType =
  | 'spelling'       // 词汇拼写
  | 'matching'       // 词汇匹配
  | 'fill_blank'     // 词汇填空
  | 'flashcard'      // 词汇卡片
  | 'grammar_fill'   // 语法填空
  | 'grammar_choice' // 语法选择
  | 'grammar_correction' // 语法改错
  | 'reading_p1'     // 阅读Part1
  | 'reading_p2'     // 阅读Part2
  | 'reading_p3'     // 阅读Part3
  | 'reading_p4'     // 阅读Part4
  | 'speaking_p1'    // 口语Part1
  | 'speaking_p2'    // 口语Part2
  | string;

// 单次答题记录
export interface AnswerRecord {
  id: string;           // 唯一ID（时间戳+随机数）
  module: ModuleType;
  exerciseType: ExerciseType;
  subjectId: string;    // 所属主题/语法点/文章 ID
  subjectName: string;  // 所属主题/语法点名称（中文）
  questionId: string;
  questionText: string; // 题目摘要（用于错题展示）
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredAt: string;   // ISO 时间戳
}

// 一次完整练习的会话记录
export interface SessionRecord {
  id: string;
  module: ModuleType;
  exerciseType: ExerciseType;
  subjectId: string;
  subjectName: string;
  correct: number;
  total: number;
  duration: number;     // 秒数
  completedAt: string;  // ISO 时间戳
}

// 学习统计（聚合数据，按需计算）
export interface ModuleStats {
  totalQuestions: number;
  correctQuestions: number;
  totalSessions: number;
  lastPracticed: string | null;
}

// ========================
// Store 接口
// ========================

interface ProgressStore {
  // 答题记录（保留最新 1000 条）
  answerRecords: AnswerRecord[];
  // 会话记录（保留最新 200 条）
  sessionRecords: SessionRecord[];

  // Actions
  /** 记录单题答案 */
  recordAnswer: (record: Omit<AnswerRecord, 'id' | 'answeredAt'>) => void;
  /** 记录完整会话 */
  recordSession: (record: Omit<SessionRecord, 'id' | 'completedAt'>) => void;
  /** 获取错题列表（可按模块筛选） */
  getWrongAnswers: (module?: ModuleType) => AnswerRecord[];
  /** 获取某模块统计 */
  getModuleStats: (module: ModuleType) => ModuleStats;
  /** 清除错题本中已掌握的题（答对了就从错题中移除） */
  removeFromWrong: (questionId: string, subjectId: string) => void;
  /** 检查某道题是否最近连续答对3次（用于自动从错题本移除） */
  hasConsecutiveCorrect: (subjectId: string, questionId: string) => boolean;
  /** 清空全部数据（重置） */
  reset: () => void;
}

// ========================
// Store 实现
// ========================

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      answerRecords: [],
      sessionRecords: [],

      recordAnswer: (record) => {
        const newRecord: AnswerRecord = {
          ...record,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          answeredAt: new Date().toISOString(),
        };
        set((state) => {
          const records = [newRecord, ...state.answerRecords];
          // 保留最新 1000 条
          return { answerRecords: records.slice(0, 1000) };
        });
      },

      recordSession: (record) => {
        const newSession: SessionRecord = {
          ...record,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          completedAt: new Date().toISOString(),
        };
        set((state) => {
          const sessions = [newSession, ...state.sessionRecords];
          return { sessionRecords: sessions.slice(0, 200) };
        });
      },

      getWrongAnswers: (module) => {
        const { answerRecords } = get();

        // 先找出所有答错的题的 (questionId, subjectId) 键
        const wrongKeys = new Set<string>();
        const correctKeys = new Set<string>();

        // 按时间从旧到新排序，后面的状态覆盖前面的
        const sorted = [...answerRecords].reverse();
        for (const r of sorted) {
          const key = `${r.subjectId}::${r.questionId}`;
          if (r.isCorrect) {
            correctKeys.add(key);
          } else {
            wrongKeys.add(key);
          }
        }

        // 最终错题 = 在 wrongKeys 中但不在 correctKeys 中（即最后一次作答是错的）
        // 但实际上应该保留历史错误记录，所以改为：找每道题最近一次答错的记录
        const latestWrongMap = new Map<string, AnswerRecord>();
        for (const r of answerRecords) {
          // answerRecords 已经是从新到旧排序
          const key = `${r.subjectId}::${r.questionId}`;
          if (!r.isCorrect && !latestWrongMap.has(key)) {
            // 还没有这道题的错误记录，且最近一次是答错的
            // 检查是否有更新的答对记录
            if (!correctKeys.has(key)) {
              latestWrongMap.set(key, r);
            }
          }
        }

        // 重新计算：找每道题的最新一次记录
        const latestMap = new Map<string, AnswerRecord>();
        for (const r of answerRecords) {
          const key = `${r.subjectId}::${r.questionId}`;
          if (!latestMap.has(key)) {
            latestMap.set(key, r);
          }
        }

        // 最新一次答错的题就是错题
        const wrongList = [...latestMap.values()].filter((r) => !r.isCorrect);

        if (module) {
          return wrongList.filter((r) => r.module === module);
        }
        return wrongList.sort(
          (a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()
        );
      },

      getModuleStats: (module) => {
        const { answerRecords, sessionRecords } = get();
        const filtered = answerRecords.filter((r) => r.module === module);
        const sessions = sessionRecords.filter((s) => s.module === module);

        const lastRecord = filtered[0]; // 最新记录在最前

        return {
          totalQuestions: filtered.length,
          correctQuestions: filtered.filter((r) => r.isCorrect).length,
          totalSessions: sessions.length,
          lastPracticed: lastRecord ? lastRecord.answeredAt : null,
        };
      },

      removeFromWrong: (questionId, subjectId) => {
        // 不删除历史记录，而是插入一条"正确"记录来覆盖错题状态
        // 实际上 getWrongAnswers 已经基于最新答题状态来判断，无需特殊处理
        // 此函数可在未来用于手动标记已掌握
        set((state) => ({
          answerRecords: state.answerRecords.filter(
            (r) => !(r.questionId === questionId && r.subjectId === subjectId && !r.isCorrect)
          ),
        }));
      },

      hasConsecutiveCorrect: (subjectId, questionId) => {
        const { answerRecords } = get();
        // 获取该题所有答题记录（最新的在前面）
        const records = answerRecords.filter(
          (r) => r.subjectId === subjectId && r.questionId === questionId
        );
        
        // 从最新开始检查，统计连续答对的次数
        let consecutiveCorrect = 0;
        for (const r of records) {
          if (r.isCorrect) {
            consecutiveCorrect++;
            if (consecutiveCorrect >= 3) {
              return true; // 连续答对3次，已掌握
            }
          } else {
            break; // 遇到错题，连续中断
          }
        }
        return false;
      },

      reset: () => set({ answerRecords: [], sessionRecords: [] }),
    }),
    {
      name: 'ket-progress-v1', // localStorage key
    }
  )
);
