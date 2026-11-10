// ========== 口语 P0 校验入口 ==========
// 三层：确定性评分纯函数（rolldown 打包后真实执行） -> 30 道题库全量验 -> 静态接线断言。
// 覆盖：词形匹配漏洞、复读刷分、可编辑确认、换题清状态、单条分数口径、本机证据不上云。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

const failures = [];
let passed = 0;
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (cond) passed++;
  else failures.push(name);
};
const read = (p) => readFileSync(p, 'utf8');

async function bundleModule(path) {
  const bundle = await rolldown({ input: path });
  const { output } = await bundle.generate({ format: 'esm' });
  const url = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
  return import(url);
}

// ---- 1. 确定性评分纯函数 ----
const score = await bundleModule('src/utils/speakingScore.ts');
const { scoreAnswer, matchKeywords, keywordVariants, tokenize } = score;
const page = read('src/pages/SpeakingPage.tsx');
const llm = read('src/utils/llm.ts');
const store = read('src/store/useProgressStore.ts');
const evidence = read('src/utils/speechEvidence.ts');
const sync = read('src/utils/sync.ts');

ok('导出四个纯函数', ['scoreAnswer', 'matchKeywords', 'keywordVariants', 'tokenize'].every((k) => typeof score[k] === 'function'));

// 旧漏洞：w.includes(kw) 让 dislike 命中 like
ok('dislike 不再命中 like', matchKeywords('I dislike it', ['like']).length === 0);
ok('like 正常命中', matchKeywords('I like it', ['like']).length === 1);
ok('dislikes 也不误命中', matchKeywords('He dislikes tea', ['like']).length === 0);
ok('复数 families 命中 family', matchKeywords('My families are big', ['family']).length === 1);
ok('第三人称 likes 命中 like', matchKeywords('She likes music', ['like']).length === 1);
ok('过去式 played 命中 play', matchKeywords('We played football', ['play']).length === 1);
ok('现在分词 playing 命中 play', matchKeywords('We are playing', ['play']).length === 1);
ok('study 变体 studied/studies', matchKeywords('He studied and she studies', ['study']).length === 1);
ok('英式双写 travelling 命中 travel', matchKeywords('I like travelling', ['travel']).length === 1);
ok('英式双写 travelled 命中 travel', matchKeywords('I have travelled', ['travel']).length === 1);
ok('派生词 nearby 命中 near', matchKeywords('a park nearby', ['near']).length === 1);
ok('短语关键词连续匹配', matchKeywords('I live in a flat in Beijing', ['live in']).length === 1);
ok('短语关键词不跨词误匹配', matchKeywords('I live near a flat', ['live in']).length === 0);
ok('标点与大小写归一', matchKeywords('I LIKE, playing!', ['like', 'play']).length === 2);
ok('tokenize 只取英文词', JSON.stringify(tokenize('I 3 like it.')) === JSON.stringify(['i', 'like', 'it']));
ok('变体表含自身', keywordVariants('family').has('family'));

// 旧漏洞：总词数给 50 分，复读可刷满
const repeated = Array(50).fill('like').join(' ');
const rRepeat = scoreAnswer(repeated, ['family', 'mother', 'father', 'brother', 'sister', 'people']);
ok('重复 50 个词刷不到 60 分', rRepeat.score < 60, `score=${rRepeat.score}`);
ok('重复词只有 1 个不同词', rRepeat.distinctWordCount === 1);
ok('重复词总词数仍如实记录', rRepeat.wordCount === 50);
const rEmpty = scoreAnswer('', ['like']);
ok('空文字得 0 分', rEmpty.score === 0 && rEmpty.wordCount === 0);
const fullKw = ['family', 'mother', 'father', 'brother', 'sister', 'people'];
const fullText = 'There are four people in my family: my mother, my father, my brother, my sister and me. My father is a teacher and my mother works in a hospital in the city near our house.';
const rFull = scoreAnswer(fullText, fullKw);
ok('全覆盖 + 足够词量得满分', rFull.score === 100, `score=${rFull.score}`);
ok('满分时命中全部关键词', rFull.matchedKeywords.length === fullKw.length);
ok('分数上限不超 100', scoreAnswer(fullText + ' ' + Array(40).fill('extra'), fullKw).score <= 100);
const scores = Array.from({ length: 10 }, () => scoreAnswer(fullText, fullKw).score);
ok('同一文本 10 次评分稳定', new Set(scores).size === 1);
ok('文本被修改后分数随之变化', scoreAnswer('I like it.', fullKw).score !== scoreAnswer(fullText, fullKw).score);
ok('反馈里不再自称流利度', !/流利度/.test(rFull.feedback + rRepeat.feedback));

// ---- 2. 30 道题库全量验 ----
const data = await bundleModule('src/data/speaking.ts');
const { speakingPart1, speakingPart2 } = data;
ok('题库 Part1 20 题', Array.isArray(speakingPart1) && speakingPart1.length === 20, `${speakingPart1?.length}`);
ok('题库 Part2 10 题', Array.isArray(speakingPart2) && speakingPart2.length === 10, `${speakingPart2?.length}`);
const p1Bad = speakingPart1.filter((q) => scoreAnswer(q.modelAnswer, q.keywords).score < 60);
ok('Part1 参考答案全部达 60 分', p1Bad.length === 0, p1Bad.map((q) => q.id).join(','));
const selfMatch = [...speakingPart1, ...speakingPart2].filter(
  (q) => !q.keywords.every((kw) => matchKeywords(kw, [kw]).length === 1)
);
ok('全部关键词可被自身命中（词形表自洽）', selfMatch.length === 0, selfMatch.map((q) => q.id).join(','));
ok('Part2 每题 3 个讨论问题', speakingPart2.every((q) => q.questions.length === 3));

// ---- 3. 可编辑确认框 ----
ok('ASR 结果自动填入确认框', /if \(t && !answerEditedRef\.current\) setAnswerText\(t\)/.test(page));
ok('孩子改过就不再被覆盖', /answerEditedRef\.current = true/.test(page));
ok('确认框绑定 answerText', /value=\{answerText\}/.test(page));
ok('两处 Part 都换成确认框', (page.match(/请确认你所说的英文/g) || []).length === 2);
ok('评分只依据确认框文字', (page.match(/评分只依据这个框里的文字/g) || []).length === 2);
ok('AI 评分只吃 answerText', /const textOnly = answerText\.trim\(\)/.test(page) && /browserTranscript: textOnly/.test(page));
ok('本地评分只吃 answerText', /const answer = answerText\.trim\(\)/.test(page));
ok('旧优先级写法已清除', !/\(transcript \|\| manualText\)/.test(page));
ok('manualText 已彻底移除', !/manualText/.test(page));
ok('旧 recordAnswer 已移除', !/recordAnswer/.test(page));

// ---- 4. 换题清状态（修分数残留）----
const resetBody = page.slice(page.indexOf('function resetQuestionState()'), page.indexOf('function handleNext()'));
ok('resetQuestionState 清 llmSpeech', /setLlmSpeech\(null\)/.test(resetBody));
ok('resetQuestionState 清 llmError', /setLlmError\(null\)/.test(resetBody));
ok('resetQuestionState 清 answerText', /setAnswerText\(''\)/.test(resetBody));
ok('resetQuestionState 清 answerId', /answerIdRef\.current = ''/.test(resetBody));
ok('resetQuestionState 清 scoreResult', /setScoreResult\(null\)/.test(resetBody));
ok('resetQuestionState 清 flagged/字数态', /setFlagged\(false\)/.test(resetBody) && /questionScoredRef\.current = false/.test(resetBody));
ok('handleNext 调 resetQuestionState', /setCurrentIndex\(nextIndex\);\s*\n\s*resetQuestionState\(\)/.test(page));
ok('两处 Part 切换都调 resetQuestionState', (page.match(/resetQuestionState\(\);/g) || []).length === 3);

// ---- 5. 单条分数口径 ----
ok('本地分写 local 来源', /writeRecord\(result\.score, 'local'\)/.test(page));
ok('AI 分写 llm 来源', /writeRecord\(res\.data\.score, 'llm'\)/.test(page));
ok('writeRecord 用固定 id 覆盖', /id: ensureAnswerId\(\)/.test(page) && /upsertAnswer\(\{/.test(page));
ok('store 实现按 id 去重覆盖', /state\.answerRecords\.filter\(\(r\) => r\.id !== record\.id\)/.test(store));
ok('AnswerRecord 带 score/scoreSource', /score\?: number/.test(store) && /scoreSource\?: 'llm' \| 'local'/.test(store));
ok('AI 分回来隐藏离线参考分', (page.match(/\{scoreResult && !llmSpeech && \(/g) || []).length === 2);
ok('页面只有一个正式分数标题', /AI 口语评分（本次正式分数）/.test(page) && !/✅ 评分结果/.test(page));
ok('离线参考分标题说明会替换', (page.match(/离线参考分（AI 评分后自动替换）/g) || []).length === 2);
ok('长度分改显示不同词数', (page.match(/不同词数：\{scoreResult\.distinctWordCount\}/g) || []).length === 2);
ok('同一题分数变化会修正会话统计', /const delta = \(isCorrect \? 1 : 0\) - \(lastCorrectRef\.current \? 1 : 0\)/.test(page));
const startBody = page.slice(page.indexOf('async function startRecording()'), page.indexOf('async function stopRecording()'));
ok('重录不重置会话计数（correct 不超 total）', !/lastCorrectRef\.current = null/.test(startBody));
ok('换题才重置会话计数', /lastCorrectRef\.current = null/.test(resetBody));

// ---- 6. 不再显示 LLM 回显的假原文 ----
ok('界面不再读 llmSpeech.transcript', !/llmSpeech\.transcript/.test(page));
ok('界面显示孩子确认过的文字', /本次评分依据的文字（你确认过的）/.test(page) && /<p className="text-gray-600 break-words">\{answerText\}<\/p>/.test(page));
ok('LlmSpeechResult 去掉 transcript 字段', !/^\s*transcript: string;/m.test(llm));
ok('提示词不再要求回显原文', !/"transcript"/.test(llm) && /不要输出 transcript 字段/.test(llm));
ok('提示词要求引用原句证据', /引用学生原句里的具体片段作为证据/.test(llm));
ok('评分结果带 modelId', /modelId: res\.modelId/.test(llm) && /modelId\?: string/.test(llm));
ok('明确标注未评估维度', /发音、语调、互动交流未评估/.test(page) && /不要凭空给出"流利度""发音""互动交流"类分数/.test(llm));

// ---- 7. Part2 题目完整性 ----
ok('Part2 三问全送进 LLM', /currentPart2\.questions\.join\(' \/ '\)/.test(page));
ok('Part2 附带作答提示', /currentPart2\.tips\.join/.test(page));
ok('Part1 用英文原题', /if \(activePart === 1\) return currentPart1\.question;/.test(page));

// ---- 8. 本机证据：存本机、不上云 ----
ok('证据库 7 天 TTL', /EVIDENCE_TTL_DAYS = 7/.test(evidence) && /ttlDays = EVIDENCE_TTL_DAYS/.test(evidence));
ok('启动时自动清理过期录音', /await pruneSpeechEvidence\(\)/.test(page));
ok('写入/读取/局部更新/清空齐全', ['putSpeechEvidence', 'getSpeechEvidence', 'patchSpeechEvidence', 'clearSpeechEvidence'].every((k) => new RegExp(`export async function ${k}\\(`).test(evidence)));
ok('音频只存 Blob，不转 base64/不上传', /audio: Blob \| null/.test(evidence) && !/fetch\(|XMLHttpRequest|FormData/.test(evidence));
ok('证据不进云同步 payload', !/speechEvidence|SpeechEvidence|audioBlob/.test(sync));
ok('sync 仍只带既有五个字段', /progress: useProgressStore\.getState\(\)/.test(sync) && /profile: readNicknameProfile\(\)/.test(sync));
ok('证据字段含原始转写/定稿/来源/模型/标记', ['rawTranscript', 'confirmedText', 'asrSource', 'modelId', 'flagged'].every((k) => new RegExp(`${k}[:?]`).test(evidence)));
ok('录音静默失败仍有人话提示', /blob\.size < 1000/.test(page));
ok('回放有停止控制（不叠音）', /recordingAudioRef\.current\.pause\(\)/.test(page));
ok('复核三入口齐全', ['回听录音', '重新评分', '我觉得评错了'].every((t) => page.includes(t)));
ok('本机记录面板展示来源与分数', /ASR_SOURCE_LABEL/.test(page) && /scoreSource === 'llm'/.test(page));
ok('清除本机录音需二次确认', /window\.confirm\('确定清除本机全部录音/.test(page));
ok('TTL 天数显示在界面', /\{EVIDENCE_TTL_DAYS\} 天后自动清除/.test(page));

// ---- 9. 两处 Part 共用面板 & 旧断言兼容 ----
ok('两处 Part 复用 renderAiPanel', (page.match(/\{renderAiPanel\(\)\}/g) || []).length === 2);
ok('评分按钮要求确认框有文字', (page.match(/answerText\.trim\(\) && !scoreResult && !llmSpeech/g) || []).length === 2);
ok('无文字引导条保留', /浏览器没能识别出文字/.test(page));
ok('AI 失败提示仍显示', /AI 评分失败：/.test(page));

console.log(`\nSPEAKING_P0_CHECK: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('FAILED:', failures.join(' | '));
  process.exit(1);
}
