/**
 * 验证「音频 SW 缓存」链路在真实语义下成立。
 *
 * 背景（为什么不能直接加一条 CacheFirst）：
 *   - 浏览器用 <audio> 播放会发 Range: bytes=0- 请求
 *   - GitHub Pages 对此返回 206 Partial Content
 *   - workbox v7 只把 status 200 入缓存（workbox-strategies/StrategyHandler.ts:612）
 *   => 直接 CacheFirst：206 不入缓存 -> 每次仍走网络 -> 缓存完全失效
 *
 * 方案（vite.config.ts 中 audio 规则）：
 *   1) requestWillFetch 剥掉 Range 头 -> 服务器返回完整 200 -> 可入缓存
 *   2) 命中缓存时 RangeRequestsPlugin 把完整响应切片回 206 给浏览器
 *
 * 本脚本在 Node 里模拟 SW 环境，用与 vite.config.ts 相同的插件组合实跑。
 * 运行：node --experimental-strip-types verify-sw-audio.mts
 */

// ---------- SW 全局 mock（必须在 import workbox 之前定义）----------
const g = globalThis as any;

class FakeExtendableEvent {
  request: Request;
  pending: Promise<unknown>[] = [];
  constructor(request: Request) { this.request = request; }
  waitUntil(p: Promise<unknown>) { this.pending.push(p); }
  /** 等待所有后台任务（对应浏览器里 SW 生命周期结束前的等待） */
  async settle() { await Promise.all(this.pending); }
}
g.ExtendableEvent = FakeExtendableEvent;
g.FetchEvent = FakeExtendableEvent;

class FakeCache {
  store = new Map<string, { body: Buffer; headers: Record<string, string>; status: number }>();
  async match(req: Request) {
    const url = typeof req === 'string' ? req : req.url;
    const hit = this.store.get(url);
    if (!hit) return undefined;
    const res = new Response(hit.body, { status: hit.status, headers: hit.headers });
    Object.defineProperty(res, 'body', { value: hit.body });
    return res;
  }
  async put(req: Request, res: Response) {
    const url = typeof req === 'string' ? req : req.url;
    const buf = Buffer.from(await res.arrayBuffer());
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    this.store.set(url, { body: buf, headers, status: res.status });
  }
  async delete() { return true; }
}

const cacheStore = new Map<string, FakeCache>();
const cacheStorage = {
  async open(name: string) {
    if (!cacheStore.has(name)) cacheStore.set(name, new FakeCache());
    return cacheStore.get(name)!;
  },
  async match(req: Request) {
    for (const c of cacheStore.values()) {
      const hit = await c.match(req);
      if (hit) return hit;
    }
    return undefined;
  },
  async has() { return true; },
  async delete() { return true; },
  async keys() { return [...cacheStore.keys()]; },
};

g.caches = cacheStorage;
g.self = g; // workbox 内部走 self.caches.open()

g.location = new URL('https://xjhod.github.io/KETZXT/');
g.addEventListener = () => {};
g.skipWaiting = () => {};
g.clients = { claim: () => {}, matchAll: () => [] };
g.registration = { waiting: null, showNotification: () => {}, addEventListener: () => {} };
if (!g.WorkboxError) g.WorkboxError = class extends Error {};

// ---------- 网络模拟：GitHub Pages 对 Range 的真实行为 ----------
let networkCalls: { url: string; hadRange: boolean }[] = [];
let networkShouldFail = false;
const TOTAL = 100000; // 模拟 100KB 音频

async function fakeFetch(input: RequestInfo | URL): Promise<Response> {
  const req = input as Request;
  const url = typeof input === 'string' ? input : req.url;
  const hadRange = req.headers.has('range');
  networkCalls.push({ url, hadRange });

  if (networkShouldFail) throw new Error('network down');

  const body = Buffer.alloc(TOTAL);
  for (let i = 0; i < TOTAL; i++) body[i] = i % 256;

  if (hadRange) {
    // GitHub Pages 真实行为：返回 206 Partial Content
    return new Response(body, {
      status: 206,
      headers: {
        'Content-Type': 'audio/mp3',
        'Content-Length': String(TOTAL),
        'Content-Range': `bytes 0-${TOTAL - 1}/${TOTAL}`,
      },
    });
  }
  // 无 Range -> 完整 200
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mp3',
      'Content-Length': String(TOTAL),
      'Accept-Ranges': 'bytes',
    },
  });
}
g.fetch = fakeFetch;

// ---------- 载入 workbox ----------
const { CacheFirst } = await import('workbox-strategies/index.js');
const { RangeRequestsPlugin } = await import('workbox-range-requests/index.js');

let fail = 0;
const bad = (m: string) => { console.log('  ❌ ' + m); fail++; };
const ok = (m: string) => console.log('  ✅ ' + m);

// 与 vite.config.ts 中 audio 规则完全一致的插件组合
const stripRangePlugin = {
  requestWillFetch: async ({ request }: { request: Request }) => {
    if (!request.headers.has('range')) return request;
    const headers = new Headers(request.headers);
    headers.delete('range');
    return new Request(request, { headers });
  },
};

// 注意：这里刻意不挂 ExpirationPlugin —— 它依赖 indexedDB 记录时间戳做 LRU 淘汰，
// 与「缓存能否生效」这一核心结论无关，且 Node 下需模拟完整 IDB 事件接口（成本高）。
// 真实浏览器有原生 indexedDB，vite.config.ts 里的配置照常生效。
const makeStrategy = () => new CacheFirst({
  cacheName: 'audio-mp3',
  plugins: [stripRangePlugin as any, new RangeRequestsPlugin()],
});

const AUDIO_URL = 'https://xjhod.github.io/KETZXT/audio/gr-G01-1.mp3';
const makeRangeRequest = () => new Request(AUDIO_URL, { headers: { Range: 'bytes=0-' } });
const call = async (strategy: any, req: Request) => {
  const event = new FakeExtendableEvent(req);
  const res = await strategy.handle({ request: req, event } as any);
  // 等待 workbox 通过 waitUntil 派发的后台任务（如写缓存）完成
  await event.settle();
  return res;
};

console.log('=== 1) 首次请求（浏览器带 Range: bytes=0-，缓存未命中）===');
networkCalls = [];
{
  const req = makeRangeRequest();
  const res = await call(makeStrategy(), req);
  const buf = Buffer.from(await res.arrayBuffer());
  ok(`返回状态 ${res.status}`);
  if (res.status !== 200) bad(`期望 200（网络直取完整文件），实际 ${res.status}`);
  if (buf.length !== TOTAL) bad(`期望完整 ${TOTAL} 字节，实际 ${buf.length}`);
  else ok(`body 完整 ${buf.length} 字节`);

  const sentRange = networkCalls[0]?.hadRange;
  if (sentRange) bad('网络请求仍带 Range 头 -> 服务器返 206 -> 无法入缓存，规则失效');
  else ok('网络请求已剥离 Range 头（服务器返 200 完整文件）');
}

console.log('\n=== 2) 缓存是否真的存进去了 ===');
{
  const c = await cacheStorage.open('audio-mp3');
  const hit = await c.match(new Request(AUDIO_URL));
  if (!hit) bad('缓存里没有该音频 —— 规则未生效');
  else {
    const buf = Buffer.from(await hit.arrayBuffer());
    ok(`缓存命中，存了 ${buf.length} 字节`);
    if (buf.length !== TOTAL) bad(`缓存内容不完整: ${buf.length}`);
    else ok('缓存的是完整文件（200 全量），非 206 片段');
  }
}

console.log('\n=== 3) 第二次请求（网络已断，模拟国内弱网/离线）===');
networkShouldFail = true;
networkCalls = [];
{
  const req = makeRangeRequest();
  let res: Response | undefined;
  try {
    res = await call(makeStrategy(), req);
  } catch (e) {
    bad(`缓存未命中导致请求失败: ${String(e)}`);
  }
  if (res) {
    const buf = Buffer.from(await res.arrayBuffer());
    ok(`离线仍返回 ${res.status}，${buf.length} 字节`);
    if (res.status !== 206) bad(`期望 206（Range 切片），实际 ${res.status}`);
    else ok('命中缓存后按 Range 切片成 206');
    if (buf.length !== TOTAL) bad(`离线返回内容不完整: ${buf.length}`);
    else ok('离线内容完整可播放');
    const cr = res.headers.get('Content-Range');
    ok(`Content-Range: ${cr}`);
    if (!cr || !cr.startsWith(`bytes 0-${TOTAL - 1}/${TOTAL}`)) bad(`Content-Range 不正确: ${cr}`);
    if (networkCalls.length !== 0) bad('离线仍发了网络请求');
    else ok('完全未走网络');
  }
}

console.log('\n=== 4) 回归对照：不剥 Range 的朴素 CacheFirst（证明必要性）===');
{
  cacheStore.clear();
  networkShouldFail = false;
  networkCalls = [];
  const naive = new CacheFirst({ cacheName: 'audio-naive' });
  const req = makeRangeRequest();
  const res = await call(naive, req);
  const c = await cacheStorage.open('audio-naive');
  const hit = await c.match(new Request(AUDIO_URL));
  ok(`朴素 CacheFirst 返回 ${res.status}（这一次浏览器仍能播）`);
  if (hit) bad('朴素 CacheFirst 竟然缓存了 —— 与 workbox 源码结论不符，需复查');
  else ok('朴素 CacheFirst 确实没缓存（206 不入缓存）→ 证明「剥 Range」是必需的');
}

networkShouldFail = false;
console.log(fail === 0 ? '\n✅ 全部通过：音频缓存链路成立（首次入缓存、二次离线可播）' : `\n❌ ${fail} 处问题`);
process.exit(fail === 0 ? 0 : 1);
