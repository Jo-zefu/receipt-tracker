#!/bin/bash

# 一键执行所有步骤直到上线
# 使用方法: ./full-deploy.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║         Receipt Tracker - 一键部署到生产环境                        ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ==================== 步骤 1: Supabase 配置 ====================
echo -e "${BLUE}[步骤 1/7] 检查 Supabase 配置...${NC}"

if ! grep -q "SUPABASE_URL" receipt-ocr/.env || ! grep -q "SUPABASE_ANON_KEY" receipt-ocr/.env; then
  echo -e "${YELLOW}⚠️  未检测到 Supabase 配置${NC}"
  echo ""
  echo "请先运行配置脚本："
  echo ""
  echo -e "  ${CYAN}./setup-supabase.sh${NC}"
  echo ""
  exit 1
fi

SUPABASE_URL=$(grep SUPABASE_URL receipt-ocr/.env | cut -d '=' -f2)
SUPABASE_KEY=$(grep SUPABASE_ANON_KEY receipt-ocr/.env | cut -d '=' -f2)

echo -e "${GREEN}✅ Supabase 配置已就绪${NC}"
echo -e "   URL: ${CYAN}$SUPABASE_URL${NC}"
echo ""

# ==================== 步骤 2: 安装依赖 ====================
echo -e "${BLUE}[步骤 2/7] 安装项目依赖...${NC}"

echo "   📦 安装后端依赖..."
cd receipt-ocr && npm install --silent && cd .. > /dev/null 2>&1

echo "   📦 安装 Web 前端依赖..."
cd web-app && npm install --silent && cd .. > /dev/null 2>&1

echo "   📦 安装移动端依赖..."
cd expo-native && npm install --silent && cd .. > /dev/null 2>&1

echo -e "${GREEN}✅ 所有依赖安装完成${NC}"
echo ""

# ==================== 步骤 3: 编译检查 ====================
echo -e "${BLUE}[步骤 3/7] TypeScript 编译检查...${NC}"

echo "   🔍 检查后端..."
cd receipt-ocr && npx tsc --noEmit && cd .. || {
  echo -e "${RED}❌ 后端编译失败${NC}"
  exit 1
}

echo "   🔍 检查 Web 前端..."
cd web-app && npx tsc --noEmit && cd .. || {
  echo -e "${RED}❌ Web 前端编译失败${NC}"
  exit 1
}

echo "   🔍 检查移动端..."
cd expo-native && npx tsc --noEmit && cd .. || {
  echo -e "${RED}❌ 移动端编译失败${NC}"
  exit 1
}

echo -e "${GREEN}✅ 编译检查全部通过${NC}"
echo ""

# ==================== 步骤 4: 构建 Web 应用 ====================
echo -e "${BLUE}[步骤 4/7] 构建 Web 应用...${NC}"

cd web-app && npm run build && cd .. || {
  echo -e "${RED}❌ Web 应用构建失败${NC}"
  exit 1
}

echo -e "${GREEN}✅ Web 应用构建成功${NC}"
echo ""

# ==================== 步骤 5: 安装部署工具 ====================
echo -e "${BLUE}[步骤 5/7] 检查部署工具...${NC}"

if ! command -v railway &> /dev/null; then
  echo "   📥 安装 Railway CLI..."
  npm install -g @railway/cli
fi

if ! command -v vercel &> /dev/null; then
  echo "   📥 安装 Vercel CLI..."
  npm install -g vercel
fi

echo -e "${GREEN}✅ 部署工具就绪${NC}"
echo ""

# ==================== 步骤 6: 部署后端到 Railway ====================
echo -e "${BLUE}[步骤 6/7] 部署后端到 Railway...${NC}"
echo ""

cd receipt-ocr

# 检查是否已登录 Railway
if ! railway whoami &> /dev/null; then
  echo -e "${YELLOW}请登录 Railway（将打开浏览器）${NC}"
  railway login
fi

# 检查是否已初始化项目
if [ ! -f ".railway/config.json" ] && [ ! -f "railway.json" ]; then
  echo -e "${YELLOW}初始化 Railway 项目...${NC}"
  railway init --name receipt-tracker-backend
fi

# 设置环境变量
echo "   🔧 配置环境变量..."
BAIDU_API_KEY=$(grep BAIDU_API_KEY .env | cut -d '=' -f2)
BAIDU_SECRET_KEY=$(grep BAIDU_SECRET_KEY .env | cut -d '=' -f2)

railway variables set BAIDU_API_KEY="$BAIDU_API_KEY" > /dev/null 2>&1
railway variables set BAIDU_SECRET_KEY="$BAIDU_SECRET_KEY" > /dev/null 2>&1
railway variables set SUPABASE_URL="$SUPABASE_URL" > /dev/null 2>&1
railway variables set SUPABASE_ANON_KEY="$SUPABASE_KEY" > /dev/null 2>&1
railway variables set PORT="3001" > /dev/null 2>&1

# 部署
echo "   🚀 正在部署后端..."
railway up

# 获取部署 URL
echo ""
echo -e "${YELLOW}正在获取后端 URL...${NC}"
BACKEND_URL=$(railway status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d '"' -f4)

if [ -z "$BACKEND_URL" ]; then
  echo -e "${YELLOW}自动获取失败，请手动输入后端 URL:${NC}"
  echo -e "${CYAN}(在 Railway Dashboard 查看，或运行: railway status)${NC}"
  read -p "> " BACKEND_URL
fi

cd ..

echo -e "${GREEN}✅ 后端部署完成${NC}"
echo -e "   URL: ${CYAN}$BACKEND_URL${NC}"
echo ""

# ==================== 步骤 7: 部署前端到 Vercel ====================
echo -e "${BLUE}[步骤 7/7] 部署前端到 Vercel...${NC}"
echo ""

cd web-app

# 检查是否已登录 Vercel
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}请登录 Vercel...${NC}"
  vercel login
fi

# 部署到生产环境
echo "   🚀 正在部署前端..."
FRONTEND_URL=$(vercel --prod -e VITE_API_URL="$BACKEND_URL" --yes 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

cd ..

echo -e "${GREEN}✅ 前端部署完成${NC}"
echo -e "   URL: ${CYAN}$FRONTEND_URL${NC}"
echo ""

# ==================== 更新移动端配置 ====================
echo -e "${BLUE}更新移动端 API 配置...${NC}"

# 更新 expo-native API 地址
sed -i.backup "s|const DEFAULT_BASE = '.*'|const DEFAULT_BASE = '$BACKEND_URL'|" expo-native/src/services/api.ts
rm -f expo-native/src/services/api.ts.backup

echo -e "${GREEN}✅ 移动端配置已更新${NC}"
echo ""

# ==================== 最终总结 ====================
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║                     🎉 部署完成！                                   ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}📱 访问地址:${NC}"
echo ""
echo -e "   ${GREEN}Web 应用:${NC}     $FRONTEND_URL"
echo -e "   ${GREEN}API 后端:${NC}     $BACKEND_URL"
echo -e "   ${GREEN}数据库:${NC}       $SUPABASE_URL"
echo ""
echo -e "${CYAN}📝 下一步:${NC}"
echo ""
echo "   1. 访问 Web 应用测试上传功能"
echo "   2. 移动端已配置完成，运行："
echo -e "      ${YELLOW}cd expo-native && npm start${NC}"
echo "   3. 使用 Expo Go 扫码测试移动端"
echo ""
echo -e "${CYAN}📚 重要链接:${NC}"
echo ""
echo "   • Railway Dashboard:  https://railway.app/dashboard"
echo "   • Vercel Dashboard:   https://vercel.com/dashboard"
echo "   • Supabase Dashboard: $SUPABASE_URL"
echo ""
echo -e "${GREEN}✨ 所有功能已上线并可以使用！${NC}"
echo ""
