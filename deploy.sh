#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   Receipt Tracker - 自动部署脚本                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 .env 文件
echo -e "${BLUE}[1/7] 检查环境配置...${NC}"
if [ ! -f "receipt-ocr/.env" ]; then
  echo -e "${RED}❌ receipt-ocr/.env 不存在${NC}"
  exit 1
fi

# 检查 Supabase 配置
if ! grep -q "SUPABASE_URL" receipt-ocr/.env; then
  echo -e "${YELLOW}⚠️  需要先配置 Supabase${NC}"
  echo ""
  echo "请按以下步骤操作："
  echo ""
  echo "1️⃣  访问 https://supabase.com 并登录"
  echo "2️⃣  创建新项目（名称：receipt-tracker）"
  echo "3️⃣  在 SQL Editor 中执行 receipt-ocr/supabase-schema.sql"
  echo "4️⃣  在 Settings → API 获取："
  echo "     - Project URL"
  echo "     - anon public key"
  echo "5️⃣  编辑 receipt-ocr/.env，添加："
  echo ""
  echo "     SUPABASE_URL=https://xxxxx.supabase.co"
  echo "     SUPABASE_ANON_KEY=eyJhbGc..."
  echo ""
  echo "完成后重新运行此脚本"
  exit 0
fi

echo -e "${GREEN}✅ 环境配置完成${NC}"
echo ""

# 安装依赖
echo -e "${BLUE}[2/7] 安装项目依赖...${NC}"
cd receipt-ocr && npm install --silent && cd .. || exit 1
cd web-app && npm install --silent && cd .. || exit 1
cd expo-native && npm install --silent && cd .. || exit 1
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 编译检查
echo -e "${BLUE}[3/7] TypeScript 编译检查...${NC}"
cd receipt-ocr && npx tsc --noEmit && cd .. || exit 1
cd web-app && npx tsc --noEmit && cd .. || exit 1
cd expo-native && npx tsc --noEmit && cd .. || exit 1
echo -e "${GREEN}✅ 编译检查通过${NC}"
echo ""

# 构建 Web 应用
echo -e "${BLUE}[4/7] 构建 Web 应用...${NC}"
cd web-app && npm run build && cd .. || exit 1
echo -e "${GREEN}✅ Web 应用构建完成${NC}"
echo ""

# 检查 Railway CLI
echo -e "${BLUE}[5/7] 检查部署工具...${NC}"
if ! command -v railway &> /dev/null; then
  echo -e "${YELLOW}⚠️  Railway CLI 未安装，正在安装...${NC}"
  npm install -g @railway/cli
fi

if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}⚠️  Vercel CLI 未安装，正在安装...${NC}"
  npm install -g vercel
fi
echo -e "${GREEN}✅ 部署工具就绪${NC}"
echo ""

# Railway 部署
echo -e "${BLUE}[6/7] 部署后端到 Railway...${NC}"
cd receipt-ocr
if [ ! -f "railway.json" ]; then
  echo -e "${YELLOW}请按照提示登录 Railway 并初始化项目${NC}"
  railway login
  railway init
fi

echo -e "${YELLOW}正在部署后端...${NC}"
railway up

echo ""
echo -e "${YELLOW}请在 Railway Dashboard 中设置环境变量：${NC}"
echo "railway variables set BAIDU_API_KEY=\"$(grep BAIDU_API_KEY .env | cut -d '=' -f2)\""
echo "railway variables set BAIDU_SECRET_KEY=\"$(grep BAIDU_SECRET_KEY .env | cut -d '=' -f2)\""
echo "railway variables set SUPABASE_URL=\"$(grep SUPABASE_URL .env | cut -d '=' -f2)\""
echo "railway variables set SUPABASE_ANON_KEY=\"$(grep SUPABASE_ANON_KEY .env | cut -d '=' -f2)\""
echo "railway variables set PORT=\"3001\""
echo ""
read -p "环境变量设置完成后，按回车继续..."

# 重新部署后端以应用环境变量
railway up

# 获取后端 URL
echo ""
echo -e "${YELLOW}请输入你的 Railway 后端 URL：${NC}"
read -p "例如: https://your-app.railway.app: " BACKEND_URL

cd ..
echo -e "${GREEN}✅ 后端部署完成${NC}"
echo ""

# Vercel 部署
echo -e "${BLUE}[7/7] 部署 Web 前端到 Vercel...${NC}"
cd web-app

# 设置环境变量
export VITE_API_URL="$BACKEND_URL"

echo -e "${YELLOW}正在部署前端...${NC}"
vercel --prod -e VITE_API_URL="$BACKEND_URL"

cd ..
echo -e "${GREEN}✅ 前端部署完成${NC}"
echo ""

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   🎉 部署完成！                                                    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}后端 URL:${NC} $BACKEND_URL"
echo -e "${GREEN}前端 URL:${NC} (查看 Vercel 输出)"
echo ""
echo "下一步："
echo "1. 更新移动端 API 地址: expo-native/src/services/api.ts"
echo "2. 测试 Web 应用功能"
echo "3. 测试移动端应用"
echo ""
