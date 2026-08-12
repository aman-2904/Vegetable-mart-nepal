-- Create a function to securely place an order, validating stock atomically.
create or replace function place_order(
  p_user_id uuid,
  p_address_id uuid,
  p_payment_method payment_method
) returns text as $$
declare
  v_cart_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_item record;
  v_store_min_order numeric(10,2) := 0;
  v_store_delivery_fee numeric(10,2) := 0;
  v_store_free_threshold numeric(10,2) := 0;
  v_calculated_item_price numeric(10,2);
  v_calculated_item_subtotal numeric(10,2);
begin
  -- 1. Get user cart
  select id into v_cart_id from carts where user_id = p_user_id;
  if v_cart_id is null then
    raise exception 'Cart not found for user';
  end if;

  -- 2. Fetch Store Settings for Delivery Rules
  select minimum_order_amount, delivery_fee, free_delivery_threshold 
  into v_store_min_order, v_store_delivery_fee, v_store_free_threshold
  from store_settings 
  limit 1;

  -- Default settings if table is empty
  if not found then
    v_store_min_order := 0;
    v_store_delivery_fee := 0;
    v_store_free_threshold := 999999;
  end if;

  -- 3. Loop through cart items to validate stock and calculate totals
  -- We MUST use FOR UPDATE to lock the product rows and prevent concurrent modifications
  for v_item in 
    select 
      ci.product_id, 
      ci.quantity, 
      p.name, 
      p.unit, 
      p.price, 
      p.discount_price, 
      p.stock
    from cart_items ci
    join products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id
    for update of p
  loop
    -- Stock Validation
    if v_item.stock < v_item.quantity then
      raise exception 'Insufficient stock for product: %. Available: %', v_item.name, v_item.stock;
    end if;

    -- Calculate item pricing
    if v_item.discount_price is not null and v_item.discount_price < v_item.price then
      v_calculated_item_price := v_item.discount_price;
      v_discount := v_discount + ((v_item.price - v_item.discount_price) * v_item.quantity);
    else
      v_calculated_item_price := v_item.price;
    end if;

    v_calculated_item_subtotal := v_calculated_item_price * v_item.quantity;
    
    -- We track the absolute base subtotal here to match typical receipt layouts
    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  end loop;

  -- Check if cart was empty
  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  -- Determine final subtotal (after discounts)
  declare 
    v_final_subtotal numeric(10,2) := v_subtotal - v_discount;
  begin
    -- Minimum Order Validation
    if v_final_subtotal < v_store_min_order then
      raise exception 'Order subtotal is below the minimum required amount of %', v_store_min_order;
    end if;

    -- Delivery Fee Calculation
    if v_final_subtotal >= v_store_free_threshold then
      v_delivery_fee := 0;
    else
      v_delivery_fee := v_store_delivery_fee;
    end if;

    v_total := v_final_subtotal + v_delivery_fee;
  end;

  -- 4. Generate Order Number (Format: ORD-YYYYMMDD-XXXX)
  v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  -- 5. Insert Order
  insert into orders (
    order_number, user_id, address_id, subtotal, discount, delivery_fee, total, payment_method
  ) values (
    v_order_number, p_user_id, p_address_id, v_subtotal, v_discount, v_delivery_fee, v_total, p_payment_method
  ) returning id into v_order_id;

  -- 6. Insert Order Items, Update Stock, and Log Inventory Transaction
  for v_item in 
    select 
      ci.product_id, 
      ci.quantity, 
      p.name, 
      p.unit, 
      p.price, 
      p.discount_price, 
      p.stock
    from cart_items ci
    join products p on ci.product_id = p.id
    where ci.cart_id = v_cart_id
  loop
    -- Calculate exact price for historical snapshot
    if v_item.discount_price is not null and v_item.discount_price < v_item.price then
      v_calculated_item_price := v_item.discount_price;
    else
      v_calculated_item_price := v_item.price;
    end if;

    v_calculated_item_subtotal := v_calculated_item_price * v_item.quantity;

    -- Insert Order Item
    insert into order_items (
      order_id, product_id, product_name, unit, quantity, price, subtotal
    ) values (
      v_order_id, v_item.product_id, v_item.name, v_item.unit, v_item.quantity, v_calculated_item_price, v_calculated_item_subtotal
    );

    -- Reduce Stock safely
    update products 
    set stock = stock - v_item.quantity 
    where id = v_item.product_id;

    -- Log Inventory Transaction
    insert into inventory_transactions (
      product_id, previous_stock, new_stock, quantity_changed, change_type, reason, created_by
    ) values (
      v_item.product_id, v_item.stock, v_item.stock - v_item.quantity, -(v_item.quantity), 'sale', 'Order ' || v_order_number, p_user_id
    );
  end loop;

  -- 7. Insert Payment Record
  insert into payments (
    order_id, payment_method, amount, status
  ) values (
    v_order_id, p_payment_method, v_total, 'pending'
  );

  -- 8. Clear the Cart
  delete from cart_items where cart_id = v_cart_id;

  -- 9. Return Order Number
  return v_order_number;
end;
$$ language plpgsql security definer;
