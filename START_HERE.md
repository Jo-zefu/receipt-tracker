# 🚀 一键部署指南

## 快速开始（总共 15 分钟）

### 第一步：配置 Supabase（5 分钟）

运行配置脚本：

```bash
cd /Users/vivienne/Desktop/receipt-tracker
./setup-supabase.sh
```

脚本会引导你：
1. 访问 https://supabase.com 创建项目
2. 执行 SQL 脚本创建数据库表
3. 输入 Project URL 和 anon key
4. 自动验证连接

### 第二步：一键部署（10 分钟）

配置完成后，运行：

```bash
./full-deploy.sh
```

脚本会自动：
- ✅ 安装所有依赖
- ✅ TypeScript 编译检查
- ✅ 构建 Web 应用
- ✅ 部署后端到 Railway
- ✅ 部署前端到 Vercel
- ✅ 配置移动端 API

### 第三步：测试（2 分钟）

1. 访问显示的 Vercel URL
2. 上传票据图片测试
3. 移动端：`cd expo-native && npm start`

---

## 详细说明

### setup-supabase.sh
- 交互式配置 Supabase
- 验证 URL 和 Key 格式
- 自动测试连接
- 配置保存到 receipt-ocr/.env

### full-deploy.sh
- 一键执行所有部署步骤
- 自动处理 Railway 和 Vercel 登录
- 自动配置环境变量
- 更新移动端 API 地址

---

## 常见问题

### Q: Railway 需要付费吗？
A: 有免费额度，足够小项目使用

### Q: Vercel 需要付费吗？
A: 个人项目完全免费

### Q: Supabase 需要付费吗？
A: 免费版包含 500MB 数据库和 1GB 存储

### Q: 部署失败怎么办？
A: 查看错误信息，通常是登录或网络问题

---

## 手动步骤（如果自动脚本失败）

### 手动配置 Supabase

```bash
# 编辑 .env
nano receipt-ocr/.env

# 添加：
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### 手动部署后端

```bash
cd receipt-ocr
railway login
railway init
railway up
```

### 手动部署前端

```bash
cd web-app
vercel login
vercel --prod
```

---

**准备好了吗？开始吧！**

```bash
./setup-supabase.sh
./full-deploy.sh
```
