// ========== AI 评分链路校验入口 ==========
// 背景（2026-11-08）：pickModel 取目录首个 hy4free（onlyReasoning），
// 流式输出全在 reasoning_content、content 恒空 -> 口语/写作 AI 评分必失败。
// 本脚本做三层验证：模型筛选纯函数 -> 静态接线 -> 线上真实模型端到端出 JSON。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

const failures = [];
const check = (name, cond, detail = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!cond) failures.push(name);
};

// ---- 1. 纯函数（rolldown 打包 modelPicker.ts，无 SDK 依赖） ----
const bundle = await rolldown({ input: 'src/utils/modelPicker.ts' });
const { output } = await bundle.generate({ format: 'esm' });
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
const { pickTextModel } = await import(dataUrl);

check('空目录返回 null', pickTextModel([]) === null);
check('非数组返回 null', pickTextModel(null) === null);
check('全是路由别名返回 null', pickTextModel([{ id: 'auto' }, { id: 'default' }]) === null);
check('disabled 模型被排除', pickTextModel([{ id: 'hy4free', disabled: true, onlyReasoning: true }]) === null);
check(
  '图像/视频模型被排除',
  pickTextModel([
    { id: 'hunyuan-image-alpha' },
    { id: 'kling-video-v3' },
    { id: 'minimax-video-h3' },
  ]) === null,
);
check(
  '跳过推理型，选普通文本模型',
  pickTextModel([
    { id: 'auto', onlyReasoning: true },
    { id: 'hy4free', onlyReasoning: true },
    { id: 'glm-4.6' },
  ])?.id === 'glm-4.6',
);
check(
  '偏好列表生效（hunyuan-chat 优先于 glm）',
  pickTextModel([
    { id: 'hy4free', onlyReasoning: true },
    { id: 'glm-4.6' },
    { id: 'hunyuan-chat' },
  ])?.id === 'hunyuan-chat',
);
check(
  '只剩推理型时不返回 null（llm.ts 另有兜底）',
  pickTextModel([{ id: 'hy4free', onlyReasoning: true }])?.id === 'hy4free',
);

// ---- 2. 静态接线断言 ----
const cloudSrc = readFileSync('src/utils/cloud.ts', 'utf8');
const llmSrc = readFileSync('src/utils/llm.ts', 'utf8');
const pageSrc = readFileSync('src/pages/SpeakingPage.tsx', 'utf8');
check('pickModel 改用 pickTextModel', /return pickTextModel\(models\)/.test(cloudSrc));
check('cloud.ts 不再直接取 usable[0]', !/usable\[0\]/.test(cloudSrc));
check('callLlmText 收集 reasoning_content', /delta\?\.reasoning_content/.test(llmSrc));
check('推理型兜底有明确失败原因', /模型只返回了思考内容/.test(llmSrc));
check('无文字时提示改为输入引导', /请在输入框打出你的英文回答/.test(llmSrc));
check('AI 评分异常会显示在界面', /AI 评分失败：/.test(pageSrc));
check('按钮文案区分无文字状态', /先在上方输入回答文字/.test(pageSrc));
check('评分按钮只认确认框文字', /answerText\.trim\(\) && !scoreResult && !llmSpeech/.test(pageSrc));
check('录音无识别结果有引导条', /浏览器没能识别出文字/.test(pageSrc));
check('两处 Part 复用同一评分面板', (pageSrc.match(/\{renderAiPanel\(\)\}/g) || []).length === 2);
check('确认框是唯一评分输入', /browserTranscript: textOnly/.test(pageSrc) && !/manualText/.test(pageSrc));

// ---- 3. 线上端到端：真实目录 -> 选中模型 -> 真的能吐出 JSON ----
const ENDPOINT = 'https://ketzxt-99302.app.workbuddy.host';
const KEY = 'wbpk_92CYDpX4u22mx02jLeALpq_o1YL5h9kH9nAzxEpZqaOWZJGTBXGOm1x';
const SHARE = 'sharecode=ILJMMGGVHE';
let models = null;
try {
  const r = await fetch(`${ENDPOINT}/.cloud/llm/models?${SHARE}`, {
    headers: { 'x-wb-webapp-access-key': KEY, Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  models = await r.json();
  check('线上模型目录可读', r.ok && Array.isArray(models), `HTTP ${r.status}, ${models?.length ?? 0} 个`);
} catch (e) {
  check('线上模型目录可读', false, e.message);
}

if (Array.isArray(models)) {
  const picked = pickTextModel(models);
  console.log('PICKED_MODEL', picked?.id, '| first in catalog:', models[0]?.id,
    '| first onlyReasoning:', models[0]?.onlyReasoning);
  check('选中的不是目录首个推理型模型', picked?.id !== 'hy4free', String(picked?.id));
  check('选中模型确实存在且非推理型',
    !!picked && models.some((m) => m.id === picked.id && m.onlyReasoning !== true),
    String(picked?.id));

  try {
    const body = {
      model: picked?.id,
      messages: [
        { role: 'system', content: 'You are a KET speaking examiner. Reply with JSON only.' },
        { role: 'user', content: 'Score this answer: I like playing football. Output {"score":80}' },
      ],
      max_tokens: 200,
      stream: true,
      response_format: { type: 'json_object' },
    };
    const r = await fetch(`${ENDPOINT}/.cloud/llm/chat/completions?${SHARE}`, {
      method: 'POST',
      headers: {
        'x-wb-webapp-access-key': KEY,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });
    const raw = await r.text();
    let content = '';
    let reasoning = '';
    for (const line of raw.split('\n')) {
      if (!line.startsWith('data:')) continue;
      const s = line.slice(5).trim();
      if (!s || s === '[DONE]') continue;
      try {
        const d = JSON.parse(s);
        const delta = d.choices?.[0]?.delta ?? {};
        content += delta.content ?? '';
        reasoning += delta.reasoning_content ?? '';
      } catch { /* 忽略非 JSON 帧 */ }
    }
    let parsed = null;
    try { parsed = JSON.parse(content.trim()); } catch { /* 交给断言 */ }
    console.log('LIVE_LLM', `HTTP ${r.status}`, `content=${content.trim().slice(0, 80)}`, `reasoningLen=${reasoning.length}`);
    check('评分接口 HTTP 200', r.ok, `HTTP ${r.status}`);
    check('模型返回了可用的 content（不是空的思考链）', content.trim().length > 0);
    check('content 是合法 JSON', parsed !== null && typeof parsed === 'object');
    check('JSON 里有 score 字段', typeof parsed?.score === 'number', `score=${parsed?.score}`);
  } catch (e) {
    check('线上评分端到端', false, e.message);
  }
}

console.log('CHECK SCRIPT FINISHED', failures.length === 0 ? 'PASS' : `FAIL (${failures.length})`);
for (const f of failures) console.log('FAILURE:', f);
if (failures.length) process.exit(1);
