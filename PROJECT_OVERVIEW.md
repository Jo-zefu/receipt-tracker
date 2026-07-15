# Receipt Tracker - 项目总览

一个完整的票据识别与管理系统，支持 Web 端和移动端，集成百度 OCR 实现自动识别。

## 🎯 项目特色

- ✅ **三端齐全**：后端 API + Web 应用 + 移动应用
- ✅ **智能识别**：百度 OCR 自动提取金额、日期、商户
- ✅ **国际化**：Web 端支持中英文自动切换
- ✅ **现代设计**：严格按照 Figma 设计稿实现
- ✅ **完整导出**：Excel 导出含图片嵌入

## 📁 项目结构

```
receipt-tracker/
│
├── receipt-ocr/              # 后端服务 (Node.js + Express)
│   ├── src/
│   │   ├── baidu-ocr.ts     # 百度 OCR API 集成
│   │   ├── parser.ts         # 智能数据解析
│   │   ├── server.ts         # RESTful API 服务器
│   │   └── types.ts          # TypeScript 类型定义
│   ├── uploads/              # 票据图片存储
│   └── .env                  # API 密钥配置
│
├── web-app/                  # Web 前端 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx    # 导航布局
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx # 统计仪表盘
│   │   │   ├── ScanReceipt.tsx # 扫描上传
│   │   │   └── AllReceipts.tsx # 票据列表
│   │   ├── i18n.ts          # 国际化配置
│   │   └── main.tsx          # 应用入口
│   └── I18N.md               # 国际化文档
│
├── expo-native/              # 移动端 (React Native + Expo)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── ScanScreen.tsx     # 拍照扫描
│   │   │   ├── ListScreen.tsx     # 票据列表
│   │   │   ├── StatsScreen.tsx    # 统计图表
│   │   │   └── SettingsScreen.tsx # 设置页面
│   │   └── services/
│   │       └── api.ts        # API 服务
│   └── App.tsx
│
├── CHANGELOG.md              # 更新日志
└── README.md                 # 项目文档
```

## 🚀 快速开始

### 1. 配置百度 OCR

创建 `receipt-ocr/.env` 文件：

```bash
BAIDU_API_KEY=your_api_key_here
BAIDU_SECRET_KEY=your_secret_key_here
```

获取密钥：访问 [百度智能云](https://console.bce.baidu.com/ai/#/ai/ocr/overview/index)

### 2. 启动项目

```bash
# 安装依赖（仅首次）
cd /Users/vivienne/Desktop/receipt-tracker
npm install
cd web-app && npm install
cd ../expo-native && npm install

# 启动后端服务
cd /Users/vivienne/Desktop/receipt-tracker
npm run dev
# → http://localhost:3001

# 启动 Web 应用（新终端）
npm run web
# → http://localhost:3000

# 启动移动端（新终端，可选）
npm run mobile
# → Expo App
```

## ✨ 功能特性

### 🌐 Web 应用

#### Dashboard 页面
- 📊 总支出统计
- 📈 分类支出分析
- 🕐 最近活动列表
- 🌍 自动语言检测

#### Scan Receipt 页面
- 📤 拖拽上传图片
- 📸 支持拍照功能
- 🖼️ 图片预览
- 🤖 一键 OCR 识别

#### All Receipts 页面
- 🔍 搜索票据
- 🏷️ 分类筛选
- 📋 表格管理
- 📊 导出 Excel
- 👁️ 查看详情
- 🗑️ 删除票据

### 📱 移动端应用

- 📷 相机拍照或相册选择
- 🤖 实时 OCR 识别
- 💾 本地票据管理
- 📊 统计图表展示
- ⚙️ 服务器 IP 配置
- 🔄 下拉刷新

### 🔧 后端 API

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/upload` | POST | 上传并识别票据 |
| `/api/receipts` | GET | 获取票据列表 |
| `/api/receipts/:id` | DELETE | 删除票据 |
| `/api/export` | GET | 导出 Excel |

## 🌍 国际化支持

Web 应用支持自动语言切换：

- **自动检测**：根据浏览器语言自动切换
- **支持语言**：English / 简体中文
- **持久化**：语言偏好保存到 localStorage

### 切换语言

浏览器控制台执行：
```javascript
// 中文
localStorage.setItem('i18nextLng', 'zh')
location.reload()

// 英文
localStorage.setItem('i18nextLng', 'en')
location.reload()
```

详细文档：[web-app/I18N.md](web-app/I18N.md)

## 🛠️ 技术栈

### 后端
- **运行时**：Node.js 18+
- **框架**：Express
- **OCR**：百度 OCR API
- **导出**：ExcelJS
- **上传**：Multer
- **语言**：TypeScript

### Web 前端
- **框架**：React 18
- **构建**：Vite
- **路由**：React Router 7
- **国际化**：i18next + react-i18next
- **语言**：TypeScript
- **样式**：CSS Modules

### 移动端
- **框架**：React Native + Expo
- **导航**：React Navigation
- **相机**：expo-camera
- **存储**：AsyncStorage
- **图片**：expo-image-picker

## 🎨 设计系统

### 配色方案
```css
--color-primary: #000000;      /* 主色 - 黑色 */
--color-background: #ffffff;   /* 背景 - 白色 */
--color-surface: #f8f9fa;      /* 次级背景 */
--color-border: #e5e7eb;       /* 边框 */
--color-text: #000000;         /* 主文本 */
--color-text-muted: #6b7280;   /* 次要文本 */
```

### 设计原则
- 简洁现代的黑白配色
- 清晰的视觉层次
- 一致的圆角（6-12px）
- 轻微的阴影（0.05 透明度）
- 流畅的交互反馈

## 📊 数据流程

```
用户上传图片
    ↓
后端接收并保存
    ↓
调用百度 OCR API
    ↓
智能解析结果
  ├─ 提取金额（多策略）
  ├─ 识别日期
  ├─ 提取商户名
  └─ 自动分类
    ↓
返回结构化数据
    ↓
前端展示 / 存储
```

## 🔒 安全考虑

- ✅ 环境变量存储 API 密钥
- ✅ 文件类型验证（图片格式）
- ✅ 文件大小限制
- ✅ 错误处理和日志
- ⚠️ 未实现：用户认证（待添加）

## 📦 部署建议

### 后端部署
```bash
# 生产环境
NODE_ENV=production npm start

# 使用 PM2 守护进程
pm2 start src/server.ts --name receipt-ocr
```

### Web 部署
```bash
cd web-app
npm run build
# 部署 dist/ 目录到 Nginx / Vercel / Netlify
```

### 移动端发布
```bash
cd expo-native
expo build:android  # Android APK
expo build:ios      # iOS IPA
```

## 📈 性能优化

- ✅ Vite 快速构建
- ✅ React 懒加载路由
- ✅ i18n 按需加载语言包
- ⚠️ 待优化：图片压缩
- ⚠️ 待优化：CDN 静态资源

## 🧪 测试

```bash
# 后端测试（手动）
curl -X POST http://localhost:3001/api/upload \
  -F "image=@sample.jpg"

# Web 应用测试
cd web-app
npm run build  # 编译检查

# 移动端测试
cd expo-native
npm start      # 在 Expo Go 中测试
```

## 📝 已知问题

1. ❌ Web 应用当前使用 mock 数据（未连接后端）
2. ❌ 移动端 SettingsScreen 有未使用的 useState
3. ⚠️ 百度 OCR 免费额度有限（500次/天）
4. ⚠️ 票据识别准确率依赖图片质量

## 🔮 未来规划

- [ ] Web 应用连接后端 API
- [ ] 用户认证系统
- [ ] 云端数据同步
- [ ] 批量上传功能
- [ ] 图片自动压缩
- [ ] PDF 发票支持
- [ ] 数据可视化增强
- [ ] 移动端国际化
- [ ] 暗色模式

## 📄 License

MIT License

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

---

**现在访问 http://localhost:3000 开始使用吧！** 🎉
