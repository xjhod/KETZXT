// ========== 今日词汇：入场测 → 复习 → 分流首学 → 主题语境段 → 结算 ==========
//
// 教学口径（2026-11-07 定稿，审查后修正版）：
//   · A 单音节规则词：听音分块 + 字母块反查（编码桥），不做 IPA 硬对齐
//   · B 多音节派生词：词素块 + 同源词提示，音标只作参考层
//   · C 不规则/强弱读：整体音 + 例句语境，明说「这个拼法要单独记」
//   · 听写是唯一掌握证据；选词义、跟读、拼图都不进判定
//   · 听写作答时屏幕不得出现可拼出整个词的字母块（2026-11-09 修正照抄漏洞）
//   · IPA 不朗读符号、不做考点；ASR 跟读不参与判定
//   · 错词先「再听一遍 → 遮形回想 → 自己写」，实在想不起来才显示答案照打
//     （重打一律不写记忆盒子）
//   · 结算只报正确率/升降盒/明日待复习，不发经验值、不报连胜
//
// 2026-11-07 第二轮：首学改成单个词的 5 步顺序
//   1 只听不看（含 0.75 倍速）→ 2 数拍/辨首音 → 3 露形配块 → 4 挂上意义 → 5 整词听写
//   模块层（按主题排队、A/B/C 分流、Leitner 调度、判定口径）一律不动。
//   慢速复用现有整词 mp3 的 playbackRate，不新增任何音频/图片/词库字段。
import { useMemo, useRef, useState, useEffect, type RefObject } from 'react';
import { allThemes } from '../data/vocabulary';
import type { PlacementChoice, VocabWordProgress, Word } from '../types';
import { useVocabStore, todayString, addDays } from '../store/useVocabStore';
import { useProgressStore } from '../store/useProgressStore';
import {
  buildPlacementSample,
  buildTodayQueue,
  buildPassage,
  buildMeaningOptions,
  isDictationCorrect,
  DAILY_NEW_OPTIONS,
  DAILY_REVIEW_OPTIONS,
  ONSET_CANDIDATE_FORMS,
  type VocabQueueItem,
  type VocabTodayQueue,
} from '../utils/vocabSession';
import { buildCListeningDrill, phonicsHints, type PhonicsHint } from '../utils/wordChunks';
import { audioFileUrl, playAudioEl, speakText, ttsFallbackAllowed } from '../utils/audio';

type Phase = 'placement' | 'overview' | 'review' | 'learn' | 'passage' | 'result';

interface SessionStats {
  correct: number;
  total: number;
  up: number;
  down: number;
  mastered: number;
}

const EMPTY_STATS: SessionStats = { correct: 0, total: 0, up: 0, down: 0, mastered: 0 };

/** 播放整词音频；没有 mp3 时走本地 TTS 兜底。rate < 1 即「再慢一点」 */
async function playWord(word: Word, rate = 1): Promise<void> {
  const ok = await playAudioEl(audioFileUrl(word.id), rate);
  if (!ok && ttsFallbackAllowed()) speakText(word.en, { rate: rate < 1 ? 0.6 : 0.85 });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========== 通用小部件 ==========

function PlayButton({ word, label = '🔊 听整词' }: { word: Word; label?: string }) {
  return (
    <button
      onClick={() => { void playWord(word); }}
      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm hover:bg-blue-100"
    >
      {label}
    </button>
  );
}

/** 复用同一条整词 mp3，只改 playbackRate；不新增音频素材 */
function SlowPlayButton({ word, label = '再慢一点' }: { word: Word; label?: string }) {
  return (
    <button
      onClick={() => { void playWord(word, 0.75); }}
      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm hover:border-blue-400"
    >
      {label}
    </button>
  );
}

/** 音标只作可点参考层：点一下播标准读音，不朗读符号、不出题 */
function IpaRef({ word }: { word: Word }) {
  if (!word.phonetic) return null;
  return (
    <button
      onClick={() => { void playWord(word); }}
      title="点一下听标准读音（音标只是参考，不用背符号）"
      className="text-sm text-gray-500 font-mono hover:text-blue-600 underline decoration-dotted"
    >
      {word.phonetic}
    </button>
  );
}

const LEARN_STEPS = ['只听不看', '数拍辨音', '露形配块', '挂上意义', '整词听写'];

function LearnStepDots({ current }: { current: number }) {
  return (
    <div className="mb-3 min-w-0">
      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-1.5 min-w-0">
        <span className="shrink-0">第 {current} / 5 步 · {LEARN_STEPS[current - 1]}</span>
        {/* 五步全名在手机上会把这一行撑出屏幕，只在 ≥640px 显示 */}
        <span className="hidden sm:inline text-gray-400 truncate">{LEARN_STEPS.join(' → ')}</span>
      </div>
      <div className="flex gap-1.5">
        {LEARN_STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i + 1 <= current ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

/** 拼读规则卡：只给 A/B 类，C 类无卡片；核对读音复用同一条整词 mp3 */
function RuleCards({ hints, word }: { hints: PhonicsHint[]; word: Word }) {
  if (hints.length === 0) return null;
  return (
    <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
      <p className="text-sm font-medium text-gray-700 mb-2">
        {hints[0].kind === 'sound' ? '先看一条拼读规律' : '先看这个词的结构'}
      </p>
      <div className="space-y-2">
        {hints.map((h) => (
          <div key={h.chunk} className="flex items-start gap-2 bg-white/80 rounded-lg px-3 py-2 min-w-0">
            <span className="font-mono text-sm font-semibold text-emerald-800 shrink-0">{h.chunk}</span>
            <span className="text-xs text-gray-600 leading-relaxed min-w-0 break-words">{h.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-2"><PlayButton word={word} label="🔊 听整词核对" /></div>
      <p className="text-xs text-gray-400 mt-2">规律只是提示，有例外；听写写对才算记住。</p>
    </div>
  );
}

/**
 * 复习提示（2026-11-09 修正）：听写是唯一掌握证据，首次作答时屏幕上
 * 不允许出现可以拼出整个单词的字母块。旧版把 analysis.chunks 按顺序全摆出来
 * （north → n | or | th），孩子照着抄就能过，检查形同虚设。
 * 现在：低盒默认不给字形，主动点「需要一点提示」也只给首字母 + 字母数；
 * 中盒只给音标参考；高盒什么都不给。错词回想阶段本就不渲染本组件。
 */
function HintPanel({ item }: { item: VocabQueueItem }) {
  const { hintLevel, word } = item;
  const [showHint, setShowHint] = useState(false);

  if (hintLevel === 3) {
    return <p className="text-xs text-gray-400 mt-2">这一盒不给任何提示：听完整个词，自己在脑子里分块再写。</p>;
  }
  if (hintLevel === 2) {
    return (
      <div className="mt-2 flex items-center gap-2 flex-wrap min-w-0">
        <IpaRef word={word} />
        <span className="text-xs text-gray-400">只给音标核对读音，不给字母；不照着音标拼</span>
      </div>
    );
  }

  const letters = word.en.replace(/[^A-Za-z]/g, '');
  const first = letters[0] ?? '';
  const rest = Math.min(Math.max(letters.length - 1, 0), 12);
  const isPhrase = /\s/.test(word.en.trim());
  return (
    <div className="mt-2 min-w-0">
      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          需要一点提示？
        </button>
      ) : (
        <div className="p-3 bg-blue-50 rounded-xl">
          <p className="font-mono text-base tracking-wider text-blue-800 break-all">
            {first}{'_'.repeat(rest)}
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {isPhrase ? '这是个短语，' : ''}开头是 <span className="font-mono font-semibold">{first}</span>，
            一共 {letters.length} 个字母。这里不给剩下的字母，靠听音自己想出来。
          </p>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-1">
        这一盒不会把整个单词摆出来：先听、再自己写，实在想不起来才点提示。
      </p>
    </div>
  );
}

/**
 * 听写输入行（2026-11-09 修正窄屏溢出）：
 * 旧版是 input(flex-1) + 检查 + 第三个播放按钮三列，input 缺 min-w-0，
 * 浏览器给 input 的固有最小宽度把整行撑出手机屏幕，右侧按钮被裁掉。
 * 现在只留两列：input 可收缩、检查按钮不收缩；音频统一用上方已有的
 * 「听整词 / 再慢一点」，不再重复放第三个按钮。
 */
function DictationInput({
  onSubmit, placeholder = '听一遍，把整个单词写出来',
}: { onSubmit: (text: string) => void; placeholder?: string }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(text); }}
      className="mt-4 flex gap-2 min-w-0"
    >
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-3 text-base sm:px-4 sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button type="submit" className="btn-primary shrink-0 whitespace-nowrap" disabled={!text.trim()}>检查</button>
    </form>
  );
}

// ========== A 类：字母块反查拼图（从听到的音找回字形）==========

function ChunkPuzzle({ item }: { item: VocabQueueItem }) {
  const [order] = useState(() => shuffle(item.analysis.chunks.map((c, i) => ({ ...c, key: i }))));
  const [picked, setPicked] = useState<number[]>([]);
  const pickedText = picked.map((i) => order[i].text).join('');
  const done = picked.length === order.length && pickedText === item.word.en;
  const wrongShape = picked.length === order.length && !done;

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-xl">
      <p className="text-sm font-medium text-gray-700 mb-2">听一听，把字母块按听到的顺序排成整个词</p>
      <div className="min-h-[42px] flex flex-wrap gap-1.5 mb-2">
        {picked.map((idx, pos) => (
          <button
            key={`p-${pos}`}
            onClick={() => setPicked((p) => p.filter((_, k) => k !== pos))}
            className="px-2 py-1 bg-white border border-blue-300 rounded-lg font-mono text-sm"
          >
            {order[idx].text}
          </button>
        ))}
        {picked.length === 0 && <span className="text-xs text-gray-400">点下面的字母块开始拼</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {order.map((c, idx) => (
          <button
            key={c.key}
            disabled={picked.includes(idx)}
            onClick={() => setPicked((p) => [...p, idx])}
            className={`px-2 py-1 rounded-lg font-mono text-sm ${
              picked.includes(idx) ? 'bg-gray-100 text-gray-300' : 'bg-white border border-gray-200 hover:border-blue-400'
            }`}
          >
            {c.text}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {done && <span className="text-xs text-green-600 font-medium">✓ 拼对了，这就是这个词的字形</span>}
        {wrongShape && <span className="text-xs text-amber-600">顺序还不对，再听一遍试试</span>}
        <button onClick={() => setPicked([])} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">重来</button>
        <PlayButton word={item.word} label="🔊 再听" />
      </div>
    </div>
  );
}

// ========== 单个新词的 5 步首学（第 1~4 步；第 5 步是听写）==========
//
// 顺序纪律：先只靠耳朵，再看词形，再挂意义，最后才默写。
// 数拍/重音只给参考值不判对错；首音是唯一判对错的一题，答错可再听重选。
// 听写仍然是唯一掌握证据，这里所有练习都不进记忆盒子。

function LearnFlow({
  item, step, onStep, onGo,
}: {
  item: VocabQueueItem;
  step: number;
  onStep: (n: number) => void;
  onGo: () => void;
}) {
  const { analysis, word, relatives } = item;
  // C 类已有 drill；A/B 类在 UI 层派生，不改数据层
  const drill = useMemo(
    () => item.drill ?? buildCListeningDrill(item.word, ONSET_CANDIDATE_FORMS),
    [item.drill, item.word]
  );
  const [hidden, setHidden] = useState(false);
  const [beat, setBeat] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [onset, setOnset] = useState<string | null>(null);
  const [meaningHidden, setMeaningHidden] = useState(false);
  const [meaningChoice, setMeaningChoice] = useState<string | null>(null);
  const meaningOptions = useMemo(() => buildMeaningOptions(item), [item]);

  const withBeats = analysis.route === 'C';
  const hasStress = withBeats && drill.stressReference !== null;
  const onsetOk = onset === drill.onsetAnswer;
  const step2Total = withBeats ? (hasStress ? 3 : 2) : 1;
  const step2Done =
    (withBeats && beat !== null ? 1 : 0) +
    (withBeats && hasStress && stress !== null ? 1 : 0) +
    (onsetOk ? 1 : 0);
  const step2Ready = step2Done === step2Total;

  const opt = (active: boolean) =>
    `px-3 py-1.5 rounded-lg font-mono text-sm border ${
      active
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
    }`;

  const nav = (next: number, label = '下一步 →') => (
    <div className="flex items-center gap-3 mt-5">
      {step > 1 && (
        <button onClick={() => onStep(step - 1)} className="text-sm text-gray-500 hover:text-blue-600">← 上一步</button>
      )}
      <button onClick={() => onStep(next)} className="btn-primary ml-auto">{label}</button>
    </div>
  );

  // ---- 第 1 步：只听不看 ----
  if (step === 1) {
    return (
      <div className="card">
        <p className="text-xs text-gray-400 mb-1">第 1 步 · 只靠耳朵</p>
        <h3 className="text-lg font-bold text-gray-800 mb-1">先听发音，不看词形</h3>
        <p className="text-sm text-gray-600 mb-4">听两遍，猜猜它由几个音组成。屏幕上先不出现这个单词。</p>
        <div className="p-6 bg-blue-50 rounded-2xl flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <PlayButton word={word} label="🔊 听整词" />
            <SlowPlayButton word={word} />
          </div>
          <p className="text-xs text-gray-500">听不清就多点几次，慢速还是同一条录音。</p>
        </div>
        <p className="text-xs text-gray-400 mt-3">先靠耳朵把词听成几段，下一步再动笔。</p>
        {nav(2, '听过了，下一步 →')}
      </div>
    );
  }

  // ---- 第 2 步：数拍 / 辨首音（A/B 单音节只保留首音）----
  if (step === 2) {
    return (
      <div className="card">
        <p className="text-xs text-gray-400 mb-1">第 2 步 · 听音分段</p>
        <h3 className="text-lg font-bold text-gray-800 mb-1">把刚才听到的音拆开看看</h3>
        <p className="text-xs text-gray-500 mb-4">
          {withBeats
            ? '先做几个只用耳朵的小练习，把长词听成几段。不用背音标符号。'
            : '这个词不长，重点听清最开头是哪个字母（组合）。'}
        </p>

        {withBeats && (
          <>
            <div className="p-3 bg-indigo-50 rounded-xl mb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-700">① 听一听，这个词大概有几拍？</p>
                <div className="flex gap-1"><PlayButton word={word} label="🔊" /><SlowPlayButton word={word} label="慢" /></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {drill.beatOptions.map((n) => (
                  <button key={n} onClick={() => setBeat(n)} className={opt(beat === n)}>{n} 拍</button>
                ))}
              </div>
              {beat !== null && (
                <p className="text-xs text-gray-600 mt-2">
                  参考：约 {drill.beatReference} 拍。
                  {beat === drill.beatReference ? ' 数得差不多。' : ' 不一样也没关系，再听一遍跟着读一读。'}
                  <span className="text-gray-400"> 这一步只帮你把词听分段，不算对错。</span>
                </p>
              )}
            </div>

            {hasStress ? (
              <div className="p-3 bg-indigo-50 rounded-xl mb-3">
                <p className="text-sm font-medium text-gray-700">② 哪一拍读得最重？</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {drill.stressOptions.map((n) => (
                    <button key={n} onClick={() => setStress(n)} className={opt(stress === n)}>第 {n} 拍</button>
                  ))}
                </div>
                {stress !== null && (
                  <p className="text-xs text-gray-600 mt-2">
                    参考：重音大约在第 {drill.stressReference} 拍。点播放再核对一次，读的时候把这一拍加重。
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl mb-3">
                <p className="text-xs text-gray-500">② 这个词的重音不明显，重点听整词就好。</p>
              </div>
            )}
          </>
        )}

        <div className="p-3 bg-amber-50 rounded-xl">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-700">{withBeats ? '③' : '①'} 开头是哪个字母（组合）？</p>
            <div className="flex gap-1"><PlayButton word={word} label="🔊" /><SlowPlayButton word={word} label="慢" /></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {drill.onsetOptions.map((o) => (
              <button
                key={o}
                onClick={() => setOnset(o)}
                disabled={onsetOk}
                className={opt(onset === o)}
              >
                {o}
              </button>
            ))}
          </div>
          {onsetOk && (
            <p className="text-xs text-green-600 mt-2">✓ 开头是 {drill.onsetAnswer}，写的时候先写下这一块。</p>
          )}
          {onset && !onsetOk && (
            <p className="text-xs text-amber-700 mt-2">再听一遍最开头，换一个试试。这一题可以重选，不扣分。</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-5">
          <button onClick={() => onStep(1)} className="text-sm text-gray-500 hover:text-blue-600">← 上一步</button>
          <button
            onClick={() => onStep(3)}
            disabled={!step2Ready}
            className={`btn-primary ml-auto ${step2Ready ? '' : 'opacity-40 cursor-not-allowed'}`}
          >
            {step2Ready ? '下一步，看词形 →' : `完成 ${step2Done}/${step2Total} 个小练习`}
          </button>
          <button onClick={() => onStep(3)} className="text-xs text-gray-400 hover:text-gray-600">跳过练习</button>
        </div>
      </div>
    );
  }

  // ---- 第 3 步：露形配块（按路由分流，这一步才第一次出现词形）----
  if (step === 3) {
    const badge = { A: '听音分块', B: '词素与词族', C: '整体记忆' }[analysis.route];
    const hints = phonicsHints(analysis);
    return (
      <div className="card">
        <p className="text-xs text-gray-400 mb-1">第 3 步 · 露形配块</p>
        <h3 className="text-lg font-bold text-gray-800 mb-3">现在看它长什么样</h3>

        <div className="flex items-baseline gap-3 flex-wrap min-w-0">
          <h4 className="text-3xl font-bold text-gray-800 font-mono break-all min-w-0">
            {hidden ? '•'.repeat(Math.min(10, word.en.length)) : word.en}
          </h4>
          {!hidden && <IpaRef word={word} />}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <PlayButton word={word} />
          <SlowPlayButton word={word} />
          <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">{badge}</span>
        </div>

        <RuleCards hints={hints} word={word} />

        {analysis.route === 'A' && (
          <>
            <p className="text-sm text-gray-600 mt-4">{analysis.note}</p>
            <ChunkPuzzle item={item} />
          </>
        )}

        {analysis.route === 'B' && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-2">这个词可以这样拆（词素切分自动给出，仅供参考）</p>
            <div className="flex flex-wrap items-center gap-2">
              {analysis.chunks.map((c, i) => (
                <span
                  key={`${c.text}-${i}`}
                  className={`px-3 py-1.5 rounded-lg font-mono text-base ${
                    c.kind === 'stem' ? 'bg-white border border-amber-300 font-semibold' : 'bg-white/70 border border-amber-200'
                  }`}
                >
                  {c.text}
                </span>
              ))}
            </div>
            {analysis.stressedChunk && (
              <p className="text-xs text-gray-500 mt-2">重音大约在第 {analysis.stressedChunk} 个音节，点播放核对一下。</p>
            )}
            {relatives.length > 0 ? (
              <p className="text-xs text-gray-600 mt-2">
                同源词：{relatives.map((r) => r.en).join(' · ')}。弱读的元音靠词族记拼写，不靠音标推。
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                词库里没找到同源词，这组词素只当参考；这个拼法主要靠听写记住。
              </p>
            )}
          </div>
        )}

        {analysis.route === 'C' && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">这个拼法要单独记</p>
              <p className="text-xs text-gray-500 mt-1">音和形对不上的词（弱读、不发音字母、固定搭配），别硬按音推，所以这一步不给拼读规则。先听整词、把长词听成几段，再凭记忆写。</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">记字形：分成 {drill.recallSegments.length} 段来记</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {drill.recallSegments.map((s, i) => (
                  <span key={`${s}-${i}`} className="px-2 py-1 bg-white border border-blue-200 rounded-lg font-mono text-sm">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">只是按长度把字母分段帮记忆，不代表读音或音节。</p>
              <button onClick={() => setHidden((h) => !h)} className="mt-2 text-xs text-blue-700 underline decoration-dotted">
                {hidden ? '再显示单词' : '遮住单词，自己回想一遍'}
              </button>
              {hidden && <span className="text-xs text-gray-500 ml-2">已在上方遮住词形，想好再点开。</span>}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">{analysis.note}</p>
        {nav(4, '下一步，看意思 →')}
      </div>
    );
  }

  // ---- 第 4 步：挂上意义（真实例句，零编造）----
  return (
    <div className="card">
      <p className="text-xs text-gray-400 mb-1">第 4 步 · 挂上意义</p>
      <h3 className="text-lg font-bold text-gray-800 mb-3">这个词是什么意思，怎么用</h3>

      <div className="flex items-baseline gap-3 flex-wrap min-w-0">
        <span className="text-2xl font-semibold text-gray-800 font-mono break-all min-w-0">{word.en}</span>
        <span className="text-lg text-gray-600">{meaningHidden ? '••••' : word.zh}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <PlayButton word={word} />
        <SlowPlayButton word={word} />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
        <p className="text-sm text-gray-700">{word.example}</p>
        <p className="text-xs text-gray-500 mt-1">{word.exampleZh}</p>
        <button
          onClick={() => speakText(word.example, { rate: 0.85 })}
          className="mt-2 text-xs px-2 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 hover:border-blue-400"
        >
          🔊 读句子
        </button>
      </div>

      {meaningOptions.length >= 2 && (
        <div className="mt-4 p-3 bg-amber-50 rounded-xl">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-700">再认一次：这个词是什么意思？</p>
            <button
              onClick={() => { setMeaningHidden((h) => !h); setMeaningChoice(null); }}
              className="text-xs px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 hover:border-amber-400"
            >
              {meaningHidden ? '显示释义' : '遮住释义再选'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {meaningOptions.map((o) => (
              <button
                key={o}
                onClick={() => setMeaningChoice(o)}
                disabled={meaningChoice === word.zh}
                className={`px-3 py-2 rounded-lg text-sm text-left border ${
                  meaningChoice === o
                    ? o === word.zh
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-amber-200 text-amber-900 border-amber-400'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          {meaningChoice === word.zh && (
            <p className="text-xs text-green-600 mt-2">✓ 选对了。这一步不算分，只是把意思和词形再连一次。</p>
          )}
          {meaningChoice && meaningChoice !== word.zh && (
            <p className="text-xs text-amber-700 mt-2">再看一眼词形和例句，换一个试试。这一题可以重选，不扣分。</p>
          )}
          <p className="text-xs text-gray-400 mt-2">选词义不进记忆盒子，听写写对才算掌握；不想做可以直接跳过。</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        例句来自词库，不是临时编的。读一遍，把音、字形和意思连在一起，下一步就凭记忆写。
      </p>

      <div className="flex items-center gap-3 mt-5">
        <button onClick={() => onStep(3)} className="text-sm text-gray-500 hover:text-blue-600">← 上一步</button>
        <button onClick={onGo} className="btn-primary ml-auto">我会读了，去听写 →</button>
      </div>
    </div>
  );
}

// ========== 第 5 步 / 复习共用的听写 ==========
//
// 错词不再立刻报答案：先「再听一遍 → 遮形回想 → 自己写」，
// 回想仍不出来才显示正确拼法照打一遍。只有首次提交写记忆盒子。

function DictationStep({
  item,
  phase,
  onAnswer,
  onNext,
}: {
  item: VocabQueueItem;
  phase: 'review' | 'learn';
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}) {
  const [state, setState] = useState<'answering' | 'recall' | 'showAnswer' | 'fixed'>('answering');
  const [firstCorrect, setFirstCorrect] = useState(false);
  const answeredRef = useRef(false);

  const submit = (text: string) => {
    const ok = isDictationCorrect(text, item.word.en);
    if (!answeredRef.current) {
      answeredRef.current = true;
      setFirstCorrect(ok);
      onAnswer(ok);
      setState(ok ? 'fixed' : 'recall');
    } else if (state === 'recall') {
      setState(ok ? 'fixed' : 'showAnswer');
    } else if (state === 'showAnswer' && ok) {
      setState('fixed');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${phase === 'review' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
          {phase === 'review' ? `复习 · Box ${item.box}` : '新词 · 听写'}
        </span>
        <span className="text-xs text-gray-400 truncate text-right">{item.themeZh}</span>
      </div>

      <p className="text-2xl font-semibold text-gray-800 break-words">{item.word.zh}</p>
      <div className="mt-1 flex flex-wrap gap-2"><PlayButton word={item.word} /><SlowPlayButton word={item.word} /></div>

      {state === 'answering' && (
        <>
          {phase === 'review' && <HintPanel item={item} />}
          <DictationInput key={`ask-${item.word.id}`} onSubmit={submit} />
          <p className="text-xs text-gray-400 mt-2">
            {phase === 'learn'
              ? '这一遍不看提示，凭刚才听到的音写。写对才算这个词的第一次提取。'
              : '提示会随盒子慢慢撤掉；听写正确才算数。'}
          </p>
        </>
      )}

      {state === 'recall' && (
        <div className="mt-3 p-4 bg-amber-50 rounded-xl">
          <p className="text-sm font-medium text-amber-800">这一遍没写对，先别看答案。</p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            再听一遍，把词形在脑子里遮住、想清楚开头和每一块，然后自己重写一次。刚才写的错字已经藏起来了。
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <PlayButton word={item.word} label="🔊 再听一遍" />
            <SlowPlayButton word={item.word} />
          </div>
          <DictationInput
            key={`recall-${item.word.id}`}
            onSubmit={submit}
            placeholder="不看提示，自己再写一遍"
          />
          <p className="text-xs text-gray-400 mt-2">这是回想练习，不再改动记忆盒子；实在想不起来才看答案。</p>
        </div>
      )}

      {state === 'showAnswer' && (
        <div className="mt-3">
          <p className="font-medium text-red-600">还没想起来，正确拼法是 {item.word.en}</p>
          <div className="mt-2 p-3 bg-red-50 rounded-xl">
            <p className="text-sm text-gray-700 mb-2">
              看清 <span className="font-mono font-semibold">{item.word.en}</span>，照着再打一遍。
              这个词已回到 Box 1，今天会再排一次。
            </p>
            <DictationInput
              key={`fix-${item.word.id}`}
              onSubmit={submit}
              placeholder="照着正确拼法再打一遍"
            />
            <p className="text-xs text-gray-400 mt-1">重打只练手，不改变刚才记下的结果。</p>
          </div>
        </div>
      )}

      {state === 'fixed' && (
        <div className="mt-3">
          <p className="font-medium text-green-600">
            {firstCorrect ? '✓ 写对了' : '✓ 这一次自己想起来并写对了'}
          </p>
          <div className="mt-1"><IpaRef word={item.word} /></div>
          <button onClick={onNext} className="btn-primary mt-4">下一题 →</button>
        </div>
      )}
    </div>
  );
}

// ========== 入场测 ==========

function Placement({ onDone }: { onDone: () => void }) {
  const sample = useMemo(() => buildPlacementSample(), []);
  const completePlacement = useVocabStore((s) => s.completePlacement);
  const today = useMemo(() => todayString(), []);
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<Record<string, PlacementChoice>>({});
  const [showZh, setShowZh] = useState(false);
  const cur = sample[idx];

  const choose = (choice: PlacementChoice) => {
    const next = { ...choices, [cur.word.id]: choice };
    setChoices(next);
    setShowZh(false);
    if (idx + 1 >= sample.length) {
      const payload: Record<string, { themeId: string; route: 'A' | 'B' | 'C'; choice: PlacementChoice }> = {};
      for (const s of sample) {
        payload[s.word.id] = {
          themeId: s.themeId,
          route: s.analysis.route,
          choice: next[s.word.id] ?? 'unknown',
        };
      }
      completePlacement(payload, today);
      onDone();
    } else {
      setIdx(idx + 1);
    }
  };

  if (!cur) return null;
  return (
    <div className="card max-w-xl mx-auto">
      <p className="text-xs text-gray-400 mb-1">第一次使用 · 入场测 {idx + 1}/{sample.length}</p>
      <h3 className="text-lg font-bold text-gray-800 mb-1">这个词你认识吗？</h3>
      <p className="text-xs text-gray-500 mb-4">认识的词直接跳过首学，之后只按记忆节奏复习。</p>
      <p className="text-3xl font-bold text-gray-800 font-mono mb-2 break-all">{cur.word.en}</p>
      <div className="flex items-center gap-2 mb-3">
        <PlayButton word={cur.word} />
        <button onClick={() => setShowZh((v) => !v)} className="text-xs text-gray-500 hover:text-blue-600">
          {showZh ? cur.word.zh : '看中文提示'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5">
        <button onClick={() => choose('known')} className="px-2 py-3 rounded-xl bg-green-50 text-green-700 text-sm hover:bg-green-100">认识</button>
        <button onClick={() => choose('unsure')} className="px-2 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm hover:bg-amber-100">不确定</button>
        <button onClick={() => choose('unknown')} className="px-2 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200">不认识</button>
      </div>
      <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 transition-all" style={{ width: `${((idx + 1) / sample.length) * 100}%` }} />
      </div>
    </div>
  );
}

// ========== 主题语境段（真实例句 + 多空回填）==========

const BLANK_MARKS = ['①', '②', '③', '④', '⑤', '⑥'];

function PassageStep({ items, onDone }: { items: VocabQueueItem[]; onDone: () => void }) {
  const passage = useMemo(() => buildPassage(items), [items]);
  const [answers, setAnswers] = useState<string[]>(() => passage.blanks.map(() => ''));
  const [checked, setChecked] = useState(false);
  const [covered, setCovered] = useState(false);

  if (!passage.sentences.length) {
    return (
      <div className="card text-center">
        <p className="text-gray-500">本轮没有可串读的例句，直接完成。</p>
        <button onClick={onDone} className="btn-primary mt-4">完成今日学习</button>
      </div>
    );
  }

  const setOne = (i: number, v: string) =>
    setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)));
  const allFilled = answers.every((a) => a.trim().length > 0);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-1">📖 主题语境段</h3>
      <p className="text-xs text-gray-500 mb-3">{passage.note}</p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => setCovered((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs hover:bg-amber-100"
        >
          {covered ? '显示英文' : '遮住英文，看中文回想'}
        </button>
        <span className="text-xs text-gray-400">点「🔊 读句子」用本机语音朗读整句</span>
      </div>

      <div className="space-y-2">
        {passage.sentences.map((s, i) => (
          <div key={`${s.wordId}-${i}`} className="p-3 rounded-xl bg-gray-50">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-xs text-blue-500 font-medium whitespace-nowrap mt-0.5 shrink-0">{passage.connectors[i]}</span>
              <div className="flex-1 min-w-0">
                {covered ? (
                  <p className="text-sm text-gray-400">（英文已遮住，先看着中文回想）</p>
                ) : (
                  <p className="text-sm text-gray-800">
                    {s.text.split('____').map((part, k, arr) => (
                      <span key={k}>
                        {part}
                        {k < arr.length - 1 && (
                          <span className="inline-block mx-1 px-1.5 border-b-2 border-dashed border-orange-400 font-bold text-orange-600">
                            {BLANK_MARKS[s.blankIndex ?? 0]} ____
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{s.zh}</p>
              </div>
              <button
                onClick={() => speakText(s.plain, { rate: 0.85 })}
                className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
              >
                🔊 读句子
              </button>
            </div>
          </div>
        ))}
      </div>

      {passage.blanks.length > 0 && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (allFilled) setChecked(true); }}
          className="mt-4 space-y-2"
        >
          {passage.blanks.map((b, i) => (
            <div key={b.wordId} className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-gray-500 w-6 shrink-0">{BLANK_MARKS[i]}</span>
              <span className="text-xs text-gray-400 w-12 sm:w-16 truncate shrink-0">{b.hint}</span>
              <input
                value={answers[i] ?? ''}
                onChange={(e) => setOne(i, e.target.value)}
                placeholder="填入句中缺的词"
                autoComplete="off"
                spellCheck={false}
                disabled={checked}
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-2 sm:px-3 py-2 text-sm"
              />
            </div>
          ))}
          {!checked && (
            <button type="submit" className="btn-secondary mt-1" disabled={!allFilled}>检查答案</button>
          )}
        </form>
      )}

      {checked && (
        <div className="mt-3 text-sm space-y-1">
          {passage.blanks.map((b, i) => {
            const ok = isDictationCorrect(answers[i] ?? '', b.answer);
            return (
              <p key={b.wordId} className={ok ? 'text-green-600' : 'text-red-600'}>
                {BLANK_MARKS[i]} {ok ? '填对了' : `答案是 ${b.answer}`}
              </p>
            );
          })}
          <p className="text-xs text-gray-400 mt-1">这一环只练语境里的用词，不计入掌握判定；听写才算数。</p>
        </div>
      )}

      <button onClick={onDone} className="btn-primary mt-5">完成今日学习 →</button>
    </div>
  );
}

// ========== 结算 ==========

function ResultStep({
  stats, words, today, onBack, recordedRef,
}: {
  stats: SessionStats;
  words: Record<string, VocabWordProgress>;
  today: string;
  onBack: () => void;
  recordedRef: RefObject<boolean>;
}) {
  const recordSession = useProgressStore((s) => s.recordSession);
  const themeId = useVocabStore((s) => s.currentThemeId);
  const tomorrow = addDays(today, 1);
  const dueTomorrow = Object.values(words).filter(
    (p) => p.status !== 'new' && p.dueAt <= tomorrow
  ).length;
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordSession({
      module: 'vocabulary',
      exerciseType: 'spelling',
      subjectId: themeId || 'today',
      subjectName: '今日词汇',
      correct: stats.correct,
      total: stats.total,
      duration: 0,
    });
  }, [recordSession, themeId, stats.correct, stats.total, recordedRef]);

  return (
    <div className="card text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-1">今日词汇完成</h3>
      <p className="text-xs text-gray-400 mb-5">这里只报记忆状态，不记连胜、不发经验值。</p>
      <div className="inline-flex items-center justify-center gap-3 sm:gap-6 px-4 sm:px-8 py-4 bg-gray-50 rounded-2xl max-w-full">
        <div>
          <p className="text-3xl font-bold text-blue-600">{stats.correct} / {stats.total}</p>
          <p className="text-xs text-gray-400">听写首次写对</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-3xl font-bold text-gray-700">{pct}%</p>
          <p className="text-xs text-gray-400">正确率</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mt-5 text-sm">
        <div className="p-3 bg-green-50 rounded-xl"><p className="font-bold text-green-700">+{stats.up}</p><p className="text-xs text-gray-500">升盒</p></div>
        <div className="p-3 bg-red-50 rounded-xl"><p className="font-bold text-red-600">{stats.down}</p><p className="text-xs text-gray-500">回 Box 1</p></div>
        <div className="p-3 bg-blue-50 rounded-xl"><p className="font-bold text-blue-700">{stats.mastered}</p><p className="text-xs text-gray-500">新掌握</p></div>
      </div>
      <p className="text-sm text-gray-600 mt-5">明日待复习：<span className="font-semibold">{dueTomorrow}</span> 词</p>
      <p className="text-xs text-gray-400 mt-1">掌握判据：Box 5 + 连续 2 次听写正确 + 距首次学习 ≥ 7 天</p>
      <button onClick={onBack} className="btn-primary mt-6">返回主题列表</button>
    </div>
  );
}

// ========== 主组件 ==========

export default function VocabToday({ onBack }: { onBack: () => void }) {
  const words = useVocabStore((s) => s.words);
  const placementDone = useVocabStore((s) => s.placementDone);
  const currentThemeId = useVocabStore((s) => s.currentThemeId);
  const setCurrentTheme = useVocabStore((s) => s.setCurrentTheme);
  const dailyNew = useVocabStore((s) => s.dailyNew);
  const dailyReview = useVocabStore((s) => s.dailyReview);
  const setDailyCounts = useVocabStore((s) => s.setDailyCounts);
  const recordDictation = useVocabStore((s) => s.recordDictation);
  const markSessionDate = useVocabStore((s) => s.markSessionDate);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);

  const today = useMemo(() => todayString(), []);
  const activeThemeId = currentThemeId || allThemes[0].id;
  const [phase, setPhase] = useState<Phase>(placementDone ? 'overview' : 'placement');
  const [snapshot, setSnapshot] = useState<VocabTodayQueue | null>(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [learnIdx, setLearnIdx] = useState(0);
  const [learnSub, setLearnSub] = useState<'intro' | 'dictation'>('intro');
  const [learnStep, setLearnStep] = useState(1);
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS);
  const recordedRef = useRef(false);

  const preview = useMemo(
    () => buildTodayQueue({ words, currentThemeId: activeThemeId, today, dailyNew, dailyReview }),
    [words, activeThemeId, today, dailyNew, dailyReview]
  );

  const recordOne = (item: VocabQueueItem, correct: boolean, phaseName: 'review' | 'learn') => {
    const outcome = recordDictation(item.word.id, item.themeId, item.analysis.route, correct, today);
    setStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      up: s.up + (outcome.boxAfter > outcome.boxBefore ? 1 : 0),
      down: s.down + (outcome.boxAfter < outcome.boxBefore ? 1 : 0),
      mastered: s.mastered + (outcome.mastered ? 1 : 0),
    }));
    recordAnswer({
      module: 'vocabulary',
      exerciseType: 'spelling',
      subjectId: item.themeId,
      subjectName: item.themeZh,
      questionId: `${phaseName}-${item.word.id}`,
      questionText: item.word.zh,
      userAnswer: correct ? item.word.en : '(拼写错误)',
      correctAnswer: item.word.en,
      isCorrect: correct,
    });
  };

  const goAfterReview = () => {
    if (snapshot && snapshot.fresh.length > 0) {
      setPhase('learn');
      setLearnIdx(0);
      setLearnSub('intro');
      setLearnStep(1);
    } else {
      goAfterLearn();
    }
  };

  const goAfterLearn = () => {
    const hasPassage = snapshot && buildPassage(snapshot.fresh).sentences.length > 0;
    if (hasPassage) setPhase('passage');
    else {
      markSessionDate(today);
      setPhase('result');
    }
  };

  const start = () => {
    const q = buildTodayQueue({ words, currentThemeId: activeThemeId, today, dailyNew, dailyReview });
    setSnapshot(q);
    setReviewIdx(0);
    setLearnIdx(0);
    setLearnSub('intro');
    setLearnStep(1);
    setStats(EMPTY_STATS);
    recordedRef.current = false;
    if (q.review.length) setPhase('review');
    else if (q.fresh.length) setPhase('learn');
    else setPhase('result');
  };

  const finish = () => {
    markSessionDate(today);
    setPhase('result');
  };

  // ---- 入场测 ----
  if (phase === 'placement') {
    return (
      <div>
        <TopBar onBack={onBack} title="今日词汇 · 入场测" />
        <Placement onDone={() => setPhase('overview')} />
      </div>
    );
  }

  // ---- 概览 ----
  if (phase === 'overview') {
    const theme = allThemes.find((t) => t.id === activeThemeId) ?? allThemes[0];
    const noWork = preview.review.length === 0 && preview.fresh.length === 0;
    return (
      <div>
        <TopBar onBack={onBack} title="今日词汇" />
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <h3 className="text-lg font-bold text-gray-800 mb-1">今天学这些</h3>
          <p className="text-xs text-gray-500 mb-4">到期复习优先，再学当前主题的新词；约 12–14 分钟。</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-700">{preview.review.length}</p>
              <p className="text-xs text-gray-500">到期复习（共 {preview.dueTotal} 词待复习）</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{preview.fresh.length}</p>
              <p className="text-xs text-gray-500">新词（本主题还剩 {preview.freshRemaining} 词）</p>
            </div>
          </div>
          <label className="block text-xs text-gray-500 mb-1">当前主题</label>
          <select
            value={activeThemeId}
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4"
          >
            {allThemes.map((t) => (
              <option key={t.id} value={t.id}>{t.icon} {t.nameZh}（{t.words.length} 词）</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">每日新词</span>
              <select
                value={dailyNew}
                onChange={(e) => setDailyCounts(Number(e.target.value), dailyReview)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {DAILY_NEW_OPTIONS.map((n) => <option key={n} value={n}>{n} 个</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">每日复习</span>
              <select
                value={dailyReview}
                onChange={(e) => setDailyCounts(dailyNew, Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {DAILY_REVIEW_OPTIONS.map((n) => <option key={n} value={n}>{n} 题</option>)}
              </select>
            </label>
          </div>
          <p className="text-xs text-gray-400 mb-4">词量下一轮生效，会随学习进度同步到其它设备。</p>

          {noWork ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">今天没有到期复习，这个主题的新词也学完了。换一个主题继续，或去自由练习。</p>
            </div>
          ) : (
            <button onClick={start} className="btn-primary w-full">开始今日学习 →</button>
          )}
          <p className="text-xs text-gray-400 mt-3">
            每个新词按 5 步走：只听 → 辨音 → 看形（含拼读规律）→ 挂义（含选意思）→ 听写。间隔 0/1/3/7/15 天与上面的每日词量都是工程默认值，不是「最优记忆参数」。
          </p>
        </div>
        {theme && (
          <p className="text-xs text-gray-400 mt-3 text-center">{theme.name} · 复习题按到期日跨主题混合</p>
        )}
      </div>
    );
  }

  // ---- 复习 ----
  if (phase === 'review' && snapshot) {
    const item = snapshot.review[reviewIdx];
    if (!item) return <div className="text-center py-16 text-gray-400">正在整理下一组…</div>;
    return (
      <div>
        <TopBar onBack={onBack} title={`复习 ${reviewIdx + 1}/${snapshot.review.length}`} />
        <DictationStep
          key={`rev-${item.word.id}`}
          item={item}
          phase="review"
          onAnswer={(ok) => recordOne(item, ok, 'review')}
          onNext={() => {
            const next = reviewIdx + 1;
            if (next >= snapshot.review.length) goAfterReview();
            else setReviewIdx(next);
          }}
        />
      </div>
    );
  }

  // ---- 首学 ----
  if (phase === 'learn' && snapshot) {
    const item = snapshot.fresh[learnIdx];
    if (!item) return <div className="text-center py-16 text-gray-400">正在整理下一组…</div>;
    return (
      <div>
        <TopBar onBack={onBack} title={`新词 ${learnIdx + 1}/${snapshot.fresh.length}`} />
        <LearnStepDots current={learnSub === 'intro' ? learnStep : 5} />
        {learnSub === 'intro' ? (
          <LearnFlow
            key={`intro-${item.word.id}`}
            item={item}
            step={learnStep}
            onStep={setLearnStep}
            onGo={() => setLearnSub('dictation')}
          />
        ) : (
          <DictationStep
            key={`learn-${item.word.id}`}
            item={item}
            phase="learn"
            onAnswer={(ok) => recordOne(item, ok, 'learn')}
            onNext={() => {
              const next = learnIdx + 1;
              if (next >= snapshot.fresh.length) goAfterLearn();
              else { setLearnIdx(next); setLearnSub('intro'); setLearnStep(1); }
            }}
          />
        )}
      </div>
    );
  }

  // ---- 短文 ----
  if (phase === 'passage' && snapshot) {
    return (
      <div>
        <TopBar onBack={onBack} title="主题语境段" />
        <PassageStep items={snapshot.fresh} onDone={finish} />
      </div>
    );
  }

  // ---- 结算 ----
  return (
    <div>
      <TopBar onBack={onBack} title="今日词汇 · 结算" />
      <ResultStep
        stats={stats}
        words={words}
        today={today}
        onBack={onBack}
        recordedRef={recordedRef}
      />
    </div>
  );
}

function TopBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-4 min-w-0">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-blue-600 shrink-0 whitespace-nowrap">← 返回主题列表</button>
      <span className="text-xs text-gray-400 truncate text-right">{title}</span>
    </div>
  );
}
