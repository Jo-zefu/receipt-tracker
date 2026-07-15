#!/bin/bash

echo "🚀 Receipt Tracker - 快速启动脚本"
echo ""

# 检查 .env 文件
if [ ! -f "receipt-ocr/.env" ]; then
  echo "❌ 错误：receipt-ocr/.env 文件不存在"
  echo "请先配置 Supabase 环境变量："
  echo "  1. 复制 receipt-ocr/.env.example 为 receipt-ocr/.env"
  echo "  2. 填入你的 SUPABASE_URL 和 SUPABASE_ANON_KEY"
  echo "  3. 填入你的 BAIDU_API_KEY 和 BAIDU_SECRET_KEY"
  exit 1
fi

echo "✅ 环境变量配置已找到"
echo ""

# 安装依赖
echo "📦 安装后端依赖..."
cd receipt-ocr && npm install --silent && cd ..

echo "📦 安装 Web 前端依赖..."
cd web-app && npm install --silent && cd ..

echo "📦 安装移动端依赖..."
cd expo-native && npm install --silent && cd ..

echo ""
echo "✅ 依赖安装完成"
echo ""

# 启动服务
echo "🚀 启动服务..."
echo ""
echo "请在不同终端窗口运行以下命令："
echo ""
echo "  终端 1 - 后端服务："
echo "    cd receipt-ocr && npm run dev"
echo ""
echo "  终端 2 - Web 前端："
echo "    cd web-app && npm run dev"
echo ""
echo "  终端 3 - 移动端（可选）："
echo "    cd expo-native && npm start"
echo ""
echo "或者使用以下命令同时启动（需要安装 concurrently）："
echo "  npm install -g concurrently"
echo "  concurrently \"cd receipt-ocr && npm run dev\" \"cd web-app && npm run dev\""
echo ""
