# 📱 Receipt Tracker - 智能票据识别系统

一个基于 AI 的票据识别和管理系统，支持 Web 和移动端。

## ✨ 功能特点

- 🎯 **智能识别**：基于百度 AI OCR，自动识别票据信息
- 📊 **数据统计**：自动分类统计支出，可视化展示
- 🌐 **多平台支持**：Web 应用 + iOS/Android 移动应用
- 🌍 **多语言**：自动检测语言，中文显示 ¥，英文显示 $
- 💾 **云端存储**：数据持久化到 Supabase，永不丢失
- 📤 **数据导出**：支持导出 Excel 表格

## 🏗️ 技术栈

### 后端
- Node.js + Express + TypeScript
- 百度 AI OCR API（票据识别）
- Supabase（PostgreSQL 数据库 + 对象存储）
- ExcelJS（Excel 导出）

### Web 前端
- React + TypeScript
- Vite（构建工具）
- CSS3（响应式设计）

### 移动端
- React Native + Expo
- TypeScript
- Expo Camera + Image Picker

## 📁 项目结构

```
receipt-tracker/
├── receipt-ocr/          # 后端服务
│   ├── src/
│   │   ├── index.ts      # Express 服务器
│   │   ├── database.ts   # Supabase 集成
│   │   ├── baidu-ocr.ts  # 百度 OCR 调用
│   │   └── parser.ts     # 票据解析逻辑
│   └── supabase-schema.sql
│
├── web-app/              # Web 前端
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API 服务
│   │   └── i18n.ts       # 国际化
│   └── index.html
│
└── expo-native/          # 移动端
    ├── src/
    │   ├── screens/      # 页面
    │   ├── services/     # API 服务
    │   └── i18n/         # 国际化
    └── App.tsx
```

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- Supabase 账号（免费）
- 百度 AI 开放平台账号（免费）

### 1. 配置 Supabase

参考 [`receipt-ocr/SUPABASE_SETUP.md`](./receipt-ocr/SUPABASE_SETUP.md)

1. 创建 Supabase 项目
2. 执行数据库迁移（`supabase-schema.sql`）
3. 获取 API 凭证

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp receipt-ocr/.env.example receipt-ocr/.env

# 编辑 .env 文件，填入你的凭证
```

### 3. 启动项目

```bash
# 方式 1：使用启动脚本
./start.sh

# 方式 2：手动启动
# 终端 1 - 后端
cd receipt-ocr && npm install && npm run dev

# 终端 2 - Web 前端
cd web-app && npm install && npm run dev

# 终端 3 - 移动端（可选）
cd expo-native && npm install && npm start
```

### 4. 访问应用

- **后端 API**：http://localhost:3001
- **Web 应用**：http://localhost:5173
- **移动端**：扫描终端中的二维码

## 📱 移动端使用

### 开发测试

```bash
cd expo-native
npm start

# 使用 Expo Go 应用扫描二维码
# iOS: App Store 搜索 "Expo Go"
# Android: Google Play 搜索 "Expo Go"
```

### 打包发布

参考 [`DEPLOYMENT.md`](./DEPLOYMENT.md) 中的移动端部署章节。

## 🌐 部署到生产环境

详细部署指南请查看 [`DEPLOYMENT.md`](./DEPLOYMENT.md)

**推荐方案**：
- 后端：Railway（$5/月免费额度）
- Web 前端：Vercel（完全免费）
- 数据库：Supabase（500MB 免费）
- 移动端：Expo EAS Build（免费）

## 📖 API 文档

### POST /api/upload
上传票据图片，返回识别结果

**请求**：
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "receipts=@receipt.jpg"
```

**响应**：
```json
{
  "success": true,
  "receipts": [{
    "filename": "receipt.jpg",
    "vendor": "星巴克",
    "category": "餐饮",
    "amount": 45.00,
    "date": "2026-07-15",
    "confidence": "high"
  }],
  "summary": {
    "count": 1,
    "total": 45.00,
    "byCategory": { "餐饮": 45.00 }
  }
}
```

### GET /api/receipts
获取所有票据

### GET /api/export
导出 Excel

### DELETE /api/receipts
清空所有票据

## 🎨 界面预览

### Web 端
- **Dashboard**：统计卡片 + 饼图 + 最近票据
- **扫描页面**：多图上传 + 拖拽 + 实时识别
- **票据列表**：搜索 + 筛选 + 导出

### 移动端
- **首页**：统计卡片 + 分类饼图
- **扫描**：拍照 + 相册选择 + 实时识别
- **票据**：列表浏览 + 详情查看

## 🌍 多语言支持

- 自动检测浏览器/手机语言
- 中文：显示 ¥，隐藏税费列
- 英文：显示 $，显示税费列

## 🔧 开发

### 后端开发
```bash
cd receipt-ocr
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
```

### Web 前端开发
```bash
cd web-app
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
npm run preview # 预览生产版本
```

### 移动端开发
```bash
cd expo-native
npm start      # 启动 Expo
npm run android # 启动 Android 模拟器
npm run ios    # 启动 iOS 模拟器
```

## 🐛 故障排查

### 后端无法启动
- 检查 `.env` 文件是否配置正确
- 确认 Supabase 凭证有效
- 查看端口 3001 是否被占用

### 前端无法连接后端
- 确认后端已启动
- 检查 `VITE_API_URL` 配置
- 查看浏览器控制台网络请求

### 移动端无法连接
- 确保手机和电脑在同一网络
- 检查 `expo-native/src/services/api.ts` 中的 API 地址
- iOS 需要使用 HTTPS 或配置 App Transport Security

## 📝 待办事项

- [ ] 添加用户认证
- [ ] 支持多用户数据隔离
- [ ] 添加票据编辑功能
- [ ] 支持更多 OCR 引擎
- [ ] 添加数据备份功能
- [ ] 优化图片压缩

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开始使用**：查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解如何部署到生产环境。
