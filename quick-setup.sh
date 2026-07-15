#!/bin/bash

# 简单的 Supabase 配置助手
# 使用方法: ./quick-setup.sh YOUR_SUPABASE_URL YOUR_ANON_KEY

if [ "$#" -ne 2 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║  Supabase 快速配置                                                 ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "使用方法:"
    echo ""
    echo "  ./quick-setup.sh <SUPABASE_URL> <ANON_KEY>"
    echo ""
    echo "示例:"
    echo ""
    echo "  ./quick-setup.sh https://abc123.supabase.co eyJhbGciOiJIUzI1..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 获取 Supabase 凭证的步骤："
    echo ""
    echo "1️⃣  访问 https://supabase.com 并登录"
    echo ""
    echo "2️⃣  创建新项目："
    echo "   • 项目名称: receipt-tracker"
    echo "   • 数据库密码: 任意设置"
    echo "   • 区域: Northeast Asia (Tokyo)"
    echo ""
    echo "3️⃣  在 SQL Editor 中执行 receipt-ocr/supabase-schema.sql"
    echo "   • 左侧菜单 → SQL Editor"
    echo "   • New Query"
    echo "   • 复制粘贴 supabase-schema.sql 内容"
    echo "   • 点击 Run"
    echo ""
    echo "4️⃣  获取凭证:"
    echo "   • 左侧菜单 → Settings → API"
    echo "   • 复制 Project URL"
    echo "   • 复制 anon public key"
    echo ""
    echo "5️⃣  运行此脚本:"
    echo "   ./quick-setup.sh <你的URL> <你的Key>"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

SUPABASE_URL=$1
ANON_KEY=$2

echo ""
echo "✅ 配置 Supabase..."

# 备份原文件
if [ -f "receipt-ocr/.env" ]; then
    cp receipt-ocr/.env receipt-ocr/.env.backup
    echo "   已备份 .env → .env.backup"
fi

# 更新或添加配置
if grep -q "SUPABASE_URL" receipt-ocr/.env 2>/dev/null; then
    sed -i.tmp "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" receipt-ocr/.env
    sed -i.tmp "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$ANON_KEY|" receipt-ocr/.env
    rm -f receipt-ocr/.env.tmp
else
    echo "" >> receipt-ocr/.env
    echo "SUPABASE_URL=$SUPABASE_URL" >> receipt-ocr/.env
    echo "SUPABASE_ANON_KEY=$ANON_KEY" >> receipt-ocr/.env
fi

echo "   已保存到 receipt-ocr/.env"
echo ""
echo "✅ 测试连接..."

# 测试连接
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/receipts?limit=1" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║              🎉 Supabase 配置成功！                                ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "下一步: 运行部署脚本"
    echo ""
    echo "  ./full-deploy.sh"
    echo ""
else
    echo ""
    echo "⚠️  连接测试失败 (HTTP $HTTP_CODE)"
    echo ""
    echo "可能的原因:"
    echo "  • URL 或 Key 不正确"
    echo "  • 未执行 supabase-schema.sql 创建表"
    echo ""
    echo "请检查配置后重试"
    echo ""
fi
