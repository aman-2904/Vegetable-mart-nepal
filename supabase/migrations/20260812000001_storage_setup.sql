-- Insert storage buckets
insert into storage.buckets (id, name, public) values 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('banners', 'banners', true),
  ('payment-assets', 'payment-assets', false);

-- Set up RLS for storage buckets
-- Products bucket
create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'products' and is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'products' and is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'products' and is_admin());

-- Categories bucket
create policy "Category images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'categories');

create policy "Admins can upload category images"
  on storage.objects for insert
  with check (bucket_id = 'categories' and is_admin());

create policy "Admins can update category images"
  on storage.objects for update
  using (bucket_id = 'categories' and is_admin());

create policy "Admins can delete category images"
  on storage.objects for delete
  using (bucket_id = 'categories' and is_admin());

-- Banners bucket
create policy "Banner images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'banners');

create policy "Admins can upload banner images"
  on storage.objects for insert
  with check (bucket_id = 'banners' and is_admin());

create policy "Admins can update banner images"
  on storage.objects for update
  using (bucket_id = 'banners' and is_admin());

create policy "Admins can delete banner images"
  on storage.objects for delete
  using (bucket_id = 'banners' and is_admin());

-- Payment assets bucket
create policy "Users can upload their own payment assets"
  on storage.objects for insert
  with check (bucket_id = 'payment-assets' and auth.uid() = owner);

create policy "Users can view their own payment assets"
  on storage.objects for select
  using (bucket_id = 'payment-assets' and auth.uid() = owner);

create policy "Admins can view all payment assets"
  on storage.objects for select
  using (bucket_id = 'payment-assets' and is_admin());
