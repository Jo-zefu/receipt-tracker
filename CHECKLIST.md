# 🎯 部署清单 - 按顺序完成

## ☐ 第一步：Supabase 配置（10 分钟）

### 1.1 创建项目
- [ ] 访问 https://supabase.com
- [ ] 点击 "New Project"
- [ ] 项目名称：`receipt-tracker`
- [ ] 数据库密码：___________________（记下来！）
- [ ] 区域选择：Northeast Asia (Tokyo)
- [ ] 等待初始化完成

### 1.2 执行数据库迁移
- [ ] 进入项目 Dashboard
- [ ] 点击左侧 **SQL Editor**
- [ ] 点击 **New Query**
- [ ] 复制 `receipt-ocr/supabase-schema.sql` 内容
- [ ] 粘贴并点击 **Run**
- [ ] 确认显示 "Success"

### 1.3 获取凭证
- [ ] 点击左侧 **Settings** → **API**
- [ ] 复制 **Project URL**：___________________
- [ ] 复制 **anon public key**：___________________

### 1.4 配置环境变量
- [ ] 复制文件：`cp receipt-ocr/.env.example receipt-ocr/.env`
- [ ] 编辑 `receipt-ocr/.env`，填入：
  ```env
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_ANON_KEY=eyJhbGc...
  BAIDU_API_KEY=your_key
  BAIDU_SECRET_KEY=your_secret
  PORT=3001
  ```

---

## ☐ 第二步：本地测试（5 分钟）

### 2.1 安装依赖
```bash
cd receipt-ocr && npm install
cd ../web-app && npm install
cd ../expo-native && npm install
```

### 2.2 启动后端
```bash
cd receipt-ocr
npm run dev

# 应该看到：
# 🧾 票据识别服务已启动: http://localhost:3001
```

### 2.3 测试后端
```bash
# 新终端
curl http://localhost:3001/api/receipts

# 应该返回：
# {"receipts":[],"summary":{"count":0,"total":0,"byCategory":{}}}
```

### 2.4 启动 Web 前端
```bash
cd web-app
npm run dev

# 访问 http://localhost:5173
```

### 2.5 测试上传功能
- [ ] 在浏览器中打开 http://localhost:5173
- [ ] 点击 "Scan Receipt" 或 "New Receipt"
- [ ] 上传一张票据图片
- [ ] 确认识别结果显示
- [ ] 在 Supabase Dashboard → Table Editor → receipts 查看数据
- [ ] 在 Supabase Dashboard → Storage → receipts 查看图片

---

## ☐ 第三步：部署后端到 Railway（10 分钟）

### 3.1 安装 Railway CLI
```bash
npm install -g @railway/cli
```

### 3.2 登录并初始化
```bash
railway login
cd receipt-ocr
railway init

# 项目名称：receipt-tracker-backend
```

### 3.3 设置环境变量
```bash
railway variables set BAIDU_API_KEY="your_baidu_api_key"
railway variables set BAIDU_SECRET_KEY="your_baidu_secret_key"
railway variables set SUPABASE_URL="https://xxxxx.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGc..."
railway variables set PORT="3001"
```

### 3.4 部署
```bash
railway up
```

### 3.5 获取 URL
```bash
railway status

# 或在 Railway Dashboard 查看
# 复制你的后端 URL：___________________
# 形如：https://receipt-tracker-backend-production.up.railway.app
```

### 3.6 测试生产环境
```bash
curl https://your-app.railway.app/api/receipts
```

---

## ☐ 第四步：部署 Web 前端到 Vercel（5 分钟）

### 4.1 安装 Vercel CLI
```bash
npm install -g vercel
```

### 4.2 部署
```bash
cd web-app
vercel

# 按提示操作：
# - Link to existing project? No
# - Project name: receipt-tracker-web
# - Directory: ./
# - Override settings? No
```

### 4.3 设置环境变量
```bash
vercel env add VITE_API_URL

# 输入值：https://your-app.railway.app
# 选择环境：Production
```

### 4.4 生产部署
```bash
vercel --prod

# 复制你的前端 URL：___________________
# 形如：https://receipt-tracker-web.vercel.app
```

---

## ☐ 第五步：更新 CORS 配置（3 分钟）

### 5.1 更新后端 CORS
编辑 `receipt-ocr/src/index.ts`：
```typescript
app.use(cors({
  origin: [
    'https://receipt-tracker-web.vercel.app',  // 你的 Vercel URL
    'http://localhost:5173',
  ],
  credentials: true
}));
```

### 5.2 重新部署后端
```bash
cd receipt-ocr
railway up
```

---

## ☐ 第六步：测试生产环境（5 分钟）

### 6.1 测试 Web 应用
- [ ] 访问你的 Vercel URL
- [ ] 上传票据图片
- [ ] 确认识别成功
- [ ] 检查 Dashboard 显示统计
- [ ] 测试导出 Excel

### 6.2 验证数据持久化
- [ ] 在 Supabase Dashboard 查看 receipts 表
- [ ] 在 Supabase Storage 查看图片
- [ ] 刷新页面，数据依然存在

---

## ☐ 第七步：配置移动端（5 分钟）

### 7.1 更新 API 地址
编辑 `expo-native/src/services/api.ts`：
```typescript
const DEFAULT_BASE = 'https://your-app.railway.app';
```

### 7.2 本地测试
```bash
cd expo-native
npm start

# 使用 Expo Go 扫码测试
```

---

## ☐ 第八步：移动端打包发布（可选，需要开发者账号）

### 8.1 配置 EAS
```bash
npm install -g eas-cli
eas login
cd expo-native
eas build:configure
```

### 8.2 构建 iOS
```bash
eas build --platform ios
# 需要 Apple Developer 账号 ($99/年)
```

### 8.3 构建 Android
```bash
eas build --platform android
# 需要 Google Play Developer 账号 ($25 一次性)
```

---

## 📋 完成检查清单

### 功能测试
- [ ] Web 端可以上传多张图片
- [ ] 移动端可以拍照和选择相册
- [ ] OCR 识别正常工作
- [ ] 中文环境显示 ¥，无税费列
- [ ] 英文环境显示 $，有税费列
- [ ] Dashboard 统计准确
- [ ] Excel 导出成功
- [ ] 数据在刷新后依然存在

### 部署检查
- [ ] 后端已部署到 Railway
- [ ] Web 前端已部署到 Vercel
- [ ] Supabase 数据库可访问
- [ ] Supabase Storage 可访问
- [ ] CORS 配置正确
- [ ] 环境变量全部设置

---

## 🎉 完成！

所有步骤完成后，你将拥有：
- ✅ 生产环境的 Web 应用
- ✅ 生产环境的 API 后端
- ✅ 云端数据库和存储
- ✅ 可测试的移动端应用

### 重要 URL 记录

- **后端 API**：___________________
- **Web 应用**：___________________
- **Supabase URL**：___________________

### 下次启动命令

**本地开发**：
```bash
# 终端 1
cd receipt-ocr && npm run dev

# 终端 2
cd web-app && npm run dev

# 终端 3（可选）
cd expo-native && npm start
```

**部署更新**：
```bash
# 后端
cd receipt-ocr && railway up

# 前端
cd web-app && vercel --prod
```

---

遇到问题？查看 `DEPLOYMENT.md` 的故障排查章节。
