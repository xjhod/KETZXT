# KETZXT LLM 后端（Cloudflare Worker）

为「今日备考」提供大模型增强批改：写作批改 + 口语评分。
**API Key 存在 Worker Secret 里，前端永远拿不到。**

## 架构

```
浏览器 (GitHub Pages)
   │  fetch /api/grade-writing  /api/grade-speech
   ▼
Cloudflare Worker  ←── Secret: DEEPSEEK_API_KEY / SILICONFLOW_API_KEY
   │
   ├─ 文本评分 → DeepSeek 官方 API（api.deepseek.com，deepseek-chat）
   └─ 语音转写 → SiliconFlow（FunAudioLLM/SenseVoiceSmall，免费）
```

## 模型分工（实测确定）

| 环节 | 用谁 | 说明 |
|---|---|---|
| 写作批改 | DeepSeek `deepseek-chat` | 内容切题度 / 语言质量 / 逐条点评 / 参考改写 |
| 口语评分 | DeepSeek `deepseek-chat` | 内容 / 语法 / 流利度 / 词汇 四维评分 |
| 语音转写 | SiliconFlow `SenseVoiceSmall` | **DeepSeek 官方 API 不支持音频** |

⚠️ DeepSeek 不支持音频是实测结论，不是文档推测：
- `audio_url` 消息类型 → `unknown variant 'audio_url'`
- `/files` 上传音频 → `只支持 webp, png, jpeg, gif`
- `/audio/transcriptions` 端点 → **404 Not Found**

## 降级设计（重要）

**LLM 是增强，不是依赖。** 任何环节失败都自动降级到本地规则引擎
（`ket-app/src/data/writingGrader.ts` 的要点覆盖 + 语法提示）：

| 情况 | 表现 |
|---|---|
| 后端没部署 / 网络不通 | 前端按钮显示「AI 批改暂不可用」，规则批改照常 |
| 没配 Key | 同上 |
| LLM 返回异常 / 超时 | 前端静默降级，规则批改照常 |
| 没配 SiliconFlow Key | 口语用浏览器自带识别结果兜底（UI 会标注「浏览器识别，可能有误」） |

孩子不会因为网络问题做不了作业。

## 部署步骤

### 1. 登录 Cloudflare（一次性，浏览器授权）

```bash
cd C:/Users/Rywl0/WorkBuddy/KETZXT-fresh/worker
npx wrangler login
```

### 2. 配置 API Key（Secret，不进仓库）

```bash
npx wrangler secret put DEEPSEEK_API_KEY
# 粘贴 DeepSeek key 后回车

npx wrangler secret put SILICONFLOW_API_KEY
# 粘贴 SiliconFlow key 后回车（没有就跳过 —— 会降级到浏览器识别）
```

也可以用 `.dev.vars` 文件（本地开发用，已被 .gitignore 忽略）：
```
DEEPSEEK_API_KEY=sk-xxx
SILICONFLOW_API_KEY=sk-xxx
```

### 3. 部署

```bash
npx wrangler deploy
```

输出会给出 Worker 地址，形如 `https://ketzxt-llm.<你的子域>.workers.dev`。

### 4. 前端配置

在 `ket-app/` 下建 `.env.production`：
```
VITE_LLM_API_BASE=https://ketzxt-llm.<你的子域>.workers.dev
```

然后正常构建部署（GitHub Actions 会自动发布）。

> 注意：`VITE_` 前缀的变量会被打进前端产物，这是**地址**不是密钥，安全。
> 密钥永远只在 Worker Secret 里。

### 5. 验证

```bash
curl https://ketzxt-llm.<你的子域>.workers.dev/api/health
# 期望：{"ok":true,"llm":true,"asr":true,"speechMode":"cloud-asr",...}
```

`llm:false` → DeepSeek Key 没配好；`asr:false` → SiliconFlow Key 没配好（口语会降级）。

## 本地开发

```bash
# 终端 1：起 Worker
cd worker && npx wrangler dev

# 终端 2：起前端（/llm 已配代理，自动转发到 127.0.0.1:8787）
cd ket-app && npx vite
```

## 费用

- **DeepSeek**：按 token 计费。KET A2 级别的短文/短句，单次调用约 500-1500 token，一天几十次调用成本可忽略。
- **SiliconFlow SenseVoiceSmall**：**免费**（需实名认证）。

## 常见问题

**Q：SiliconFlow 报 `Token is invalid`（code 30014）**
A：Key 无效。检查：① 账号是否完成实名认证（未认证无法调用任何模型）；② 是否复制完整（关页面即永久丢失）；③ 是否带入了空格/换行（用复制按钮）。

**Q：改了 Worker 代码，前端没变化**
A：Worker 是独立部署的，需要重新 `npx wrangler deploy`；前端改动则需要重新 build + 推送触发 Actions。
