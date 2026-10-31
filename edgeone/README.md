# KETZXT 后端（EdgeOne Pages）

后端从 Cloudflare Pages 迁到 EdgeOne Pages，原因是 **国内直连不通**。

## 为什么要迁

实测（绕过代理的国内直连，2026-10-31）：

| 目标 | 结果 | 耗时 |
|---|---|---|
| `ketzxt-api.pages.dev`（Cloudflare Pages） | **HTTP=000 超时** | 20s 超时 |
| `edgeone.cool`（EdgeOne） | HTTP=401（仅缺 token） | 0.63s |
| `api.deepseek.com` | HTTP=401 | 0.25s |

原来的 Cloudflare Pages 后端在大陆网络**根本连不上**，意味着国产安卓手机上
AI 批改（写作/口语）全部不可用。EdgeOne 是腾讯的产品，国内节点直连可用。

## 架构

```
GitHub Pages (前端静态站)
        │  fetch /api/*
        ▼
EdgeOne Pages (同一项目)
  ├── cloud-functions/api/health.ts       健康检查
  ├── cloud-functions/api/grade-writing.ts AI 写作批改
  ├── cloud-functions/api/grade-speech.ts  AI 口语评分
  └── cloud-functions/api/sync.ts          跨设备同步
        │
        ├── DeepSeek        (文本批改 / 口语评分)
        ├── SiliconFlow     (ASR 语音转文字)
        └── Blob            (同步数据存储，强一致读)
```

为什么全用 Cloud Functions 而不是 Edge Functions：

- Edge Functions 只给 200ms CPU，且 KV 仅 Edge 可用；跑 LLM + 收音频太紧
- Cloud Functions 是 Node 20、请求体 6MB、最长 120s，正好匹配 AI 批改与同步
- Blob SDK `@edgeone/pages-blob` 在 Node runtime 可用，且支持 `consistency: 'strong'`

## 接口

| 路径 | 方法 | 说明 |
|---|---|---|
| `/api/health` | GET | 返回 `llm`/`asr`/`speechMode`/`sync` 是否就绪 |
| `/api/grade-writing` | POST | 写作增强批改（DeepSeek） |
| `/api/grade-speech` | POST | 口语评分（SiliconFlow ASR → DeepSeek 评分） |
| `/api/sync` | POST | 跨设备同步（`op: 'login' \| 'push'`） |

### 同步接口的两阶段握手

PBKDF2 的盐是**账号级**而非设备级。若每台设备各自生成盐，派生出的哈希必然不同，
服务端无法校验，也就做不到「同一个账号在多台设备登录」。

```
阶段1: POST /api/sync { op:'login', name }
       → 服务端返回权威 salt（账号不存在则返回 needsRegister）

阶段2: POST /api/sync { op:'login', name, hash, salt }
       → hash = PBKDF2(密码, 权威盐)
       → 校验通过则返回 userId + 整包数据
```

## 部署

```bash
npm install -g edgeone
edgeone login            # 选择 China，浏览器授权
cd edgeone
edgeone makers link      # 绑定项目（需要用到 Blob 存储）
edgeone makers env set DEEPSEEK_API_KEY <你的 key>
edgeone makers env set SILICONFLOW_API_KEY <你的 key>
edgeone makers deploy
```

部署完成后把输出的地址填到前端 `VITE_LLM_API_BASE`（见 `ket-app/.env.production.example`）。

### 环境变量

| 变量 | 用途 | 必需 |
|---|---|---|
| `DEEPSEEK_API_KEY` | 写作批改 / 口语评分 | 是 |
| `SILICONFLOW_API_KEY` | 语音转文字（缺省则退回浏览器识别） | 否 |
| `ALLOWED_ORIGINS` | 允许的来源，逗号分隔；留空允许全部 | 否 |

## 安全

- API Key 只存在于服务端环境变量，前端永远拿不到
- 同步数据用 PBKDF2-HMAC-SHA256（10 万次迭代）派生哈希，服务端不存明文密码
- 每个用户一个独立随机盐
- 客户端比较用恒定时间比较（`safeEqual`），避免计时侧信道

## 本地验证

```bash
# 单元验证（合并策略 + 密码哈希）
node --experimental-strip-types --import ./register-ts-resolver.mjs verify-sync.mts

# 端到端联调（真实 HTTP -> 真实后端）
SYNC_BASE=<后端地址> node --experimental-strip-types --import ./register-ts-resolver.mjs verify-sync-e2e.mts
```

> 匿名部署（`edgeone makers deploy --anonymous`）的站点需要 `eo_token` 换 cookie，
> 测试时需额外带 `SYNC_COOKIE` 环境变量。正式部署的域名无此限制。
