// ========== 错词 AI 助记卡片 ==========
// 对错次 >= 3 的难词，点一下用 LLM 生成一句中文联想助记，缓存复用。
// 数据源 = 词汇听写累计错次（useVocabStore.words[wordId].wrong），不进掌握判定。
import { useMemo, useState } from 'react';
import { allThemes } from '../data/vocabulary';
import { useVocabStore } from '../store/useVocabStore';
import { useMnemonicStore } from '../store/useMnemonicStore';
import {
  buildWordIndex,
  pickHardWords,
  MNEMONIC_MIN_WRONG,
  MNEMONIC_MAX_WORDS,
} from '../utils/mnemonic';
import { generateMnemonic } from '../utils/llm';
import { speakText } from '../utils/audio';

export default function MnemonicCard() {
  const words = useVocabStore((s) => s.words);
  const hints = useMnemonicStore((s) => s.hints);
  const setHint = useMnemonicStore((s) => s.setHint);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hardWords = useMemo(
    () => pickHardWords(words, buildWordIndex(allThemes)),
    [words]
  );
  // 真实难词总数（可能超过卡片展示上限，副标题用）
  const totalHard = useMemo(
    () => Object.values(words || {}).filter((p) => p && typeof p.wrong === 'number' && p.wrong >= MNEMONIC_MIN_WRONG).length,
    [words]
  );

  if (hardWords.length === 0) return null;

  const handleGenerate = async (wordId: string, word: { en: string; zh: string; phonetic?: string; example?: string }) => {
    if (loadingId) return;
    setLoadingId(wordId);
    setErrors((e) => ({ ...e, [wordId]: '' }));
    try {
      const res = await generateMnemonic(word);
      if (res.ok) setHint(wordId, res.hint);
      else setErrors((e) => ({ ...e, [wordId]: res.reason }));
    } catch (err) {
      setErrors((e) => ({ ...e, [wordId]: (err as Error).message || '生成失败，请重试' }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card mb-6 bg-gradient-to-br from-amber-50 to-white">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h3 className="text-base font-bold text-gray-800">🔑 难词助记</h3>
        <span className="text-xs text-gray-500">
          {totalHard} 个词错过 {MNEMONIC_MIN_WRONG}+ 次
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        这些词反复写错。点「生成助记」得到一句中文联想线索，只帮你记住它，不计入掌握判定。
        {totalHard > MNEMONIC_MAX_WORDS && ` 先显示错得最多的 ${MNEMONIC_MAX_WORDS} 个。`}
      </p>

      <div className="space-y-2">
        {hardWords.map(({ wordId, word, wrong }) => {
          const cached = hints[wordId]?.hint;
          const err = errors[wordId];
          const isLoading = loadingId === wordId;
          return (
            <div key={wordId} className="border border-amber-200 rounded-xl p-3 bg-white/70">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => speakText(word.en)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="朗读"
                  >
                    🔊
                  </button>
                  <span className="font-bold text-gray-800">{word.en}</span>
                  {word.phonetic && <span className="text-xs text-gray-400">/{word.phonetic}/</span>}
                  <span className="text-xs text-gray-500">{word.zh}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">
                  错 {wrong} 次
                </span>
              </div>

              {cached ? (
                <div className="mt-2 flex items-start justify-between gap-2">
                  <p className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2 flex-1">
                    💡 {cached}
                  </p>
                  <button
                    onClick={() => handleGenerate(wordId, word)}
                    disabled={!!loadingId}
                    className="text-xs text-gray-400 hover:text-amber-600 shrink-0 disabled:opacity-40"
                    title="重新生成"
                  >
                    🔄
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <button
                    onClick={() => handleGenerate(wordId, word)}
                    disabled={!!loadingId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '生成中…' : '✨ 生成助记'}
                  </button>
                  {err && <p className="text-xs text-red-500 mt-1.5">⚠️ {err}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        助记由 AI 临时生成，仅存在本机；换设备或清空后会重新生成，不影响学习进度。
      </p>
    </div>
  );
}
