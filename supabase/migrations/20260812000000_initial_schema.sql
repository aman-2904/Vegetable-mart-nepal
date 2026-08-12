-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('customer', 'admin');
create type product_unit as enum ('KG', 'GRAM', 'PIECE', 'BUNCH', 'DOZEN');
create type order_status as enum ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
create type payment_method as enum ('qr', 'cod');
create type payment_status as enum ('pending', 'submitted', 'verified', 'rejected', 'collected', 'refunded');
create type inventory_change_type as enum ('restock', 'sale', 'manual_adjustment', 'order_cancelled', 'return');

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role user_role default 'customer',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admin Function
create or replace function is_admin() returns boolean as $$
begin
  return exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories(id) on delete restrict,
  price numeric(10, 2) not null,
  discount_price numeric(10, 2),
  unit product_unit not null,
  stock numeric(10, 2) not null default 0,
  minimum_stock numeric(10, 2) not null default 0,
  image_url text,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product Images
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Addresses
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  house text not null,
  street text not null,
  area text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  landmark text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Carts
create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cart Items
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity numeric(10, 2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(cart_id, product_id)
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references profiles(id) on delete restrict not null,
  address_id uuid references addresses(id) on delete restrict not null,
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) default 0,
  delivery_fee numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  payment_method payment_method not null,
  payment_status payment_status default 'pending',
  order_status order_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict not null,
  product_name text not null,
  unit product_unit not null,
  quantity numeric(10, 2) not null,
  price numeric(10, 2) not null,
  subtotal numeric(10, 2) not null
);

-- Payments
create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  payment_method payment_method not null,
  amount numeric(10, 2) not null,
  status payment_status default 'pending',
  transaction_reference text,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory Transactions
create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete restrict not null,
  previous_stock numeric(10, 2) not null,
  new_stock numeric(10, 2) not null,
  quantity_changed numeric(10, 2) not null,
  change_type inventory_change_type not null,
  reason text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Banners
create table banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  image_url text not null,
  button_text text,
  button_url text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Store Settings
create table store_settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null,
  phone text,
  email text,
  address text,
  currency text default 'INR',
  minimum_order_amount numeric(10, 2) default 0,
  delivery_fee numeric(10, 2) default 0,
  free_delivery_threshold numeric(10, 2),
  store_status text default 'open',
  updated_at timestamptz default now()
);

-- Delivery Areas
create table delivery_areas (
  id uuid primary key default uuid_generate_v4(),
  city text not null,
  area text not null,
  postal_code text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_products_slug on products(slug);
create index idx_categories_slug on categories(slug);
create index idx_products_category on products(category_id);
create index idx_products_active on products(is_active);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(order_status);
create index idx_orders_payment_status on orders(payment_status);
create index idx_inventory_product on inventory_transactions(product_id);
create index idx_cart_items_cart on cart_items(cart_id);
create index idx_addresses_user on addresses(user_id);

-- RLS setup
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table addresses enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table inventory_transactions enable row level security;
alter table banners enable row level security;
alter table store_settings enable row level security;
alter table delivery_areas enable row level security;

-- Profiles RLS
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Categories RLS
create policy "Categories are viewable by everyone" on categories for select using (is_active = true or is_admin());
create policy "Only admins can modify categories" on categories for all using (is_admin());

-- Products RLS
create policy "Products are viewable by everyone" on products for select using (is_active = true or is_admin());
create policy "Only admins can modify products" on products for all using (is_admin());

-- Product Images RLS
create policy "Product images viewable by everyone" on product_images for select using (true);
create policy "Only admins can modify product images" on product_images for all using (is_admin());

-- Addresses RLS
create policy "Users can view own addresses" on addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on addresses for delete using (auth.uid() = user_id);
create policy "Admins can view all addresses" on addresses for select using (is_admin());

-- Carts & Cart Items RLS
create policy "Users can view own cart" on carts for select using (auth.uid() = user_id);
create policy "Users can manage own cart" on carts for all using (auth.uid() = user_id);
create policy "Users can view own cart items" on cart_items for select using (exists(select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));
create policy "Users can manage own cart items" on cart_items for all using (exists(select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));

-- Orders RLS
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admins can view and manage all orders" on orders for all using (is_admin());

-- Order Items RLS
create policy "Users can view own order items" on order_items for select using (exists(select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Users can insert own order items" on order_items for insert with check (exists(select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can view all order items" on order_items for select using (is_admin());

-- Payments RLS
create policy "Users can view own payments" on payments for select using (exists(select 1 from orders where orders.id = payments.order_id and orders.user_id = auth.uid()));
create policy "Users can insert own payments" on payments for insert with check (exists(select 1 from orders where orders.id = payments.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage all payments" on payments for all using (is_admin());

-- Inventory Transactions RLS
create policy "Admins can view and manage inventory transactions" on inventory_transactions for all using (is_admin());

-- Banners RLS
create policy "Banners are viewable by everyone" on banners for select using (is_active = true or is_admin());
create policy "Only admins can modify banners" on banners for all using (is_admin());

-- Store Settings RLS
create policy "Settings are viewable by everyone" on store_settings for select using (true);
create policy "Only admins can modify settings" on store_settings for all using (is_admin());

-- Delivery Areas RLS
create policy "Delivery areas are viewable by everyone" on delivery_areas for select using (is_active = true or is_admin());
create policy "Only admins can modify delivery areas" on delivery_areas for all using (is_admin());
