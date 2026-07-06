@echo off
chcp 65001 >nul
echo ================================
echo  KETZXT 自动部署脚本
echo ================================
echo.

cd /d C:\Users\Rywl0\WorkBuddy\2026-06-03-10-50-15

echo [1/5] 检查 Git 状态...
git status

echo.
echo [2/5] 添加 GitHub Actions 配置...
git add .github/workflows/deploy.yml

echo.
echo [3/5] 添加修改的代码文件...
git add ket-app/src/pages/ListeningPage.tsx
git add ket-app/src/pages/ReadingPage.tsx
git add ket-app/src/App.tsx

echo.
echo [4/5] 提交修改...
git commit -m "fix: 修复审计报告中的多个 Bug + 添加 GitHub Actions 自动部署

- BUG-2&3: 修复 Listening Part1/Part4 答案判定错误
- BUG-4: 修复 recordSession 正确数硬编码为 0
- BUG-1: 修复 Reading Part3-1 passage 分割格式
- ISSUE-7: BrowserRouter 改为 HashRouter
- 添加 GitHub Actions 自动部署到 GitHub Pages"

echo.
echo [5/5] 推送到 main 分支...
git push origin main

echo.
echo ================================
echo  完成！GitHub Actions 将自动部署
echo  访问: https://github.com/xjhod/KETZXT/actions
echo  查看部署进度
echo ================================
pause
