// ========== 作文独立页（一科一入口）==========
// 作文「不定期进行」：不做每日打卡、不做 streak、不做今日必做。
// 想写的时候进来 → 选题（可换）→ 写 → 规则批改 → 可选 AI 细评 → 存档 → 复看/重写。
// 复用 WRITING_PROMPTS 题库、writingGrader 规则批改、gradeWritingWithLLM 细评；
// 全文与批改报告存 useWritingStore（本机按账号分片，不进云同步）。
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WRITING_PROMPTS, type WritingPrompt } from '../data/dailyPlan';
import { gradeWriting, countWords, type WritingReport } from '../data/writingGrader';
import {
  fetchLlmStatus,
  gradeWritingWithLLM,
  type LlmStatus,
  type LlmWritingResult,
} from '../utils/llm';
import { useWritingStore, type WritingEntry } from '../store/useWritingStore';

const EMAIL = WRITING_PROMPTS.filter((p) => p.kind === 'email');
const STORY = WRITING_PROMPTS.filter((p) => p.kind === 'story');

function localTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function WritingPage() {
  const navigate = useNavigate();
  const entriesMap = useWritingStore((s) => s.entries);
  const drafts = useWritingStore((s) => s.drafts);
  const lastPromptId = useWritingStore((s) => s.lastPromptId);
  const saveDraft = useWritingStore((s) => s.saveDraft);
  const addEntry = useWritingStore((s) => s.addEntry);
  const updateEntry = useWritingStore((s) => s.updateEntry);
  const setLlm = useWritingStore((s) => s.setLlm);

  const initialId = WRITING_PROMPTS.find((p) => p.id === lastPromptId)?.id ?? EMAIL[0].id;
  const [promptId, setPromptId] = useState(initialId);
  const [text, setText] = useState(() => drafts[initialId] ?? '');
  const [report, setReport] = useState<WritingReport | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<'write' | 'archive'>('write');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [llmStatus, setLlmStatus] = useState<LlmStatus>({ available: false, llm: false, asr: false });
  const [llmResult, setLlmResult] = useState<LlmWritingResult | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchLlmStatus().then((s) => {
      if (alive) setLlmStatus(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const prompt = WRITING_PROMPTS.find((p) => p.id === promptId) ?? EMAIL[0];
  const list = prompt.kind === 'email' ? EMAIL : STORY;
  const entries = useMemo(
    () => Object.values(entriesMap).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [entriesMap]
  );
  const words = countWords(text);

  // 换题时自动恢复该题自己的草稿；未写过的题给空文本
  const resetFor = (p: WritingPrompt) => {
    const t = drafts[p.id] ?? '';
    setPromptId(p.id);
    setText(t);
    setReport(null);
    setCurrentId(null);
    setLlmResult(null);
    setLlmError('');
    saveDraft(p.id, t);
  };

  const changeKind = (kind: 'email' | 'story') => {
    if (prompt.kind === kind) return;
    const next = kind === 'email' ? EMAIL[0] : STORY[0];
    resetFor(next);
  };

  const nextPrompt = () => {
    const i = list.findIndex((p) => p.id === promptId);
    resetFor(list[(i + 1) % list.length]);
  };

  const onTextChange = (v: string) => {
    setText(v);
    saveDraft(promptId, v);
  };

  const submit = () => {
    if (!text.trim()) return;
    const r = gradeWriting(text, prompt.minWords, prompt.points);
    setReport(r);
    setLlmResult(null);
    setLlmError('');
    if (currentId) {
      // 同一篇继续修改后重新批改：覆盖，不生成重复档案
      updateEntry(currentId, text, r);
    } else {
      const id = addEntry({
        promptId: prompt.id,
        kind: prompt.kind,
        promptText: prompt.prompt,
        requirement: prompt.requirement,
        minWords: prompt.minWords,
        text,
        report: r,
        llm: null,
      });
      setCurrentId(id);
    }
  };

  const startNew = () => {
    saveDraft(prompt.id, '');
    setText('');
    setReport(null);
    setCurrentId(null);
    setLlmResult(null);
    setLlmError('');
  };

  const runLlm = async () => {
    if (!currentId || !report || !text.trim()) return;
    setLlmLoading(true);
    setLlmError('');
    try {
      const r = await gradeWritingWithLLM({
        text,
        prompt: prompt.prompt,
        requirement: prompt.requirement,
        kind: prompt.kind,
        minWords: prompt.minWords,
        pointsCovered: report.points.map((p) => ({ label: p.label, covered: p.covered })),
      });
      if (r) {
        setLlmResult(r);
        setLlm(currentId, r);
      } else {
        setLlmError('AI 批改暂时没有返回结果，本地规则批改仍然有效。');
      }
    } catch (e) {
      setLlmError(`AI 批改失败：${(e as Error).message}；本地规则批改仍然有效。`);
    } finally {
      setLlmLoading(false);
    }
  };

  const openFromArchive = (e: WritingEntry, keepText: boolean) => {
    const p = WRITING_PROMPTS.find((x) => x.id === e.promptId);
    if (!p) return;
    setPromptId(p.id);
    setText(keepText ? e.text : '');
    setReport(keepText ? e.report : null);
    setCurrentId(keepText ? e.id : null);
    setLlmResult(keepText ? e.llm : null);
    setLlmError('');
    saveDraft(p.id, keepText ? e.text : '');
    setView('write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabClass = (on: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      on ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="max-w-3xl mx-auto min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
        >
          ← 返回首页
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">✍️ 作文</h1>
      <p className="text-sm text-gray-500 mb-4 break-words">
        不定期进行 · 想写的时候来写一篇。写完自动存档，刷新不会丢；作文全文只存在本机，不上传云端。
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setView('write')} className={tabClass(view === 'write')}>写一篇</button>
        <button onClick={() => setView('archive')} className={tabClass(view === 'archive')}>
          我的作文（{entries.length}）
        </button>
      </div>

      {view === 'write' ? (
        <>
          {/* 选题：题型 + 换一题，模板默认收起，看不看由孩子决定 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm min-w-0">
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                onClick={() => changeKind('email')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  prompt.kind === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                邮件 · 25 词
              </button>
              <button
                onClick={() => changeKind('story')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  prompt.kind === 'story' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                短故事 · 35 词
              </button>
              <button
                onClick={nextPrompt}
                className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                换一题 →
              </button>
              <span className="text-xs text-gray-400 self-center">
                {list.findIndex((p) => p.id === promptId) + 1}/{list.length}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 break-words">{prompt.prompt}</p>
            <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded mt-2 break-words">
              要点：{prompt.requirement}
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                展开写作模板（看不看自己决定）
              </summary>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 whitespace-pre-line break-words">
                {prompt.template}
              </p>
            </details>
          </div>

          {/* 编辑区：输入即存草稿 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm min-w-0">
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              rows={8}
              placeholder="在这里写下你的作文…"
              className="w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
            <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
              <span className={`text-xs ${words >= prompt.minWords ? 'text-green-600' : 'text-gray-500'}`}>
                已写 {words} 词 / 要求 {prompt.minWords} 词
              </span>
              <div className="flex gap-2 flex-wrap">
                {currentId && (
                  <button
                    onClick={startNew}
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm transition-colors"
                  >
                    另写一篇
                  </button>
                )}
                <button
                  onClick={submit}
                  disabled={!text.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {currentId ? '重新批改这一篇' : '提交批改'}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">
              输入时自动存草稿；批改后可以继续修改再提交，不会重复生成档案。
            </p>
          </div>

          {/* 规则批改结果 */}
          {report && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <p className="text-sm font-bold text-gray-700">📝 本地批改</p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    report.passed
                      ? 'bg-green-100 text-green-700'
                      : report.pointsHit === report.pointsTotal
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  要点 {report.pointsHit}/{report.pointsTotal}（{report.pointsPercent}%）
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2 break-words">{report.summary}</p>

              <div className="space-y-1 mb-2">
                {report.points.map((pt) => (
                  <div key={pt.label} className="flex items-start gap-1.5 text-xs min-w-0">
                    <span className={pt.covered ? 'text-green-600' : 'text-orange-500'}>
                      {pt.covered ? '✅' : '❌'}
                    </span>
                    <span className={`break-words min-w-0 ${pt.covered ? 'text-gray-600' : 'text-orange-700'}`}>
                      {pt.label}
                      {pt.covered && pt.hitKeywords.length > 0 && (
                        <span className="text-gray-400">（写到了 {pt.hitKeywords.join(' / ')}）</span>
                      )}
                      {!pt.covered && <span className="text-orange-500"> —— {pt.hint}</span>}
                    </span>
                  </div>
                ))}
              </div>

              {report.grammarIssues.length > 0 && (
                <details className="mb-2">
                  <summary className="cursor-pointer text-xs text-amber-700 hover:underline">
                    ⚠️ 有 {report.grammarIssues.length} 处可能要检查一下（只提示，不判错）
                  </summary>
                  <div className="mt-1.5 space-y-1">
                    {report.grammarIssues.map((g, i) => (
                      <div key={i} className="text-xs bg-amber-50 border border-amber-100 rounded p-1.5 break-words">
                        <p className="text-gray-700">
                          <span className="font-medium">{g.fragment}</span> —— {g.message}
                        </p>
                        <p className="text-gray-500 mt-0.5">💡 {g.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* AI 深度批改：可选增强，不可用不影响规则批改 */}
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                {!llmResult && (
                  <button
                    onClick={() => void runLlm()}
                    disabled={llmLoading || !llmStatus.available}
                    className="w-full text-xs py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {llmLoading
                      ? '🤖 AI 批改中…'
                      : llmStatus.available
                        ? '🤖 让 AI 再批一次（内容 / 语言 / 改进建议）'
                        : '🤖 AI 批改暂不可用（已用本地规则批改）'}
                  </button>
                )}
                {llmStatus.reason && !llmStatus.available && (
                  <p className="text-[11px] text-gray-400 mt-1 break-words">原因：{llmStatus.reason}</p>
                )}
                {llmError && <p className="text-xs text-orange-600 mt-1 break-words">{llmError}</p>}

                {llmResult && (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs font-bold text-purple-700">🤖 AI 深度批改</p>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-blue-600">内容 {llmResult.contentScore}</span>
                        <span className="text-[11px] font-bold text-green-600">语言 {llmResult.languageScore}</span>
                        <span className="text-[11px] font-bold text-purple-600">综合 {llmResult.overallScore}</span>
                      </div>
                    </div>
                    {llmResult.contentComments.length > 0 && (
                      <div className="text-xs bg-blue-50 border border-blue-100 rounded p-2 break-words">
                        <p className="font-medium text-blue-800 mb-1">内容点评</p>
                        {llmResult.contentComments.map((c, i) => (
                          <p key={i} className="text-gray-700 mt-0.5">· {c}</p>
                        ))}
                      </div>
                    )}
                    {llmResult.languageComments.length > 0 && (
                      <div className="text-xs bg-green-50 border border-green-100 rounded p-2 break-words">
                        <p className="font-medium text-green-800 mb-1">语言点评</p>
                        {llmResult.languageComments.map((c, i) => (
                          <p key={i} className="text-gray-700 mt-0.5">· {c}</p>
                        ))}
                      </div>
                    )}
                    {llmResult.suggestions.length > 0 && (
                      <div className="text-xs bg-purple-50 border border-purple-100 rounded p-2 break-words">
                        <p className="font-medium text-purple-800 mb-1">💡 改进建议</p>
                        {llmResult.suggestions.map((s, i) => (
                          <p key={i} className="text-gray-700 mt-0.5">{i + 1}. {s}</p>
                        ))}
                      </div>
                    )}
                    {llmResult.betterVersion && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-purple-700 hover:underline">
                          查看参考改写（同样内容，写得更好）
                        </summary>
                        <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 mt-1 whitespace-pre-line break-words">
                          {llmResult.betterVersion}
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* 我的作文：复看全文 + 接着修改 / 清空重写 */
        <div className="min-w-0">
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400 shadow-sm">
              还没有存档。去「写一篇」，提交批改后就会出现在这里。
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">
                        {localTime(e.updatedAt)} · {e.kind === 'email' ? '邮件' : '短故事'} · {countWords(e.text)} 词
                      </p>
                      <p className="text-sm text-gray-700 mt-1 break-words">{e.promptText}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        要点 {e.report?.pointsHit ?? 0}/{e.report?.pointsTotal ?? 3}
                        {e.llm ? ' · 已做 AI 批改' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors"
                    >
                      {expandedId === e.id ? '收起' : '展开'}
                    </button>
                  </div>
                  {expandedId === e.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 min-w-0">
                      <p className="text-sm text-gray-800 whitespace-pre-line break-words">{e.text}</p>
                      {e.report && (
                        <p className="text-xs text-gray-500 mt-2 break-words">批改：{e.report.summary}</p>
                      )}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button
                          onClick={() => openFromArchive(e, true)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs transition-colors"
                        >
                          接着修改
                        </button>
                        <button
                          onClick={() => openFromArchive(e, false)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors"
                        >
                          再写这一题（清空）
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
