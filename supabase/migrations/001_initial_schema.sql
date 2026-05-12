-- 1. Initial Schema
-- Tabel meja
create table tables (
  id uuid primary key default gen_random_uuid(),
  nomor_meja integer not null unique,
  qr_code_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabel menu
create table menus (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  deskripsi text,
  harga integer not null,
  kategori text not null,
  foto_url text,
  is_available boolean default true,
  urutan integer default 0,
  created_at timestamptz default now()
);

-- Tabel pesanan
create table orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references tables(id),
  status text default 'baru',
  total integer not null,
  catatan text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabel item pesanan
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_id uuid references menus(id),
  nama_menu text not null,
  harga_saat_pesan integer not null,
  qty integer not null default 1,
  created_at timestamptz default now()
);

-- 2. Row Level Security (RLS)
alter table tables enable row level security;
alter table menus enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies for tables
create policy "Allow public read on tables" on tables for select using (true);

-- Policies for menus
create policy "Allow public read on menus" on menus for select using (true);
create policy "Allow admin to manage menus" on menus for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Policies for orders
create policy "Allow public to create and read orders" on orders for select using (true);
create policy "Allow public to insert orders" on orders for insert with check (true);
create policy "Allow kasir and admin to update orders" on orders for update
  using ((auth.jwt() -> 'user_metadata' ->> 'role') in ('kasir', 'admin'))
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') in ('kasir', 'admin'));

-- Policies for order_items
create policy "Allow public to create and read order_items" on order_items for select using (true);
create policy "Allow public to insert order_items" on order_items for insert with check (true);

-- 3. Enable Realtime
begin;
  -- drop the publication if it exists
  drop publication if exists supabase_realtime;
  -- create the publication
  create publication supabase_realtime for table orders;
commit;
