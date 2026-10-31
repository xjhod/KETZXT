/**
 * 同步与密码哈希逻辑验证脚本
 *
 * 运行：node --experimental-strip-types verify-sync.mts
 *
 * 覆盖：
 *   1. PBKDF2 哈希：同密码同盐结果一致 / 异盐不同 / 异密码不同
 *   2. safeEqual 恒定时间比较的正确性
 *   3. 合并策略：答题记录去重与时间优先、计划进度只前进、打卡计数取大
 *   4. 边界：空包、缺字段、损坏数据都不应抛异常
 */

import { webcrypto } from 'node:crypto';

// ---------- 浏览器 API 在 Node 下的垫片 ----------
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}
if (!globalThis.btoa) {
  (globalThis as any).btoa = (s: string) => Buffer.from(s, 'binary').toString('base64');
}
if (!globalThis.atob) {
  (globalThis as any).atob = (s: string) => Buffer.from(s, 'base64').toString('binary');
}

// ---------- localStorage 垫片 ----------
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

let passed = 0;
let failed = 0;
/** 断言条件为真 */
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ' -> ' + detail : ''}`);
  }
}
/** 断言结果为假（用于「不应通过」的用例） */
function checkFalse(name: string, cond: boolean, detail = '') {
  check(name, !cond, detail);
}
function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

// ================= 1. 密码哈希 =================
section('1. PBKDF2 密码哈希');
const { generateSalt, hashPassword, safeEqual } = await import('./src/utils/crypto.ts');

const salt1 = generateSalt();
const salt2 = generateSalt();
check('两次生成的盐不同', salt1 !== salt2);
check('盐是 base64 且长度合理', salt1.length >= 20 && salt1.length <= 32, `len=${salt1.length}`);

const h1 = await hashPassword('password123', salt1);
const h1again = await hashPassword('password123', salt1);
const h2 = await hashPassword('password123', salt2);
const h3 = await hashPassword('password456', salt1);

check('同密码+同盐 -> 结果一致', h1 === h1again);
check('同密码+异盐 -> 结果不同（盐生效）', h1 !== h2);
check('异密码+同盐 -> 结果不同', h1 !== h3);
check('哈希不是明文', !h1.includes('password123'));
check('哈希长度为 base64(32字节)=44', h1.length === 44, `len=${h1.length}`);

// 性能：PBKDF2 故意慢，但不该慢到无法接受（手机上也应在几百毫秒内）
const t0 = Date.now();
await hashPassword('x', salt1);
const elapsed = Date.now() - t0;
check('单次派生耗时 < 800ms（手机可接受）', elapsed < 800, `${elapsed}ms`);

// ================= 2. safeEqual =================
section('2. 恒定时间比较');
check('相等字符串 -> true', safeEqual('abc', 'abc'));
checkFalse('不相等 -> false', safeEqual('abc', 'abd'));
checkFalse('长度不同 -> false', safeEqual('abc', 'abcd'));
check('空串 vs 空串 -> true', safeEqual('', ''));
checkFalse('前缀相同但长度不同 -> false', safeEqual('abc', 'abcdef'));

// ================= 3. 合并策略 =================
section('3. 合并策略');
const { mergePayload } = await import('./src/utils/sync.ts');
const { useProgressStore } = await import('./src/store/useProgressStore.ts');
const { usePlanStore } = await import('./src/store/usePlanStore.ts');
const { useDailyCheckinStore } = await import('./src/store/useDailyCheckinStore.ts');

// --- 3.1 答题记录：按 id 去重，时间新的胜出 ---
useProgressStore.setState({
  answerRecords: [
    {
      id: 'r1', module: 'grammar', exerciseType: 'grammar_fill',
      subjectId: 'g1', subjectName: '语法点1', questionId: 'q1',
      questionText: '题目1', userAnswer: 'A', correctAnswer: 'B',
      isCorrect: false, answeredAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'r2', module: 'vocabulary', exerciseType: 'spelling',
      subjectId: 'v1', subjectName: '词1', questionId: 'q2',
      questionText: '题目2', userAnswer: 'x', correctAnswer: 'x',
      isCorrect: true, answeredAt: '2026-10-02T10:00:00.000Z',
    },
  ] as any,
});

const merged1 = mergePayload({
  progress: {
    answerRecords: [
      // 与本地 r1 同 id，但时间更新（应为云端胜出）
      {
        id: 'r1', module: 'grammar', exerciseType: 'grammar_fill',
        subjectId: 'g1', subjectName: '语法点1', questionId: 'q1',
        questionText: '题目1', userAnswer: 'B', correctAnswer: 'B',
        isCorrect: true, answeredAt: '2026-10-05T10:00:00.000Z',
      },
      // 云端独有
      {
        id: 'r3', module: 'reading', exerciseType: 'reading_p1',
        subjectId: 'a1', subjectName: '文章1', questionId: 'q3',
        questionText: '题目3', userAnswer: 'y', correctAnswer: 'y',
        isCorrect: true, answeredAt: '2026-10-03T10:00:00.000Z',
      },
    ],
    sessionRecords: [],
  },
} as any);

const recs = useProgressStore.getState().answerRecords;
check('合并后共 3 条记录', recs.length === 3, `实际 ${recs.length}`);
check('同 id 记录取时间更新的一方（isCorrect=true）',
  recs.find(r => r.id === 'r1')?.isCorrect === true);
check('云端独有记录被加入', !!recs.find(r => r.id === 'r3'));
check('合并计数正确（新增 1 条 + 更新 1 条 = 2）', merged1 === 2, `实际 ${merged1}`);
check('记录按时间倒序', recs[0].answeredAt >= recs[1].answeredAt);

// --- 3.2 计划：cursor 只前进，logs 按日期合并 ---
usePlanStore.setState({
  startDate: '2026-10-10',
  cursor: 5,
  logs: {
    '2026-10-10': { date: '2026-10-10', setIndex: 4, itemIds: [], results: [], correctCount: 8, totalCount: 10, writingDone: true, writingWords: 30, speakingDone: false, speakingPercent: 0, minutes: 20, completedAt: '2026-10-10T12:00:00.000Z' },
  },
  skips: {},
} as any);

mergePayload({
  plan: {
    startDate: '2026-10-08',
    cursor: 3, // 更小，不应覆盖本地的 5
    logs: {
      // 同日但云端 completedAt 更新 -> 应覆盖
      '2026-10-10': { date: '2026-10-10', setIndex: 4, itemIds: [], results: [], correctCount: 10, totalCount: 10, writingDone: true, writingWords: 35, speakingDone: true, speakingPercent: 90, minutes: 25, completedAt: '2026-10-11T12:00:00.000Z' },
      // 云端独有日期
      '2026-10-09': { date: '2026-10-09', setIndex: 3, itemIds: [], results: [], correctCount: 9, totalCount: 10, writingDone: true, writingWords: 28, speakingDone: false, speakingPercent: 0, minutes: 22, completedAt: '2026-10-09T12:00:00.000Z' },
    },
    skips: { '2026-10-07': 2 },
  },
} as any);

const plan = usePlanStore.getState();
check('cursor 取较大值（5，不被云端 3 覆盖）', plan.cursor === 5, `实际 ${plan.cursor}`);
check('起始日取较早者（2026-10-08）', plan.startDate === '2026-10-08', `实际 ${plan.startDate}`);
check('云端独有的日期被加入', !!plan.logs['2026-10-09']);
check('同日记录取 completedAt 更新的一方（correctCount=10）',
  plan.logs['2026-10-10']?.correctCount === 10, `实际 ${plan.logs['2026-10-10']?.correctCount}`);
check('skips 被合并', plan.skips['2026-10-07'] === 2);

// --- 3.3 打卡：计数取大，日期并集 ---
useDailyCheckinStore.setState({
  points: {
    g1: { grammarId: 'g1', introduced: true, stage: 2, right: 5, wrong: 2, box: 3, lastSeen: '2026-10-10' },
  },
  streak: 3,
  lastCheckinDate: '2026-10-10',
  checkinDates: ['2026-10-08', '2026-10-09', '2026-10-10'],
} as any);

mergePayload({
  checkin: {
    points: {
      g1: { grammarId: 'g1', introduced: true, stage: 4, right: 8, wrong: 1, box: 5, lastSeen: '2026-10-12' },
      g2: { grammarId: 'g2', introduced: true, stage: 1, right: 1, wrong: 0, box: 1, lastSeen: '2026-10-11' },
    },
    streak: 5,
    lastCheckinDate: '2026-10-12',
    checkinDates: ['2026-10-11', '2026-10-12'],
  },
} as any);

const ck = useDailyCheckinStore.getState();
check('同一语法点 right 取较大值（8）', ck.points.g1?.right === 8, `实际 ${ck.points.g1?.right}`);
check('同一语法点 stage 取较大值（4）', ck.points.g1?.stage === 4, `实际 ${ck.points.g1?.stage}`);
check('lastSeen 取较晚者（2026-10-12）', ck.points.g1?.lastSeen === '2026-10-12');
check('云端独有语法点被加入', !!ck.points.g2);
check('打卡日期取并集（5 天）', ck.checkinDates.length === 5, `实际 ${ck.checkinDates.length}`);
check('streak 取较大值（5）', ck.streak === 5, `实际 ${ck.streak}`);
check('lastCheckinDate 取较晚者（2026-10-12）', ck.lastCheckinDate === '2026-10-12');

// ================= 4. 边界情况 =================
section('4. 边界情况');
check('null 包不抛异常', mergePayload(null) === 0);
check('undefined 包不抛异常', mergePayload(undefined) === 0);
check('空对象包不抛异常', mergePayload({} as any) === 0);
check('字段缺失不抛异常', mergePayload({ progress: {} } as any) === 0);
check('数组类型异常不抛异常', mergePayload({ progress: { answerRecords: 'not-an-array' } } as any) === 0);
check('损坏的记录被跳过而不崩溃', (() => {
  try {
    mergePayload({ progress: { answerRecords: [null, undefined, { noId: true }] } } as any);
    return true;
  } catch { return false; }
})());

// ================= 汇总 =================
console.log(`\n${'='.repeat(50)}`);
console.log(`通过 ${passed} 项，失败 ${failed} 项`);
console.log('='.repeat(50));
if (failed > 0) {
  process.exit(1);
}
