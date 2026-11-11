// 入口对齐能力 · 静态校验（实跑，不认口头声称）
// 目标：一科一入口；语法双入口合并；作文独立成科；备考后置；作文存档只在本机。
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let pass = 0;
let fail = 0;
function ok(cond, msg) {
  if (cond) {
    pass++;
    console.log('OK   ' + msg);
  } else {
    fail++;
    console.log('FAIL ' + msg);
  }
}
function src(rel) {
  const p = fileURLToPath(new URL('../src/' + rel, import.meta.url));
  ok(existsSync(p), '文件存在: ' + rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}
function hasAll(s, arr) {
  return arr.every((x) => s.includes(x));
}
function hasNone(s, arr) {
  return arr.every((x) => !s.includes(x));
}

const home = src('pages/HomePage.tsx');
const sidebar = src('components/Sidebar.tsx');
const header = src('components/Header.tsx');
const app = src('App.tsx');
const grammarDaily = src('pages/GrammarDailyPage.tsx');
const grammarFree = src('pages/GrammarPage.tsx');
const writing = src('pages/WritingPage.tsx');
const writingStore = src('store/useWritingStore.ts');
const rehydrate = src('store/rehydrateStores.ts');
const scoped = src('store/userScopedStorage.ts');
const examMode = src('utils/examMode.ts');
const sync = src('utils/sync.ts');

// 首页：六个能力入口，按词汇→语法→阅读→听力→口语→作文排列
const featureBlock = home.slice(home.indexOf('const features = ['), home.indexOf('];', home.indexOf('const features = [')));
const order = ['/vocabulary', '/grammar-daily', '/reading', '/listening', '/speaking', '/writing'];
const positions = order.map((p) => featureBlock.indexOf(`to: '${p}'`));
ok(positions.every((p) => p >= 0), '首页六个能力入口齐全');
ok(positions.every((p, i) => i === 0 || p > positions[i - 1]), '首页能力入口顺序：词汇→语法→阅读→听力→口语→作文');
ok((featureBlock.match(/to: '/g) || []).length === 6, '首页主网格恰好 6 张卡，不多不少');
ok(hasNone(featureBlock, ['/plan-today', '/study-plan']), '备考两个综合入口不在首页主网格');
ok(home.includes("to: '/writing'") && home.includes('navigate(\'/writing\')'), '首页卡片与欢迎横幅都有作文入口');
ok(!home.includes("navigate('/grammar')"), '首页不再把自由刷题 /grammar 当独立语法入口');
ok(!home.includes('📆 每日打卡'), '首页欢迎横幅删掉笼统的「每日打卡」按钮');
ok(home.includes('学习能力') && home.includes('备考模式（进阶）'), '首页分区标题与备考模式区块存在');
ok(home.includes('setExamMode(true)') && home.includes('setExamMode(false)'), '首页可开启/关闭备考模式');

// 侧栏：一科一入口，备考条件化
const baseBlock = sidebar.slice(sidebar.indexOf('const baseMenuItems'), sidebar.indexOf('const examMenuItems'));
const examBlock = sidebar.slice(sidebar.indexOf('const examMenuItems'), sidebar.indexOf('export default function Sidebar'));
ok(baseBlock.includes("to: '/writing'"), '侧栏有作文入口');
ok(!baseBlock.includes("to: '/grammar'"), '侧栏不再并列「语法学习 / 每日语法」两项');
ok(hasAll(baseBlock, ['/vocabulary', '/grammar-daily', '/reading', '/listening', '/speaking']), '侧栏五个既有能力入口齐全');
ok(hasAll(examBlock, ['/plan-today', '/study-plan']), '侧栏备考两项集中在 examMenuItems');
ok(sidebar.includes('examOn ? [...baseMenuItems, ...examMenuItems] : baseMenuItems'), '侧栏备考入口受开关控制');
ok(sidebar.includes('EXAM_MODE_EVENT'), '侧栏订阅开关变化事件');

// 路由与语法合并
ok(app.includes('<Route path="/writing"'), 'App 注册 /writing 路由');
ok(grammarDaily.includes("navigate('/grammar')") && grammarDaily.includes('自由刷题'), '语法打卡页内有「自由刷题」二级入口');
ok(grammarFree.includes("navigate('/grammar-daily')"), '自由刷题页返回语法主页，不再返回首页');

// 作文独立页：复用现有资产，不引入综合打卡
ok(hasAll(writing, ['WRITING_PROMPTS', 'gradeWriting', 'gradeWritingWithLLM', 'useWritingStore']), '作文页复用题库 + 规则批改 + AI 细评 + 存档');
ok(writing.includes('drafts[initialId]') && writing.includes('saveDraft'), '作文页有草稿自动保存与恢复');
ok(writing.includes('addEntry') && writing.includes('updateEntry'), '作文页有首次存档与同篇覆盖更新');
ok(writing.includes('我的作文') && writing.includes('openFromArchive'), '作文页有档案复看与重写入口');
// 注释里会写「不做每日打卡」，所以只查真正会引用的打卡 API 与展示字段
ok(hasNone(writing, ['isTodayDone', 'completeCheckin', 'checkinDates', '🔥 连续', 'todayString()']), '作文页不调用打卡状态 / 不显示连续天数');
ok(writing.includes('min-w-0') && writing.includes('break-words') && writing.includes('flex-wrap'), '作文页有窄屏防溢出措施');
ok(hasNone(writing, ['useDailyCheckinStore', 'usePlanStore']), '作文页不挂靠打卡/备考状态');

// 存档层：本机按账号分片，不进云同步
ok(writingStore.includes("name: 'ket-writing-v1'") && writingStore.includes('userScopedStorage'), '作文存档按用户分片持久化');
ok(writingStore.includes('partialize') && writingStore.includes('drafts'), '作文存档含全文、报告与逐题草稿');
// 注释里提到过 sync/packPayload，所以只查真实调用形态
ok(hasNone(writingStore, ["from '../utils/sync'", "from './sync'", 'syncPush(', 'mergePayload(']), '作文存档不接云同步');
ok(rehydrate.includes('useWritingStore.persist.rehydrate()'), '切换账号时作文存档会重新载入，不串号');
ok(scoped.includes("'ket-writing-v1'"), '分片键清单收录作文存档');
ok((scoped.match(/'ket-[a-z-]+-v1'/g) || []).length === 5, '分片键清单恰好 5 个 store');
ok(hasNone(sync, ['writing', 'ket-writing-v1']), '云同步 payload 未被误加入作文数据');

// 备考开关：默认关闭，三处联动
ok(examMode.includes("=== '1'") && examMode.includes('let fallback = false'), '备考模式默认关闭');
ok(examMode.includes('EXAM_MODE_EVENT') && examMode.includes('dispatchEvent'), '开关变化会广播事件');
ok(header.includes('setExamMode(e.target.checked)') && header.includes('checked={examOn}'), '个人中心有备考开关');
ok(header.includes('EXAM_MODE_EVENT'), '个人中心订阅开关变化事件');
ok(home.includes('EXAM_MODE_EVENT') && sidebar.includes('EXAM_MODE_EVENT'), '首页与侧栏都订阅开关变化');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
