# KETZXT LLM 后端

为「今日备考」提供大模型增强批改：写作批改 + 口语评分。
**API Key 存在 Secret / 环境变量里，前端永远拿不到。**

## ⚠️ 部署前必读：workers.dev 在国内被墙

实测（本机直连，非推测）：

| 域名 | DNS 解析 | 国内直连 |
|---|---|---|
| `*.workers.dev` | → `108.160.163.112`（**被污染**的 IP 段） | ❌ 超时不可达 |
| `*.pages.dev` | → `104.18.21.135`（Cloudflare 真实 IP） | ✅ 正常 |
| `github.io` | 正常 | ✅ 正常（对照） |

**结论：必须用 Pages Functions（`pages.dev`），不能用 Workers（`workers.dev`）。**
静态站继续留在 GitHub Pages，两者解耦。

## 架构

```
浏览器 (github.io/KETZXT)
   │  fetch {VITE_LLM_API_BASE}/api/grade-writing  /api/grade-speech
   ▼
Cloudflare Pages Functions  ←── Secret: DEEPSEEK_API_KEY / SILICONFLOW_API_KEY
   │
   ├─ 文本评分 → DeepSeek 官方 API（api.deepseek.com，deepseek-chat）
   └─ 语音转写 → SiliconFlow（FunAudioLLM/SenseVoiceSmall，免费）
```

## 模型分工（实测确定）

| 环节 | 用谁 |
|---|---|
| 写作批改 | DeepSeek `deepseek-chat`（内容切题度/语言质量/点评/建议/参考改写） |
| 口语评分 | DeepSeek `deepseek-chat`（内容/语法/流利度/词汇 四维） |
| 语音转写 | SiliconFlow `SenseVoiceSmall` |

⚠️ **DeepSeek 官方 API 不支持音频** —— 四条路径全试过：
- `audio_url` 消息类型 → `unknown variant 'audio_url'`
- `file` + `file_data` / `file_id` → 两者互相排斥
- `/files` 上传音频 → **`只支持 webp, png, jpeg, gif`**
- `/audio/transcriptions` → **404 Not Found**

→ 口语链路必须 `ASR → 文本 → LLM` 两步走。

**音频格式实测**（SiliconFlow 均能正确识别）：
- `webm/opus`（Chrome / 安卓 MediaRecorder）✅
- `mp4/aac`（Safari / iOS MediaRecorder）✅
- `mp3` ✅

## 降级设计（重要）

**LLM 是增强，不是依赖。** 任何环节失败都自动降级到本地规则引擎
（`ket-app/src/data/writingGrader.ts` 的要点覆盖 + 语法提示）：

| 情况 | 表现 |
|---|---|
| 后端没部署 / 网络不通 | 按钮显示「AI 批改暂不可用」，规则批改照常 |
| 没配 Key | 同上 |
| LLM 超时 / 返回异常 | 前端静默降级，规则批改照常 |
| 没配 SiliconFlow Key | 口语用浏览器自带识别结果兜底（UI 标注「浏览器识别，可能有误」） |

孩子不会因为网络问题做不了作业。

## 部署步骤

### 1. 登录 Cloudflare（一次性，浏览器授权）

```bash
cd C:/Users/Rywl0/WorkBuddy/KETZXT-fresh/worker
npx wrangler login
```

### 2. 创建 Pages 项目（只需一次）

在 https://dash.cloudflare.com → Workers & Pages → Create → Pages → 选 Empty，**项目名填 `ketzxt-api`**。

> 项目名必须与部署命令的 `--project-name` 一致，且**只能创建一次**（名字全局唯一）。

### 3. 配置 API Key（Secret，不进仓库）

Pages 项目的 Secret 在控制台设置：
**Workers & Pages → ketzxt-api → Settings → Environment variables → Add**

| 名称 | 值 | 必填 |
|---|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek 官方 key | ✅ 是 |
| `SILICONFLOW_API_KEY` | SiliconFlow key | ⭕ 否（不填则口语降级到浏览器识别） |

### 4. 部署

```bash
cd C:/Users/Rywl0/WorkBuddy/KETZXT-fresh/worker
npx wrangler pages deploy public --project-name=ketzxt-api
```

输出会给出地址，形如 `https://ketzxt-api.pages.dev`。

### 5. 前端配置

在 `ket-app/` 下建 `.env.production`（**不要提交**，已在 .gitignore）：
```
VITE_LLM_API_BASE=https://ketzxt-api.pages.dev
```

然后正常构建部署（GitHub Actions 会自动发布前端）。

> `VITE_` 前缀变量会打进前端产物 —— 只能放**地址**，绝不能放密钥。

### 6. 验证

```bash
curl https://ketzxt-api.pages.dev/api/health
# 期望：{"ok":true,"llm":true,"asr":true,"speechMode":"cloud-asr",...}
```

`llm:false` → DeepSeek Key 没配好；`asr:false` → SiliconFlow Key 没配好（口语会降级）。

## 备用方案：Workers + 自定义域名

如果不用 Pages，也可以用 Workers，但**必须绑自定义域名**（workers.dev 被墙）。
前提：有一个托管到 Cloudflare 的域名。

```bash
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put SILICONFLOW_API_KEY
npx wrangler deploy
# 然后在控制台 Settings → Domains & Routes → Add → Custom Domain
```

## 本地开发

```bash
# 终端 1：起 Worker（.dev.vars 里放 Key）
cd worker && npx wrangler pages dev public --port 8787

# 注意：Pages 项目必须用 `wrangler pages dev`，用 `wrangler dev` 会报
# "It looks like you've run a Workers-specific command in a Pages project."

# 终端 2：起前端（/llm 已配代理，自动转发到 127.0.0.1:8787）
cd ket-app && npx vite
```

`.dev.vars` 格式：
```
DEEPSEEK_API_KEY=sk-xxx
SILICONFLOW_API_KEY=sk-xxx
```

## 费用

- **DeepSeek**：按 token 计费。KET A2 级别短文/短句，单次约 500-1500 token，一天几十次成本可忽略。
- **SiliconFlow SenseVoiceSmall**：**免费**（需实名认证）。
- **Cloudflare Pages Functions**：免费额度足够个人/家庭使用。

## 常见问题

**Q：SiliconFlow 报 `Token is invalid`（code 30014）**
A：Key 无效。检查：① 账号是否完成实名认证（未认证无法调用任何模型）；② 是否复制完整（关页面即永久丢失）；③ 是否带入空格/换行（用复制按钮）。

**Q：国内访问不到 API（超时）**
A：用了 `workers.dev`。必须换 `pages.dev`（或绑自定义域名）—— 见文首「部署前必读」。

**Q：改了后端代码，前端没变化**
A：Pages Functions 要重新 `npx wrangler pages deploy`；前端改动要重新 build + 推送触发 Actions。
