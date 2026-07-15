# ReceiptScan - 票据识别与管理系统

基于百度 OCR 的智能票据识别系统，支持 Web 端和移动端。

## 📁 项目结构

```
receipt-tracker/
├── receipt-ocr/        # Node.js 后端服务（百度 OCR + Excel 导出）
├── web-app/            # Web 前端应用（React + Vite）
└── expo-native/        # 移动端应用（React Native + Expo）
```

## ✨ 功能特性

### Web 端
- 📊 **Dashboard** - 支出统计概览、分类分析、最近活动
- 📸 **扫描上传** - 拖拽上传或选择图片，支持 JPG/PNG/HEIC
- 📋 **票据列表** - 搜索、筛选、分类管理
- 💾 **Excel 导出** - 一键导出所有票据数据（含图片）
- 🌍 **国际化** - 自动检测浏览器语言，支持中英文切换

### 移动端
- 📱 拍照或从相册选择票据
- 🤖 实时 OCR 识别（金额、商户、分类、日期）
- 📝 本地票据列表管理
- 🔄 下拉刷新、一键清空
- ⚙️ 服务器 IP 配置

## 🚀 快速开始

### 1. 配置百度 OCR API

在 `receipt-ocr/.env` 中填入你的百度 API 密钥：

```bash
BAIDU_API_KEY=your_api_key_here
BAIDU_SECRET_KEY=your_secret_key_here
```

获取方式：访问 [百度智能云控制台](https://console.bce.baidu.com/ai/#/ai/ocr/overview/index)

### 2. 启动后端服务

```bash
# 在项目根目录
npm run dev
```

后端运行在 `http://localhost:3001`

### 3. 启动 Web 应用

```bash
# 新开一个终端
npm run web
```

Web 应用运行在 `http://localhost:3000`

### 4. 启动移动端（可选）

```bash
npm run mobile
```

在移动端设置页面填入电脑的局域网 IP（如 `http://192.168.1.100:3001`）

## 📸 设计预览

Web 应用采用现代简洁设计：
- **All Receipts** - 表格式票据管理，支持搜索和分类筛选
- **Scan Receipt** - 大拖拽区域，支持文件选择和拍照
- **Dashboard** - 统计卡片和分类图表

## 🛠️ 技术栈

### 后端
- Node.js + Express
- 百度 OCR API
- ExcelJS（Excel 生成）
- Multer（文件上传）

### Web 前端
- React 18 + TypeScript
- React Router
- Vite
- i18next + react-i18next（国际化）
- CSS Modules

### 移动端
- React Native
- Expo
- Expo Camera & Image Picker
- React Navigation

## 📦 API 端点

- `POST /api/upload` - 上传票据图片并 OCR 识别
- `GET /api/receipts` - 获取所有票据列表
- `DELETE /api/receipts/:id` - 删除指定票据
- `GET /api/export` - 导出 Excel 文件

## 🌍 国际化 (i18n)

Web 应用支持自动语言检测：

- **自动检测浏览器语言**（`navigator.language`）
- **支持语言**：English (en) / 简体中文 (zh)
- **语言偏好**：自动保存到 localStorage

### 测试语言切换

浏览器控制台执行：
```javascript
// 切换到中文
localStorage.setItem('i18nextLng', 'zh')
location.reload()

// 切换到英文
localStorage.setItem('i18nextLng', 'en')
location.reload()
```

详细文档：查看 [I18N.md](./I18N.md)

## 🎨 设计系统

- 主色：黑色 `#000`
- 背景：白色 `#fff` / 浅灰 `#f8f9fa`
- 边框：`#e5e7eb`
- 文字：`#000` / `#374151` / `#6b7280`
- 圆角：6-12px
- 阴影：轻微 0.05 透明度

## 📝 开发指南

```bash
# 后端开发
cd receipt-ocr
npm run dev

# Web 前端开发
cd web-app
npm run dev

# 移动端开发
cd expo-native
npm start
```

## 🔧 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- iOS/Android 开发环境（移动端）

## 📄 License

MIT
