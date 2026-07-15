# 部署指南 - Receipt Tracker

本指南将帮助你把 Receipt Tracker 部署到生产环境。

## 架构概览

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Web App       │      │  Mobile App     │      │   Backend       │
│   (Vercel)      │─────▶│  (Expo/App      │─────▶│  (Railway)      │
│                 │      │   Store)        │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │   Supabase      │
                                                   │  - PostgreSQL   │
                                                   │  - Storage      │
                                                   └─────────────────┘
```

---

## 第一步：部署后端到 Railway

### 1.1 创建 Railway 账号

1. 访问 [https://railway.app](https://railway.app)
2. 使用 GitHub 账号登录

### 1.2 部署后端

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 进入后端目录
cd receipt-ocr

# 初始化项目
railway init

# 按提示操作：
# - Project name: receipt-tracker-backend
# - 选择 "Empty project"
```

### 1.3 配置环境变量

在 Railway Dashboard 中设置环境变量：

```bash
# 方式 1：使用 CLI
railway variables set BAIDU_API_KEY="your_baidu_api_key"
railway variables set BAIDU_SECRET_KEY="your_baidu_secret_key"
railway variables set SUPABASE_URL="https://xxxxx.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGc..."
railway variables set PORT="3001"

# 方式 2：在 Railway Dashboard 网页中添加
# Settings → Variables → Add Variable
```

### 1.4 部署

```bash
# 部署到 Railway
railway up

# 等待部署完成，会得到一个 URL：
# https://your-app.railway.app
```

### 1.5 测试后端

```bash
curl https://your-app.railway.app/api/receipts
# 应该返回：{"receipts":[],"summary":{"count":0,"total":0,"byCategory":{}}}
```

**保存你的后端 URL**，后面会用到！

---

## 第二步：部署 Web 前端到 Vercel

### 2.1 创建 Vercel 账号

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录

### 2.2 更新 API 配置

编辑 `web-app/src/services/api.ts`：

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### 2.3 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 进入 web-app 目录
cd web-app

# 部署
vercel

# 按提示操作：
# - Set up and deploy? Yes
# - Which scope? 选择你的账号
# - Link to existing project? No
# - Project name: receipt-tracker-web
# - Directory: ./
# - Override settings? No
```

### 2.4 配置环境变量

```bash
# 设置生产环境变量
vercel env add VITE_API_URL

# 输入值：https://your-app.railway.app
# 选择环境：Production

# 重新部署以应用环境变量
vercel --prod
```

你会得到一个 URL：`https://receipt-tracker-web.vercel.app`

### 2.5 更新 CORS 配置

回到后端 `receipt-ocr/src/index.ts`，更新 CORS：

```typescript
app.use(cors({
  origin: [
    'https://receipt-tracker-web.vercel.app',  // 你的 Vercel URL
    'http://localhost:5173',                    // 本地开发
  ],
  credentials: true
}));
```

重新部署后端：
```bash
cd receipt-ocr
railway up
```

---

## 第三步：配置移动端 API

### 3.1 更新 API 地址

编辑 `expo-native/src/services/api.ts`：

```typescript
const DEFAULT_BASE = 'https://your-app.railway.app'; // 替换为你的 Railway URL
```

### 3.2 测试移动端（本地）

```bash
cd expo-native
npm start

# 扫描二维码在手机上测试
```

---

## 第四步：发布移动应用（可选）

### 4.1 配置 EAS Build

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo
eas login

# 配置 EAS
cd expo-native
eas build:configure
```

### 4.2 构建 iOS 版本

```bash
# 构建 iOS
eas build --platform ios

# 提交到 TestFlight
eas submit --platform ios
```

**前提**：需要 Apple Developer 账号（$99/年）

### 4.3 构建 Android 版本

```bash
# 构建 Android APK/AAB
eas build --platform android

# 提交到 Google Play
eas submit --platform android
```

**前提**：需要 Google Play Developer 账号（$25 一次性）

---

## 环境变量总结

### Backend (Railway)
```env
BAIDU_API_KEY=your_key
BAIDU_SECRET_KEY=your_secret
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
PORT=3001
```

### Web App (Vercel)
```env
VITE_API_URL=https://your-app.railway.app
```

### Mobile App (app.json / .env)
```typescript
// 直接在代码中硬编码或使用 app.json extra
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-app.railway.app"
    }
  }
}
```

---

## 成本估算

| 服务 | 免费额度 | 付费价格 |
|------|---------|---------|
| Supabase | 500MB 数据库 + 1GB 存储 | $25/月起 |
| Railway | $5 免费额度/月 | 用多少付多少 |
| Vercel | 100GB 流量/月 | $20/月（Pro） |
| Expo EAS | 免费 Build | $29/月（无限 Build） |
| Apple Developer | - | $99/年 |
| Google Play | - | $25 一次性 |

**小项目完全免费！** 只有用户量大了才需要付费。

---

## 故障排查

### 问题：Railway 部署后访问 502

**解决**：检查环境变量是否正确设置，查看 Railway Logs

### 问题：Vercel 部署后 API 调用失败

**解决**：
1. 检查 `VITE_API_URL` 是否正确
2. 检查后端 CORS 配置
3. 在浏览器 DevTools 查看网络请求

### 问题：移动端无法连接 API

**解决**：
1. 确保手机和电脑在同一网络
2. 检查 API URL 是否使用 HTTPS
3. 检查手机是否开启了 VPN

---

## 下一步优化

- [ ] 添加用户认证（Supabase Auth）
- [ ] 添加 CDN 加速（Cloudflare）
- [ ] 设置自动备份
- [ ] 配置监控和告警
- [ ] 优化图片压缩

## 支持

遇到问题？检查：
1. Railway Logs: `railway logs`
2. Vercel Logs: Vercel Dashboard → Deployments → [your deployment] → Logs
3. Supabase Logs: Supabase Dashboard → Logs
