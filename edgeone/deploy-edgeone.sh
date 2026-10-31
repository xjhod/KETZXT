#!/usr/bin/env bash
# ============================================================
# KETZXT EdgeOne 后端部署脚本
#
# 用法：
#   ./deploy-edgeone.sh            # 部署（需先 edgeone login + makers link）
#   ./deploy-edgeone.sh --env      # 只同步环境变量
#
# 前置：
#   npm install -g edgeone
#   edgeone login            （选 China，浏览器授权）
#   edgeone makers link      （绑定项目 —— 需要用到 Blob 存储）
#   edgeone makers env set DEEPSEEK_API_KEY <key>
#   edgeone makers env set SILICONFLOW_API_KEY <key>
# ============================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "==> 检查 CLI"
if ! command -v edgeone >/dev/null 2>&1; then
  echo "未安装 edgeone CLI，请执行： npm install -g edgeone" >&2
  exit 1
fi
edgeone -v 2>&1 | tail -3

echo ""
echo "==> 部署"
# --site china：国内站点，避免落到境外节点导致国内访问慢
edgeone makers deploy --site china

echo ""
echo "==> 完成。请把上面输出的 Access URL 填到前端 VITE_LLM_API_BASE"
