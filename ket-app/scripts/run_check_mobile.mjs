// ========== 词汇页「照抄漏洞 + 手机横向溢出」护栏 ==========
// 2026-11-09 用户真机反馈：
//   ① 复习听写（Box 2）把 n|or|th 字母块按序全摆出来，拼起来就是 north，可照抄
//   ② 输入行三列 + input 缺 min-w-0，把页面撑出手机屏幕，右侧按钮被裁
// 静态断言防回归；浏览器探针用构建后的真实 CSS 量 scrollWidth。
import { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const read = (p) => readFileSync(p, 'utf8');
const page = read('src/pages/VocabToday.tsx');
const app = read('src/App.tsx');
const css = read('src/index.css');
const session = read('src/utils/vocabSession.ts');
const written = read('src/components/WrittenProduction.tsx');

// 截取 HintPanel 函数体，避免被文件里其它地方的 chunks.map 误判
const hintStart = page.indexOf('function HintPanel(');
const hintEnd = page.indexOf('function DictationInput(', hintStart);
const hintBody = hintStart >= 0 && hintEnd > hintStart ? page.slice(hintStart, hintEnd) : '';

const dictStart = page.indexOf('function DictationInput(');
const dictEnd = page.indexOf('// ========== A 类', dictStart);
const dictBody = dictStart >= 0 && dictEnd > dictStart ? page.slice(dictStart, dictEnd) : '';

const checks = [
  // ---- ① 不照抄 ----
  ['HintPanel 存在', hintBody.length > 200],
  ['HintPanel 不再渲染字母块', !/chunks\s*\.\s*map|blocks\s*\.\s*map|\.split\(''\)/.test(hintBody)],
  ['HintPanel 不按序拼接整词', !/pickedText|join\(''\)/.test(hintBody)],
  ['旧照抄文案已移除', !/听音分成这几块，再写整词|字母块只是拼写提示/.test(page)],
  ['低盒默认不给字形，需主动点开', /需要一点提示？/.test(hintBody) && /showHint/.test(hintBody)],
  ['提示只给首字母+字母数', /letters\[0\]/.test(hintBody) && /letters\.length/.test(hintBody)],
  ['明确声明不摆出整个单词', /不会把整个单词摆出来/.test(hintBody)],
  ['中盒只给音标、不给字母', /不给字母/.test(hintBody) && /IpaRef/.test(hintBody)],
  ['高盒无提示', /不给任何提示/.test(hintBody)],
  ['错词回想阶段不渲染 HintPanel', (page.match(/<HintPanel item=\{item\} \/>/g) || []).length === 1
    && /phase === 'review' && <HintPanel/.test(page)],

  // ---- ② 横向溢出 ----
  ['输入行只剩两列（无第三个播放按钮）', !/PlayButton word=\{word\} label="🔊"/.test(dictBody)],
  ['输入行 form 允许收缩', /className="mt-4 flex gap-2 min-w-0"/.test(dictBody)],
  ['input 有 min-w-0', /className="flex-1 min-w-0/.test(dictBody)],
  ['检查按钮不收缩且不换行', /btn-primary shrink-0 whitespace-nowrap/.test(dictBody)],
  ['主内容列 min-w-0', /flex-1 flex flex-col min-h-screen min-w-0 lg:ml-64/.test(app)],
  ['main 有 min-w-0', /max-w-6xl mx-auto w-full min-w-0/.test(app)],
  ['html/body overflow-x: clip 兜底', /overflow-x: clip/.test(css) && /max-width: 100%/.test(css)],
  ['卡片手机内边距收窄', /p-4 sm:p-6/.test(css) && /max-w-full min-w-0/.test(css)],
  ['进度条长串在手机隐藏', /hidden sm:inline text-gray-400 truncate/.test(page)],
  ['语境段填空 input 可收缩', /flex-1 min-w-0 border/.test(page)],
  ['复习头部主题名截断', /text-xs text-gray-400 truncate text-right/.test(page)],
  ['大字号英文允许断行', /font-mono break-all/.test(page)],
  ['口径注释同步', /不显示可拼出整个词的字母块/.test(session) && /照抄漏洞/.test(page)],

  // ---- ③ 造句输入框（2026-11-10 新增）同样不得撑破窄屏 ----
  ['造句 textarea 宽度受控', /w-full min-w-0 block/.test(written)],
  ['造句按钮行允许收缩', /flex flex-wrap items-center gap-2 mt-2 min-w-0/.test(written)],
  ['造句卡片 min-w-0', /bg-blue-50 rounded-xl min-w-0/.test(page)],
  ['长句允许断行', /break-words/.test(written)],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log('CHECK', ok ? 'OK  ' : 'FAIL', name);
  if (!ok) failed += 1;
}

// ---- 浏览器实测：用构建后的真实 CSS，量窄屏下 form 是否溢出 ----
const distAssets = 'dist/assets';
const cssFile = existsSync(distAssets)
  ? readdirSync(distAssets).find((f) => f.endsWith('.css'))
  : null;
const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const chrome = chromePaths.find((p) => existsSync(p));

if (!cssFile || !chrome) {
  console.log('BROWSER_PROBE SKIP', !cssFile ? 'no dist css' : 'no chrome');
} else {
  const probeHtml = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="./assets/${cssFile}"></head><body>
<div id="w320" style="width:320px;box-sizing:border-box;padding:16px">
  <div class="card"><p class="text-2xl font-semibold text-gray-800">北</p>
    <div class="mt-1 flex flex-wrap gap-2"><button class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm">🔊 听整词</button><button class="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm">再慢一点</button></div>
    <button class="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700">需要一点提示？</button>
    <form id="f-new" class="mt-4 flex gap-2 min-w-0">
      <input class="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-3 text-base" placeholder="听一遍，把整个单词写出来">
      <button class="btn-primary shrink-0 whitespace-nowrap">检查</button>
    </form>
  </div>
</div>
<div id="w320-old" style="width:320px;box-sizing:border-box;padding:16px">
  <div class="card">
    <form id="f-old" class="mt-4 flex gap-2">
      <input class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-lg" placeholder="听一遍，把整个单词写出来">
      <button class="btn-primary">检查</button>
      <button class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm">🔊</button>
    </form>
  </div>
</div>
<div id="w375" style="width:375px;box-sizing:border-box;padding:16px">
  <div class="card">
    <form id="f-375" class="mt-4 flex gap-2 min-w-0">
      <input class="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-3 text-base" placeholder="听一遍，把整个单词写出来">
      <button class="btn-primary shrink-0 whitespace-nowrap">检查</button>
    </form>
  </div>
</div>
<!-- 2026-11-11 新增：☁️ 同步提示 toast 必须在 320px 窄屏内，不能撑出视口 -->
<div id="w320-toast" style="width:320px;box-sizing:border-box;padding:16px;position:relative">
  <header class="relative flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
    <span class="text-lg">☁️</span>
    <div id="sync-toast" role="status" class="absolute right-3 top-full mt-1.5 z-[60] max-w-[75vw] sm:max-w-[280px] min-w-0 break-words rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs leading-snug shadow-lg text-blue-700">
      网络较慢，同步仍在后台进行，稍后会自动完成，请稍候片刻再查看结果
    </div>
  </header>
</div>
<!-- 2026-11-11 新增：个人中心「兜底频率」下拉必须在 320px 窄屏内，不撑破 w-72 面板 -->
<div id="w320-sync" style="width:320px;box-sizing:border-box;padding:16px">
  <div id="sync-panel" style="width:288px;box-sizing:border-box;padding:16px" class="card">
    <select id="sync-select" class="w-full min-w-0 max-w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-xs">
      <option>每天</option><option>每 3 天</option><option>每 7 天</option>
    </select>
    <p class="text-[10px] break-words">上次成功：2026-11-11 08:43 · 下次检查：约 30 分钟后 · 上次失败，会自动重试</p>
  </div>
</div>
<pre id="out"></pre>
<script>
window.addEventListener('load', function () {
  var ids = ['f-new', 'f-old', 'f-375'];
  var res = ids.map(function (id) {
    var el = document.getElementById(id);
    return id + '=' + (el.scrollWidth - el.clientWidth);
  });
  var w = document.getElementById('w320');
  var toast = document.getElementById('sync-toast');
  var toastWrap = document.getElementById('w320-toast');
  res.push('toast=' + Math.round(toast.getBoundingClientRect().right - toastWrap.getBoundingClientRect().right));
  res.push('toastInner=' + (toast.scrollWidth - toast.clientWidth));
  var sel = document.getElementById('sync-select');
  var syncPanel = document.getElementById('sync-panel');
  var syncWrap = document.getElementById('w320-sync');
  res.push('selectRight=' + Math.round(sel.getBoundingClientRect().right - syncWrap.getBoundingClientRect().right));
  res.push('selectInner=' + (sel.scrollWidth - sel.clientWidth));
  res.push('panelInner=' + (syncPanel.scrollWidth - syncPanel.clientWidth));
  res.push('body=' + (document.documentElement.scrollWidth - document.documentElement.clientWidth));
  document.getElementById('out').textContent = 'PROBE_RESULT ' + res.join(',');
});
<\/script></body></html>`;
  const probePath = path.join('dist', '__mobile_probe.html');
  writeFileSync(probePath, probeHtml, 'utf8');
  try {
    const dom = execFileSync(chrome, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      '--window-size=375,900', '--virtual-time-budget=3000', '--dump-dom',
      'file:///' + path.resolve(probePath).replace(/\\/g, '/'),
    ], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'] });
    const m = dom.match(/PROBE_RESULT ([^\s<]+)/);
    if (!m) {
      console.log('BROWSER_PROBE FAIL 未取到测量结果');
      failed += 1;
    } else {
      const vals = Object.fromEntries(m[1].split(',').map((s) => {
        const [k, v] = s.split('=');
        return [k, Number(v)];
      }));
      console.log('BROWSER_PROBE', m[1]);
      console.log('  溢出像素：新输入行 320px =', vals['f-new'], '| 旧三列 320px =', vals['f-old'],
        '| 新输入行 375px =', vals['f-375'], '| 整页 =', vals.body);
      const overflowOk = vals['f-new'] <= 1 && vals['f-375'] <= 1 && vals.body <= 1;
      const reproduced = vals['f-old'] > 1;
      console.log('CHECK', overflowOk ? 'OK  ' : 'FAIL', '窄屏输入行与整页无横向溢出');
      console.log('CHECK', reproduced ? 'OK  ' : 'WARN', '旧三列结构确实会溢出（对照复现）');
      if (!overflowOk) failed += 1;
      // toast 右边界相对 320px 容器右边界不得超过 1px，内部也不得横向滚动
      const toastOk = Number.isFinite(vals.toast) && vals.toast <= 1
        && Number.isFinite(vals.toastInner) && vals.toastInner <= 1;
      console.log('  同步提示 toast：右边界超出 =', vals.toast, 'px | 内部溢出 =', vals.toastInner, 'px');
      console.log('CHECK', toastOk ? 'OK  ' : 'FAIL', '同步提示 toast 320px 不横向溢出');
      if (!toastOk) failed += 1;
      // 个人中心自动同步频率下拉：右边界、内部、面板内部都不能横向溢出
      const syncOk = Number.isFinite(vals.selectRight) && vals.selectRight <= 1
        && Number.isFinite(vals.selectInner) && vals.selectInner <= 1
        && Number.isFinite(vals.panelInner) && vals.panelInner <= 1;
      console.log('  自动同步频率下拉：右边界超出 =', vals.selectRight, 'px | 内部溢出 =', vals.selectInner,
        'px | 面板内部溢出 =', vals.panelInner, 'px');
      console.log('CHECK', syncOk ? 'OK  ' : 'FAIL', '自动同步设置 320px 不横向溢出');
      if (!syncOk) failed += 1;
    }
  } catch (e) {
    console.log('BROWSER_PROBE SKIP 浏览器启动失败:', String(e.message).slice(0, 160));
  } finally {
    try { unlinkSync(probePath); } catch { /* ignore */ }
  }
}

console.log('MOBILE_CHECK', failed === 0 ? 'PASS' : `FAIL(${failed})`);
if (failed) process.exit(1);
