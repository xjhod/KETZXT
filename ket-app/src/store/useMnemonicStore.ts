// ========== 错词 AI 助记缓存（本机，按账号分片）==========
// 只存「wordId -> 中文助记句」，生成一次后复用，避免每次进词汇页都调 LLM。
// ⚠️ 刻意不接 sync.ts：助记是可重生的本地线索（换设备会重新生成），
//    不进云同步 payload，也不需要版本迁移。清空后点一下即可再生成。
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import userScopedStorage from './userScopedStorage';

export interface MnemonicCacheEntry {
  hint: string;
  generatedAt: string;
}

interface MnemonicState {
  hints: Record<string, MnemonicCacheEntry>;
  setHint: (wordId: string, hint: string) => void;
  removeHint: (wordId: string) => void;
  clearAll: () => void;
}

export const useMnemonicStore = create<MnemonicState>()(
  persist(
    (set) => ({
      hints: {},
      setHint: (wordId, hint) =>
        set((s) => ({
          hints: { ...s.hints, [wordId]: { hint, generatedAt: new Date().toISOString() } },
        })),
      removeHint: (wordId) =>
        set((s) => {
          const next = { ...s.hints };
          delete next[wordId];
          return { hints: next };
        }),
      clearAll: () => set({ hints: {} }),
    }),
    {
      name: 'ket-mnemonic-v1', // 实际按当前用户隔离为 ket-mnemonic-v1:<uid>
      storage: createJSONStorage(() => userScopedStorage),
      partialize: (s) => ({ hints: s.hints }),
    }
  )
);
