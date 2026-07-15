#!/bin/bash

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
echo "║           Receipt Tracker - Supabase 快速配置                      ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 检查 .env 文件
if [ ! -f "receipt-ocr/.env" ]; then
  echo -e "${RED}❌ receipt-ocr/.env 不存在${NC}"
  exit 1
fi

# 检查是否已配置
if grep -q "SUPABASE_URL" receipt-ocr/.env; then
  echo -e "${YELLOW}⚠️  检测到已有 Supabase 配置${NC}"
  echo ""
  grep "SUPABASE_URL" receipt-ocr/.env
  grep "SUPABASE_ANON_KEY" receipt-ocr/.env | sed 's/\(SUPABASE_ANON_KEY=.\{20\}\).*/\1.../'
  echo ""
  read -p "是否重新配置？(y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}保持现有配置${NC}"
    exit 0
  fi
fi

echo -e "${BLUE}步骤 1/3: 获取 Supabase 凭证${NC}"
echo ""
echo "请按照以下步骤操作："
echo ""
echo "1. 打开浏览器访问: ${CYAN}https://supabase.com${NC}"
echo "2. 登录或注册（推荐使用 GitHub 登录）"
echo "3. 创建新项目："
echo "   - Name: ${GREEN}receipt-tracker${NC}"
echo "   - Database Password: 任意设置"
echo "   - Region: ${GREEN}Northeast Asia (Tokyo)${NC}"
echo "4. 等待项目创建（约 2 分钟）"
echo "5. 创建表结构："
echo "   - 点击左侧 ${CYAN}SQL Editor${NC}"
echo "   - 点击 ${CYAN}New Query${NC}"
echo "   - 复制 ${YELLOW}receipt-ocr/supabase-schema.sql${NC} 的内容"
echo "   - 粘贴并点击 ${CYAN}Run${NC}"
echo "   - 看到 'Success' 即可"
echo "6. 获取凭证："
echo "   - 点击左侧 ${CYAN}Settings${NC} → ${CYAN}API${NC}"
echo "   - 复制 ${YELLOW}Project URL${NC} 和 ${YELLOW}anon public key${NC}"
echo ""
echo -e "${YELLOW}按回车键继续...${NC}"
read

echo ""
echo -e "${BLUE}步骤 2/3: 输入凭证${NC}"
echo ""

# 输入 Supabase URL
while true; do
  echo -e "${CYAN}请输入 Supabase Project URL:${NC}"
  echo -e "${YELLOW}(形如: https://xxxxx.supabase.co)${NC}"
  read -p "> " SUPABASE_URL

  if [[ $SUPABASE_URL =~ ^https://[a-z0-9-]+\.supabase\.co$ ]]; then
    echo -e "${GREEN}✅ URL 格式正确${NC}"
    break
  else
    echo -e "${RED}❌ URL 格式不正确，请重新输入${NC}"
  fi
done

echo ""

# 输入 Supabase Anon Key
while true; do
  echo -e "${CYAN}请输入 Supabase anon public key:${NC}"
  echo -e "${YELLOW}(以 eyJhbGc 开头的长字符串)${NC}"
  read -p "> " SUPABASE_ANON_KEY

  if [[ $SUPABASE_ANON_KEY =~ ^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$ ]]; then
    echo -e "${GREEN}✅ Key 格式正确${NC}"
    break
  else
    echo -e "${RED}❌ Key 格式不正确，请重新输入${NC}"
  fi
done

echo ""
echo -e "${BLUE}步骤 3/3: 保存配置${NC}"
echo ""

# 备份原文件
cp receipt-ocr/.env receipt-ocr/.env.backup
echo -e "${GREEN}✅ 已备份原配置文件到 .env.backup${NC}"

# 更新 .env 文件
if grep -q "SUPABASE_URL" receipt-ocr/.env; then
  # 更新现有配置
  sed -i.tmp "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" receipt-ocr/.env
  sed -i.tmp "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" receipt-ocr/.env
  rm receipt-ocr/.env.tmp
else
  # 添加新配置
  echo "" >> receipt-ocr/.env
  echo "SUPABASE_URL=$SUPABASE_URL" >> receipt-ocr/.env
  echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> receipt-ocr/.env
fi

echo -e "${GREEN}✅ 配置已保存到 receipt-ocr/.env${NC}"
echo ""

# 验证配置
echo -e "${BLUE}验证配置...${NC}"
echo ""
echo "当前配置："
echo -e "${CYAN}SUPABASE_URL:${NC} $SUPABASE_URL"
echo -e "${CYAN}SUPABASE_ANON_KEY:${NC} ${SUPABASE_ANON_KEY:0:20}..."
echo ""

# 测试连接
echo -e "${YELLOW}正在测试 Supabase 连接...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/receipts?limit=1")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Supabase 连接成功！${NC}"
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                                    ║${NC}"
  echo -e "${GREEN}║                   🎉 Supabase 配置完成！                            ║${NC}"
  echo -e "${GREEN}║                                                                    ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${CYAN}下一步：运行部署脚本${NC}"
  echo ""
  echo "  ./deploy.sh"
  echo ""
else
  echo -e "${RED}❌ 连接测试失败 (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "可能的原因："
  echo "1. URL 或 Key 不正确"
  echo "2. 未执行 supabase-schema.sql 创建表"
  echo "3. 网络问题"
  echo ""
  echo "请检查配置后重新运行此脚本"
  echo ""
  echo "恢复备份: mv receipt-ocr/.env.backup receipt-ocr/.env"
fi
