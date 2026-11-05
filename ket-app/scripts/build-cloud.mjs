/**
 * 云端部署专用构建。
 *
 * 为什么不能直接 `vite build`：
 *   base 路径要靠环境变量传（/ 或 /KETZXT/），但云沙箱是 Linux，
 *   且部署工具上传时会排除 dist/ —— 所以必须在容器里现场构建一次。
 *
 * ⚠️ 为什么 base 不从环境变量读：
 *   本地 Windows + Git Bash 下 MSYS 会把命令行传入的 "/" 转成
 *   PortableGit 安装目录（实测 BASE_PATH=/ 变成了
 *   "C:/Users/.../PortableGit/"），路径被写进产物，线上全部 404。
 *   MSYS_NO_PATHCONV=1 救不了 —— 它同时会让脚本路径失效。
 *   → 一律走 .env 文件（Node 写文件不经过 shell，不受影响）。
 *
 * 步骤：
 *   1. 写 .env.local（base 从 BASE_PATH_FILE 指定的文件读）
 *   2. 调 vite build
 *   3. 校验产物路径确实是预期的（防止 base 又被写错，线上全 404）
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

// 构建输出目录：可用 BUILD_OUT_DIR 指定到别的盘。
// C 盘空间紧张时（构建会写几百 MB 临时文件），指到 E 盘更稳。
// ⚠️ vite 的 --outDir 是相对项目根解析的，所以这里统一转成相对路径。
const OUT_DIR_ABS = process.env.BUILD_OUT_DIR || join(APP_DIR, 'dist');
const OUT_DIR_REL = OUT_DIR_ABS.startsWith(APP_DIR)
  ? OUT_DIR_ABS.slice(APP_DIR.length).replace(/^[\\/]+/, '')
  : OUT_DIR_ABS;

// base 来源优先级（必须与 vite.config.ts 完全一致，否则两边算出来的
// base 不一样，产物路径校验会误报）：
//   1. BASE_PATH_FILE 环境变量 —— 部署时显式指定（CI 用它覆盖）
//   2. base-path.txt             —— 仓库内默认
//
// ⚠️ 这里**不读 .env.local** —— 它是本脚本写出去的输出文件（给 vite 传值用），
//    如果把它当输入读回来，就会读到上一次的残留值（实测：仓库 default 是 "/"
//    但上一次 CI 模拟写了 "/KETZXT/"，下一次构建就被带跑了）。
//    .env.local 只在 vite.config.ts 那一侧参与读取。
let BASE = '/';
let baseSource = '(default)';

if (process.env.BASE_PATH_FILE && existsSync(process.env.BASE_PATH_FILE)) {
  BASE = readFileSync(process.env.BASE_PATH_FILE, 'utf8').trim();
  baseSource = process.env.BASE_PATH_FILE;
} else {
  const repoFile = join(APP_DIR, 'base-path.txt');
  if (existsSync(repoFile)) {
    BASE = readFileSync(repoFile, 'utf8').trim();
    baseSource = repoFile;
  }
}

if (!BASE) BASE = '/';
if (!BASE.startsWith('/')) BASE = '/' + BASE;
if (!BASE.endsWith('/')) BASE = BASE + '/';

console.log(`[build-cloud] base 路径 = ${BASE}（来源: ${baseSource}）`);

// 1) 写 .env.local —— vite.config.ts 读它来拿 base，不受 shell 参数转换影响
//    （BASE_PATH_FILE 在子进程里会被清掉，见下方 childEnv）
writeFileSync(join(APP_DIR, '.env.local'), `BASE_PATH=${BASE}\n`, 'utf8');

// 2) 构建
//    BASE_PATH_FILE 在子进程里要清掉：vite.config.ts 的优先级里它最高，
//    而这里已经把确定的 base 写进 .env.local 了。让 vite 以 .env.local 为准，
//    两边算出来的 base 保证一致。
const childEnv = { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' };
delete childEnv.BASE_PATH_FILE;
delete childEnv.BASE_PATH;
delete childEnv.VITE_BASE_PATH;

const r = spawnSync('npx', ['vite', 'build', '--outDir', OUT_DIR_REL], {
  cwd: APP_DIR,
  stdio: 'inherit',
  env: childEnv,
  shell: true,
});
if (r.status !== 0) {
  console.error('[build-cloud] 构建失败');
  process.exit(r.status || 1);
}

// 3) 校验产物：资源路径必须以 base 开头
const indexPath = join(OUT_DIR_ABS, 'index.html');
if (!existsSync(indexPath)) {
  console.error('[build-cloud] dist/index.html 不存在');
  process.exit(1);
}
const html = readFileSync(indexPath, 'utf8');
const m = html.match(/src="([^"]*assets[^"]*)"/);
if (!m) {
  console.error('[build-cloud] 未在 index.html 里找到 assets 引用');
  process.exit(1);
}
const assetPath = m[1];
const expected = BASE === '/' ? '/assets/' : `${BASE}assets/`;
if (!assetPath.startsWith(expected)) {
  console.error(`[build-cloud] 产物路径错误：期望 ${expected}*，实际 ${assetPath}`);
  console.error('             线上会导致所有资源 404，必须中止');
  process.exit(1);
}
console.log(`[build-cloud] 产物路径校验通过: ${assetPath}`);

