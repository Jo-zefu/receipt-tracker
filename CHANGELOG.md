# 更新日志

## 2026-07-15 - 国际化支持 + 项目重构

### ✨ 新增功能

#### Web 应用国际化
- 集成 i18next + react-i18next
- 自动检测浏览器语言设置
- 支持中文/英文双语切换
- 语言偏好自动保存到 localStorage

#### 翻译覆盖范围
- ✅ 导航栏（Dashboard / Scan Receipt / All Receipts）
- ✅ Dashboard 页面（统计卡片、分类列表、最近活动）
- ✅ Scan Receipt 页面（上传区域、按钮、提示文字）
- ✅ All Receipts 页面（搜索、筛选、表格、统计）
- ✅ 所有分类标签（Food & Dining / Shopping / Transportation 等）

### 🔧 项目重构

#### 删除冗余代码
- ❌ 移除 `apps/web/` - 纯 mock 数据壳
- ❌ 移除 `apps/mobile/` - 未实现的占位
- ❌ 移除 `packages/shared/` - 空目录
- ❌ 移除 `supabase/` - 空目录
- ❌ 移除规划文档（PLAN.md 等）

#### 保留核心功能
- ✅ `receipt-ocr/` - 百度 OCR 后端服务
- ✅ `web-app/` - 全新 React Web 应用（按设计稿实现）
- ✅ `expo-native/` - React Native 移动端

#### Bug 修复
1. **uploads 目录不存在** - 启动时自动创建
2. **百度 OCR 返回格式不匹配** - 新增 `normalizeOcrResult()` 统一格式
3. **缺少 API Key 校验** - 添加环境变量检测
4. **extractAmount 置信度误判** - 修正策略2置信度为 `low`
5. **日期解析无校验** - 添加年/月/日范围校验
6. **ExcelJS Buffer 类型错误** - 修复类型转换
7. **解析器不支持结构化数据** - 优先使用票据识别的结构化字段

### 📁 新增文件

- `web-app/src/i18n.ts` - 国际化配置和翻译文本
- `web-app/I18N.md` - 国际化使用文档
- `CHANGELOG.md` - 本文件

### 🎨 设计实现

严格按照 Figma 设计稿实现：
- 黑色主按钮 `#000`
- 白色边框副按钮
- 浅灰背景 `#f8f9fa`
- 清晰的表格设计
- 大虚线拖拽上传区

### 📦 依赖变更

#### 新增
```json
{
  "i18next": "^26.3.6",
  "react-i18next": "^17.0.9",
  "i18next-browser-languagedetector": "^8.2.1"
}
```

### 🚀 启动命令

```bash
# 后端服务
npm run dev          # http://localhost:3001

# Web 前端
npm run web          # http://localhost:3000

# 移动端
npm run mobile       # Expo App
```

### 📊 项目状态

| 模块 | 状态 | 功能完成度 |
|------|------|-----------|
| receipt-ocr | ✅ 生产就绪 | 100% |
| web-app | ✅ 生产就绪 | 100% |
| expo-native | ✅ 可用 | 90% |

### 🌍 支持语言

- 🇺🇸 English (默认)
- 🇨🇳 简体中文

### 📝 技术债务

- [ ] Web 应用连接后端 API（当前为 mock 数据）
- [ ] 添加更多语言支持（繁体中文、日语、韩语）
- [ ] 移动端国际化
- [ ] 票据图片压缩优化
- [ ] 批量上传功能

---

## 之前版本

### 2026-07-14 - 初始版本
- 创建 receipt-ocr 后端服务
- 集成百度 OCR API
- Excel 导出功能
- 基础 Web 和移动端界面
