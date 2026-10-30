#!/usr/bin/env bash
# KETZXT LLM 后端一键部署（Cloudflare Pages Functions）
#
# 用法：
#   bash deploy-pages.sh              # 完整部署（项目不存在会自动创建）
#   bash deploy-pages.sh --check      # 只检查环境
#   bash deploy-pages.sh --verify     # 只验证线上
#
# 部署地址：https://ketzxt-api.pages.dev
# 注意：*.pages.dev 在国内可能被干扰（实测超时），如需国内稳定访问请绑自定义域名
#       或改用腾讯云 EdgeOne Pages。

set -euo pipefail

cd "$(dirname "$0")"

PROJECT="ketzxt-api"
HEALTH_URL="https://${PROJECT}.pages.dev/api/health"

echo "=============================================="
echo " KETZXT LLM 后端部署"
echo " 项目: ${PROJECT}"
echo " 地址: https://${PROJECT}.pages.dev"
echo "=============================================="

# ---------- 1) 环境检查 ----------
echo ""
echo "[1/4] 检查环境..."
command -v node >/dev/null 2>&1 || { echo "  ❌ 未找到 node（需 Node 18+）"; exit 1; }
echo "  ✅ node $(node -v)"
npx wrangler --version >/dev/null 2>&1 || { echo "  ❌ 未找到 wrangler，请先执行: npm install"; exit 1; }
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
  echo "     （浏览器会弹出授权页，点 Authorize 即可）"
  exit 1
fi
ACCOUNT=$(echo "$WHOAMI_OUT" | grep -oE '[0-9a-f]{32}' | head -1)
echo "  ✅ 已登录  Account: ${ACCOUNT:-unknown}"

# ---------- 3) 部署 ----------
if [ "${1:-}" != "--verify" ]; then
  echo ""
  echo "[3/4] 部署..."

  # 项目不存在则创建（Pages 项目名全局唯一，只需创建一次）
  if ! npx wrangler pages project list 2>/dev/null | grep -q "${PROJECT}"; then
    echo "  · 项目不存在，创建中..."
    npx wrangler pages project create "${PROJECT}" --production-branch main 2>&1 | grep -E "Successfully|error" || true
  else
    echo "  · 项目已存在"
  fi

  # 静态占位页（API 全在 functions/）
  mkdir -p public
  [ -f public/index.html ] || echo '<!doctype html><meta charset="utf-8"><title>ketzxt-api</title><p>API endpoint only. Health: /api/health' > public/index.html

  npx wrangler pages deploy public --project-name="${PROJECT}" --branch main --commit-dirty=true 2>&1 | grep -E "Deployment complete|Success|error|✘" || true
else
  echo ""
  echo "[3/4] 跳过部署（--verify 模式）"
fi

# ---------- 4) 验证 ----------
echo ""
echo "[4/4] 验证部署..."
HEALTH=""
for i in 1 2 3; do
  HEALTH=$(curl -sS -m 8 "${HEALTH_URL}" 2>/dev/null || echo "")
  [ -n "$HEALTH" ] && break
  sleep 5
done

if [ -z "$HEALTH" ]; then
  echo "  ⚠️  本机直连 ${HEALTH_URL} 无响应"
  echo ""
  echo "  可能原因（按概率排序）："
  echo "   1) *.pages.dev 在你当前网络被干扰 —— 实测本机直连超时，"
  echo "      但境外节点返回 200（服务本身是正常的）。用手机流量/4G 试一下。"
  echo "   2) 首次部署还在生效（等 1-2 分钟再试）"
  echo ""
  echo "  境外视角验证命令："
  echo "     curl 'https://check-host.net/check-http?host=${HEALTH_URL}&max_nodes=3'"
  exit 0
fi

echo "  ✅ 健康检查通过：${HEALTH}"
LLMA=$(echo "$HEALTH" | grep -o '"llm":[a-z]*' | cut -d: -f2)
ASR=$(echo "$HEALTH" | grep -o '"asr":[a-z]*' | cut -d: -f2)
MODE=$(echo "$HEALTH" | grep -o '"speechMode":"[a-z-]*"' | cut -d'"' -f4)
[ "$LLMA" = "true" ] && echo "     ✅ DeepSeek Key 已配置" || echo "     ⚠️  DeepSeek Key 未配置 → AI 批改不可用（会降级到规则批改）"
[ "$ASR" = "true" ] && echo "     ✅ SiliconFlow Key 已配置（云端转写）" || echo "     ⚠️  SiliconFlow Key 未配置 → 口语降级到浏览器识别"
echo "     转写模式: ${MODE:-unknown}"

echo ""
echo "=============================================="
echo " 部署完成"
echo " API: https://${PROJECT}.pages.dev"
echo ""
echo " 前端地址（GitHub Secret VITE_LLM_API_BASE）："
echo "   https://${PROJECT}.pages.dev"
echo "=============================================="
