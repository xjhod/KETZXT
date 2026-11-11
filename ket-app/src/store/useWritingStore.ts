// ========== 作文存档（本机，按账号分片）==========
// 作文是「不定期进行」的能力练习，不做每日打卡 / streak / 今日必做。
// 全文 + 规则批改报告 + 可选 AI 细评都存在这里，刷新不丢，可在「我的作文」复看与重写。
// ⚠️ 刻意不接 sync.ts / autoSync：本轮只落本机，不进云同步 payload，无需版本迁移。
//    后续要跨设备同步时，再把它加进 packPayload / mergePayload 并升 persist version。
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WritingReport } from '../data/writingGrader';
import type { LlmWritingResult } from '../utils/llm';
import userScopedStorage from './userScopedStorage';

export interface WritingEntry {
  id: string;
  promptId: string;
  kind: 'email' | 'story';
  promptText: string;
  requirement: string;
  minWords: number;
  /** 孩子写的全文（上一版只存词数与报告，全文刷新即丢） */
  text: string;
  report: WritingReport | null;
  llm: LlmWritingResult | null;
  createdAt: string;
  updatedAt: string;
}

interface WritingState {
  entries: Record<string, WritingEntry>;
  /** 每道题各自的未提交草稿，换题不丢 */
  drafts: Record<string, string>;
  /** 上次编辑的题目，用于刷新后回到那一题 */
  lastPromptId: string;
  saveDraft: (promptId: string, text: string) => void;
  addEntry: (e: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (id: string, text: string, report: WritingReport) => void;
  setLlm: (id: string, llm: LlmWritingResult) => void;
}

function newId(): string {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useWritingStore = create<WritingState>()(
  persist(
    (set) => ({
      entries: {},
      drafts: {},
      lastPromptId: '',

      saveDraft: (promptId, text) =>
        set((s) => ({
          drafts: { ...s.drafts, [promptId]: text },
          lastPromptId: promptId,
        })),

      addEntry: (e) => {
        const id = newId();
        const now = new Date().toISOString();
        set((s) => ({
          entries: { ...s.entries, [id]: { ...e, id, createdAt: now, updatedAt: now } },
        }));
        return id;
      },

      // 同一篇继续修改后重新批改：覆盖原文与报告，不生成重复档案；
      // AI 细评基于旧文本，必须清掉等孩子重新点一次 AI 批改。
      updateEntry: (id, text, report) =>
        set((s) => {
          const old = s.entries[id];
          if (!old) return s;
          return {
            entries: {
              ...s.entries,
              [id]: { ...old, text, report, llm: null, updatedAt: new Date().toISOString() },
            },
          };
        }),

      setLlm: (id, llm) =>
        set((s) => {
          const old = s.entries[id];
          if (!old) return s;
          return { entries: { ...s.entries, [id]: { ...old, llm } } };
        }),
    }),
    {
      name: 'ket-writing-v1', // 实际按当前用户隔离为 ket-writing-v1:<uid>
      storage: createJSONStorage(() => userScopedStorage),
      partialize: (s) => ({ entries: s.entries, drafts: s.drafts, lastPromptId: s.lastPromptId }),
    }
  )
);
