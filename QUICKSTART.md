# 🚀 5 分钟快速上线指南

## 步骤 1：配置 Supabase（5 分钟）

### 1.1 创建项目
1. 访问 https://supabase.com
2. 点击 "Sign in" 或 "Start your project"（使用 GitHub 登录最快）
3. 点击 "New Project"
4. 填写：
   - Name: `receipt-tracker`
   - Database Password: 随意设置（例如：`Receipt@2026`）
   - Region: 选择 **Northeast Asia (Tokyo)**
5. 点击 "Create new project"，等待 2 分钟

### 1.2 创建数据库表
1. 项目创建完成后，点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制以下 SQL，粘贴并点击 **Run**：

```sql
-- Create receipts table
create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  vendor text,
  category text not null default '其他',
  amount numeric(10, 2),
  date date,
  raw_text text,
  confidence text check (confidence in ('high', 'low')),
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists receipts_date_idx on receipts(date desc);
create index if not exists receipts_category_idx on receipts(category);
create index if not exists receipts_created_at_idx on receipts(created_at desc);

-- Enable Row Level Security
alter table receipts enable row level security;

-- Allow all operations for now
create policy "Allow all operations for now"
  on receipts
  for all
  using (true)
  with check (true);

-- Create storage bucket for receipt images
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'receipts');

create policy "Allow upload for all"
  on storage.objects for insert
  with check (bucket_id = 'receipts');

create policy "Allow delete for all"
  on storage.objects for delete
  using (bucket_id = 'receipts');
```

4. 看到 "Success. No rows returned" 表示成功

### 1.3 获取 API 凭证
1. 点击左侧 **Settings** (齿轮图标)
2. 点击 **API**
3. 复制以下两项：
   - **Project URL** (形如 `https://xxxxx.supabase.co`)
   - **anon public** key (以 `eyJhbGc` 开头的长字符串)

### 1.4 配置环境变量
在终端执行：

```bash
cd /Users/vivienne/Desktop/receipt-tracker/receipt-ocr

# 编辑 .env 文件
nano .env
```

添加这两行（替换为你自己的值）：
```
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGc开头的那一长串
```

按 `Ctrl+X`，然后 `Y`，最后回车保存。

---

## 步骤 2：一键部署（5 分钟）

```bash
cd /Users/vivienne/Desktop/receipt-tracker
./deploy.sh
```

脚本会自动完成：
- ✅ 检查配置
- ✅ 安装依赖
- ✅ 编译检查
- ✅ 部署后端到 Railway
- ✅ 部署前端到 Vercel

按照脚本提示操作即可！

---

## 步骤 3：测试（2 分钟）

1. 访问你的 Vercel URL
2. 点击 "Scan Receipt"
3. 上传一张票据图片
4. 查看识别结果
5. 刷新页面，数据依然存在 ✅

---

## 遇到问题？

### Supabase SQL 执行失败
- 确保在 **SQL Editor** 中执行，不是在其他地方
- 确保整段 SQL 都复制了

### deploy.sh 提示缺少 Supabase 配置
- 检查 `receipt-ocr/.env` 文件
- 确保 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 都配置了

### Railway 登录问题
- 使用 GitHub 账号登录最方便
- 首次使用需要验证邮箱

---

**准备好了？开始配置 Supabase 吧！** 👆

完成后运行：`./deploy.sh`
