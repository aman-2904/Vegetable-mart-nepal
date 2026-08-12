-- Insert default store settings
insert into store_settings (store_name, phone, email, address, currency, minimum_order_amount, delivery_fee, free_delivery_threshold, store_status)
values ('Fresh Harvest', '+91 9876543210', 'hello@freshharvest.com', '123 Farm Road, Green City', 'INR', 100.00, 40.00, 500.00, 'open');

-- Insert categories
insert into categories (id, name, slug, description, image_url) values
  ('11111111-1111-1111-1111-111111111111', 'Vegetables', 'vegetables', 'Daily fresh vegetables', null),
  ('22222222-2222-2222-2222-222222222222', 'Leafy Vegetables', 'leafy-vegetables', 'Fresh and green leafy vegetables', null),
  ('33333333-3333-3333-3333-333333333333', 'Root Vegetables', 'root-vegetables', 'Healthy root vegetables', null),
  ('44444444-4444-4444-4444-444444444444', 'Fruits', 'fruits', 'Seasonal fresh fruits', null),
  ('55555555-5555-5555-5555-555555555555', 'Organic', 'organic', '100% certified organic products', null);

-- Insert products
insert into products (id, name, slug, description, category_id, price, unit, stock, minimum_stock, image_url, is_featured) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tomato', 'tomato', 'Fresh red tomatoes', '11111111-1111-1111-1111-111111111111', 40.00, 'KG', 100, 10, null, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Potato', 'potato', 'Farm fresh potatoes', '33333333-3333-3333-3333-333333333333', 30.00, 'KG', 200, 20, null, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Onion', 'onion', 'Fresh red onions', '33333333-3333-3333-3333-333333333333', 35.00, 'KG', 150, 15, null, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Carrot', 'carrot', 'Crunchy orange carrots', '33333333-3333-3333-3333-333333333333', 60.00, 'KG', 80, 10, null, false),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cabbage', 'cabbage', 'Fresh green cabbage', '11111111-1111-1111-1111-111111111111', 25.00, 'PIECE', 50, 5, null, false),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cauliflower', 'cauliflower', 'Fresh cauliflower', '11111111-1111-1111-1111-111111111111', 45.00, 'PIECE', 40, 5, null, false),
  ('00000000-0000-0000-0000-000000000001', 'Spinach', 'spinach', 'Fresh green spinach bunch', '22222222-2222-2222-2222-222222222222', 20.00, 'BUNCH', 100, 20, null, true),
  ('00000000-0000-0000-0000-000000000002', 'Cucumber', 'cucumber', 'Crisp green cucumber', '11111111-1111-1111-1111-111111111111', 40.00, 'KG', 60, 10, null, false),
  ('00000000-0000-0000-0000-000000000003', 'Capsicum', 'capsicum', 'Green capsicum', '11111111-1111-1111-1111-111111111111', 80.00, 'KG', 30, 5, null, false),
  ('00000000-0000-0000-0000-000000000004', 'Brinjal', 'brinjal', 'Fresh purple brinjal', '11111111-1111-1111-1111-111111111111', 40.00, 'KG', 50, 10, null, false),
  ('00000000-0000-0000-0000-000000000005', 'Green Peas', 'green-peas', 'Fresh green peas', '11111111-1111-1111-1111-111111111111', 100.00, 'KG', 20, 5, null, false),
  ('00000000-0000-0000-0000-000000000006', 'Garlic', 'garlic', 'Fresh garlic', '33333333-3333-3333-3333-333333333333', 150.00, 'KG', 30, 5, null, false),
  ('00000000-0000-0000-0000-000000000007', 'Ginger', 'ginger', 'Fresh ginger root', '33333333-3333-3333-3333-333333333333', 120.00, 'KG', 40, 5, null, false);
