# Receipt OCR Backend - Supabase 集成指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 并登录
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `receipt-tracker`
   - Database Password: 设置一个强密码（保存好）
   - Region: 选择最近的区域（建议选 Northeast Asia (Tokyo)）
4. 等待项目初始化完成（约 2 分钟）

## 2. 获取 API 凭证

1. 进入项目后，点击左侧 **Settings** → **API**
2. 复制以下信息：
   - **Project URL** (形如 `https://xxxxx.supabase.co`)
   - **anon public** key (很长的 JWT token)

## 3. 执行数据库迁移

1. 在 Supabase Dashboard 中，点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制 `supabase-schema.sql` 的全部内容并粘贴
4. 点击 **Run** 执行

这将创建：
- `receipts` 表（存储票据数据）
- `receipts` Storage bucket（存储票据图片）
- 必要的索引和权限策略

## 4. 配置环境变量

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env`，填入你的凭证：
   ```env
   # Baidu OCR API credentials
   BAIDU_API_KEY=your_baidu_api_key
   BAIDU_SECRET_KEY=your_baidu_secret_key

   # Supabase configuration
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Server configuration
   PORT=3001
   ```

## 5. 启动服务

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 6. 验证集成

访问 `http://localhost:3001`，上传一张票据图片。

成功后，检查 Supabase：
1. **Table Editor** → `receipts` 应该有新记录
2. **Storage** → `receipts` bucket 应该有上传的图片

## API 端点

- `POST /api/upload` - 上传并识别票据（支持多张）
- `GET /api/receipts` - 获取所有票据
- `GET /api/export` - 导出 Excel
- `DELETE /api/receipts` - 清空所有票据

## 数据持久化

✅ **之前**：数据存储在内存中，重启服务后丢失  
✅ **现在**：数据存储在 Supabase PostgreSQL，永久保存

✅ **之前**：图片存储在本地 `uploads/` 文件夹  
✅ **现在**：图片存储在 Supabase Storage，全球 CDN 加速

## 下一步：部署到生产环境

见主目录的 `DEPLOYMENT.md`
