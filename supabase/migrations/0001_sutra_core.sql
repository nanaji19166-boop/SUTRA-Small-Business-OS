create extension if not exists pgcrypto;

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry_template text not null default 'other',
  default_currency text not null default 'INR',
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','staff')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  unique (business_id,user_id)
);

create table if not exists business_settings (
  business_id uuid primary key references businesses(id) on delete cascade,
  language text not null default 'en',
  date_format text not null default 'DD/MM/YYYY',
  timezone text not null default 'Asia/Kolkata',
  updated_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  location_type text not null default 'store',
  address text,
  responsible_user_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  mobile text,
  address text,
  opening_balance numeric(14,2) not null default 0 check (opening_balance >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  mobile text,
  address text,
  opening_balance numeric(14,2) not null default 0 check (opening_balance >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  unit text not null default 'pcs',
  sale_price numeric(14,2) not null default 0 check (sale_price >= 0),
  purchase_price numeric(14,2) not null default 0 check (purchase_price >= 0),
  reorder_level numeric(14,3) not null default 0 check (reorder_level >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,sku)
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  location_id uuid not null references locations(id) on delete restrict,
  purchase_number text not null,
  purchase_date date not null default current_date,
  subtotal numeric(14,2) not null check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  payment_method text check (payment_method in ('cash','upi','bank','card','other')),
  status text not null default 'confirmed' check (status in ('draft','confirmed','cancelled')),
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,purchase_number),
  check (paid_amount <= total_amount),
  check (discount <= subtotal),
  check (total_amount = subtotal - discount)
);

create table if not exists purchase_lines (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  check (line_total = quantity * unit_price)
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  location_id uuid not null references locations(id) on delete restrict,
  sale_number text not null,
  sale_date date not null default current_date,
  subtotal numeric(14,2) not null check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  balance_amount numeric(14,2) not null default 0 check (balance_amount >= 0),
  payment_method text check (payment_method in ('cash','upi','bank','card','other')),
  status text not null default 'confirmed' check (status in ('draft','confirmed','cancelled')),
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,sale_number),
  check (paid_amount <= total_amount),
  check (discount <= subtotal),
  check (total_amount = subtotal - discount),
  check (balance_amount = total_amount - paid_amount)
);

create table if not exists sale_lines (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  check (line_total = quantity * unit_price)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  sale_id uuid references sales(id) on delete set null,
  purchase_id uuid references purchases(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash','upi','bank','card','other')),
  payment_date date not null default current_date,
  reference text,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists collection_schedules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  sale_id uuid references sales(id) on delete set null,
  title text not null,
  total_amount numeric(14,2) not null check (total_amount > 0),
  installment_amount numeric(14,2) not null check (installment_amount > 0),
  frequency text not null check (frequency in ('daily','weekly','fortnightly','monthly')),
  start_date date not null,
  next_due_date date,
  outstanding_amount numeric(14,2) not null check (outstanding_amount >= 0),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists collection_payments (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references collection_schedules(id) on delete cascade,
  payment_id uuid not null references payments(id) on delete cascade,
  amount_applied numeric(14,2) not null check (amount_applied > 0),
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  expense_date date not null default current_date,
  payment_method text not null check (payment_method in ('cash','upi','bank','card','other')),
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  location_id uuid not null references locations(id) on delete restrict,
  movement_type text not null check (movement_type in ('purchase','sale','adjustment_in','adjustment_out','transfer_in','transfer_out','opening')),
  quantity numeric(14,3) not null check (quantity <> 0),
  unit_cost numeric(14,2) not null default 0 check (unit_cost >= 0),
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_user on business_memberships(user_id,status);
create index if not exists idx_products_business on products(business_id,is_active);
create index if not exists idx_sales_business_date on sales(business_id,sale_date,status);
create index if not exists idx_purchases_business_date on purchases(business_id,purchase_date,status);
create index if not exists idx_payments_business_date on payments(business_id,payment_date);
create index if not exists idx_inventory_product_location on inventory_movements(business_id,product_id,location_id);
create index if not exists idx_collections_due on collection_schedules(business_id,next_due_date,is_active);
create index if not exists idx_expenses_business_date on expenses(business_id,expense_date);

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from business_memberships
    where business_id = target_business_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

alter table businesses enable row level security;
alter table business_memberships enable row level security;
alter table business_settings enable row level security;
alter table locations enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table purchases enable row level security;
alter table purchase_lines enable row level security;
alter table sales enable row level security;
alter table sale_lines enable row level security;
alter table payments enable row level security;
alter table collection_schedules enable row level security;
alter table collection_payments enable row level security;
alter table expenses enable row level security;
alter table inventory_movements enable row level security;
alter table audit_log enable row level security;

create policy business_member_select on businesses for select using (is_business_member(id) or owner_user_id = auth.uid());
create policy business_member_write on businesses for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

create policy membership_select on business_memberships for select using (user_id = auth.uid() or is_business_member(business_id));
create policy membership_owner_write on business_memberships for all using (
  exists(select 1 from business_memberships m where m.business_id = business_memberships.business_id and m.user_id = auth.uid() and m.role = 'owner' and m.status = 'active')
) with check (true);

do $$
declare t text;
begin
  foreach t in array array[
    'business_settings','locations','customers','suppliers','products','purchases','purchase_lines',
    'sales','sale_lines','payments','collection_schedules','collection_payments','expenses',
    'inventory_movements','audit_log'
  ] loop
    execute format('create policy %I on %I for all using (is_business_member(business_id)) with check (is_business_member(business_id))', 'business_scope_'||t, t);
  end loop;
end $$;
