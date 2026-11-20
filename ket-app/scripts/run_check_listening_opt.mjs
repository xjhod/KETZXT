// 校验听力优化：①题型标签修正 ②Part3/4原文展示 ③播放配置纯函数 ④错题反查真重做 ⑤UI接线。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const PB = await load('src/utils/listeningPlayback.ts');
const LR = await load('src/utils/listeningRetry.ts');
const L = await load('src/data/listening.ts');
const page = readFileSync('src/pages/ListeningPage.tsx', 'utf8');
const wrong = readFileSync('src/pages/WrongPage.tsx', 'utf8');

console.log('=== 1. 播放配置纯函数 ===');
ok(PB.DEFAULT_RATE === 1, '默认正常语速');
ok(PB.DEFAULT_LOOP === false, '默认不循环');
ok(PB.normalizeRate(0.75) === 0.75 && PB.normalizeRate(1) === 1 && PB.normalizeRate(1.25) === 1.25, '三档合法语速');
ok(PB.normalizeRate(0.9) === 1, '非法语速回退正常');
ok(PB.normalizeRate('abc') === 1 && PB.normalizeRate(null) === 1, '脏值回退正常');
ok(PB.normalizeLoop(true) === true && PB.normalizeLoop('true') === false && PB.normalizeLoop(1) === false, '循环只认布尔true');
ok(PB.playTimes(false) === 1 && PB.playTimes(true) === 2, '循环开=2遍/关=1遍');
ok(PB.ALLOWED_RATES.length === 3, '恰好三档语速');

console.log('=== 2. 题型标签修正 ===');
const correctLabels = ['独白填空', '长对话选择', '图片选择', '笔记填空'];
for (const label of correctLabels) ok(page.includes(label), `主页含正确标签「${label}」`);
ok(!page.includes("nameZh: '信息匹配'"), 'partMeta 不再是错误标签「信息匹配」');
ok(!page.includes("nameZh: '听录音填空'"), 'partMeta 不再是错误标签「听录音填空」');
ok(!page.includes('<p className="font-bold text-gray-800">信息匹配</p>'), '主页卡片不再写「信息匹配」');
ok(!page.includes('<p className="font-bold text-gray-800">听录音填空</p>'), '主页卡片不再写「听录音填空」');
ok(!page.includes('<p className="font-bold text-gray-800">选择题</p>'), '主页卡片不再写泛化「选择题」');

console.log('=== 3. Part3/4 原文展示接线 ===');
ok(page.includes('查看完整对话原文'), 'Part3 结果页有原文入口');
ok(page.includes('set.transcript'), 'Part3 用 set.transcript');
ok(page.includes('查看全部听力原文'), 'Part4 结算页有原文入口');
ok((page.match(/qq\.audioText/g) || []).length >= 1, 'Part4 逐题用 audioText');

console.log('=== 4. 错题反查：五类全覆盖 ===');
ok(LR.parsePart('Part1-L1-01') === 1 && LR.parsePart('Part5-L5-10') === 5, '从 exerciseType 解析 part');
ok(LR.parsePart('grammar_choice') === null && LR.parsePart('') === null, '非听力返回null');

const cases = [
  ['Part1-L1-01', L.part1Sets[0].questions[0].id, 'choice'],
  ['Part2-L2-01', L.part2Sets[0].blanks[0].id, 'fill'],
  ['Part3-L3-01', L.part3Sets[0].questions[0].id, 'choice'],
  ['Part4-L4-01', L.part4Sets[0].questions[0].id, 'choice'],
  ['Part5-L5-01', L.part5Sets[0].notes[0].id, 'fill'],
];
for (const [ex, qid, kind] of cases) {
  const r = LR.findListeningRetry(ex, qid);
  ok(!!r, `${ex} 能反查到原题`);
  if (r) {
    ok(r.kind === kind, `${ex} 题型=${kind}`);
    ok(!!r.audioId && !!r.audioText, `${ex} 有可播放音频`);
    ok(!!r.correctAnswer, `${ex} 有正确答案`);
    ok(!!r.transcript, `${ex} 有原文`);
    ok(!!r.prompt, `${ex} 有题干`);
  }
}
ok(LR.findListeningRetry('Part1-L1-01', 'NOT-EXIST') === null, '查不到返回null');
ok(LR.findListeningRetry('grammar_choice', 'x') === null, '非听力记录返回null');

console.log('=== 5. 判分逻辑 ===');
ok(LR.isFillCorrect('  Apple ', 'apple'), '填空trim+忽略大小写');
ok(LR.isFillCorrect('Monday', 'Monday / Mon'), '填空多答案');
ok(!LR.isFillCorrect('', 'apple'), '空答案判错');
ok(!LR.isFillCorrect('banana', 'apple'), '错答案判错');
ok(LR.isChoiceCorrect('A', 'A') && !LR.isChoiceCorrect(' B ', 'A'), '选择比对');

console.log('=== 6. UI 接线静态断言 ===');
ok(wrong.includes('ListeningRetryPanel'), '错题本挂载真重做面板');
ok(wrong.includes('findListeningRetry'), '错题本调用反查');
ok(wrong.includes('重听重做'), '真重做文案可见');
ok(wrong.includes('onResult={handlePracticeResult}'), '真重做结果接入原计分逻辑');
ok(wrong.includes('播放听力') || wrong.includes('再听一遍'), '有重听按钮');
ok(wrong.includes('查看原文对照'), '答后可看原文');
// 非听力仍保留手动自评
ok(wrong.includes('这次答对了') && wrong.includes('这次答错了'), '非听力保留手动自评回退');
// 播放桥共用
const bridge = readFileSync('src/listeningAudioBridge.ts', 'utf8');
ok(bridge.includes('readRate') && bridge.includes('playTimes'), '播放桥读语速/循环配置');
ok(page.includes('from \'../listeningAudioBridge\''), '听力页复用播放桥');

console.log(`\n=== RESULT: pass=${pass} fail=${fail} ===`);
process.exit(fail === 0 ? 0 : 1);
