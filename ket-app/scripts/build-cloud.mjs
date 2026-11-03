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

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

// base 来源：BASE_PATH_FILE 指向一个只含 base 的文本文件
// （云平台部署时可以预先放好这个文件；默认读 base-path.txt）
const BASE_FILE = process.env.BASE_PATH_FILE || join(APP_DIR, 'base-path.txt');
let BASE = '/';
if (existsSync(BASE_FILE)) {
  BASE = readFileSync(BASE_FILE, 'utf8').trim();
}
if (!BASE.startsWith('/')) BASE = '/' + BASE;
if (!BASE.endsWith('/')) BASE = BASE + '/';

console.log(`[build-cloud] base 路径 = ${BASE}（来源: ${BASE_FILE}）`);

// 1) 写 .env.local —— vite.config.ts 优先读它，不受 shell 参数转换影响
writeFileSync(join(APP_DIR, '.env.local'), `BASE_PATH=${BASE}\n`, 'utf8');

// 2) 构建
const r = spawnSync('npx', ['vite', 'build'], {
  cwd: APP_DIR,
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
  shell: true,
});
if (r.status !== 0) {
  console.error('[build-cloud] 构建失败');
  process.exit(r.status || 1);
}

// 3) 校验产物：资源路径必须以 base 开头
const indexPath = join(APP_DIR, 'dist', 'index.html');
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

