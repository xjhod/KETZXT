#!/usr/bin/env bash
# KETZXT LLM 后端一键部署脚本
#
# 用法：
#   bash deploy-pages.sh              # 正常部署
#   bash deploy-pages.sh --check      # 只检查环境，不部署
#
# 前置：已在 https://dash.cloudflare.com 创建 Pages 项目（项目名 ketzxt-api），
#       并在 Settings → Environment variables 里配好两个 Key。

set -euo pipefail

cd "$(dirname "$0")"

PROJECT="ketzxt-api"
HEALTH_URL="https://${PROJECT}.pages.dev/api/health"

echo "=============================================="
echo " KETZXT LLM 后端部署"
echo " 项目: ${PROJECT}"
echo "=============================================="

# ---------- 1) 环境检查 ----------
echo ""
echo "[1/4] 检查环境..."
if ! command -v node >/dev/null 2>&1; then
  echo "  ❌ 未找到 node，请先安装 Node 18+"
  exit 1
fi
echo "  ✅ node $(node -v)"

if ! npx wrangler --version >/dev/null 2>&1; then
  echo "  ❌ 未找到 wrangler，请先执行: npm install"
  exit 1
fi
echo "  ✅ wrangler $(npx wrangler --version 2>/dev/null | tail -1)"

# ---------- 2) 登录检查 ----------
echo ""
echo "[2/4] 检查 Cloudflare 登录状态..."
WHOAMI_OUT=$(npx wrangler whoami 2>&1 || true)
if echo "$WHOAMI_OUT" | grep -qi "not authenticated"; then
  echo "  ❌ 未登录。请先执行："
  echo ""
  echo "     npx wrangler login"
  echo ""
  echo "     （浏览器会弹出授权页，授权完再跑本脚本）"
  exit 1
fi
echo "  ✅ 已登录"

if [ "${1:-}" = "--check" ]; then
  echo ""
  echo "✅ 环境检查通过（--check 模式，未部署）"
  echo ""
  echo "下一步："
  echo "  1) 控制台确认 Environment variables 已配好两个 Key"
  echo "  2) bash deploy-pages.sh"
  exit 0
fi

# ---------- 3) 部署 ----------
echo ""
echo "[3/4] 部署 Pages Functions..."
# public/ 只放一个占位页：API 走 functions/，静态资源无需求
mkdir -p public
if [ ! -f public/index.html ]; then
  echo '<!doctype html><meta charset="utf-8"><title>ketzxt-api</title><p>API endpoint only. See /api/health' > public/index.html
fi

npx wrangler pages deploy public --project-name="${PROJECT}"

# ---------- 4) 验证 ----------
echo ""
echo "[4/4] 验证部署..."
sleep 5
HEALTH=$(curl -sS -m 20 "${HEALTH_URL}" 2>/dev/null || echo "")

if [ -z "$HEALTH" ]; then
  echo "  ⚠️  暂时访问不到（可能是首次部署需要几十秒生效），稍后再试："
  echo "     curl ${HEALTH_URL}"
else
  echo "  ✅ 健康检查通过：${HEALTH}"
  LLMA=$(echo "$HEALTH" | grep -o '"llm":[a-z]*' | cut -d: -f2)
  ASR=$(echo "$HEALTH" | grep -o '"asr":[a-z]*' | cut -d: -f2)
  [ "$LLMA" = "true" ] && echo "     ✅ DeepSeek Key 已配置" || echo "     ⚠️  DeepSeek Key 未配置 → AI 批改不可用（会降级到规则批改）"
  [ "$ASR" = "true" ] && echo "     ✅ SiliconFlow Key 已配置（云端转写）" || echo "     ⚠️  SiliconFlow Key 未配置 → 口语降级到浏览器识别"
fi

echo ""
echo "=============================================="
echo " 部署完成"
echo " API 地址: https://${PROJECT}.pages.dev"
echo ""
echo " 前端还需（一次性，勿提交）："
echo "   echo 'VITE_LLM_API_BASE=https://${PROJECT}.pages.dev' > ../ket-app/.env.production"
echo "   然后正常构建推送即可"
echo "=============================================="
