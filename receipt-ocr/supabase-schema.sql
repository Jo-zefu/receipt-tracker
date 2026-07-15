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

-- Enable Row Level Security (optional, for multi-user support later)
alter table receipts enable row level security;

-- For now, allow all operations (you can add user-specific policies later)
create policy "Allow all operations for now"
  on receipts
  for all
  using (true)
  with check (true);

-- Create storage bucket for receipt images
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Storage policy: allow public read, authenticated upload
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'receipts');

create policy "Allow upload for all"
  on storage.objects for insert
  with check (bucket_id = 'receipts');

create policy "Allow delete for all"
  on storage.objects for delete
  using (bucket_id = 'receipts');
