create or replace function public.create_sale(
  p_business_id uuid, p_customer_id uuid, p_location_id uuid, p_sale_number text,
  p_sale_date date, p_discount numeric, p_paid_amount numeric, p_payment_method text,
  p_notes text, p_lines jsonb, p_collection jsonb default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_subtotal numeric := 0;
  v_total numeric;
  v_balance numeric;
  v_line record;
  v_stock numeric;
  v_existing record;
  v_collection_total numeric;
  v_installment numeric;
  v_frequency text;
  v_start_date date;
begin
  if not is_business_member(p_business_id) then raise exception 'Business access denied'; end if;
  if jsonb_array_length(p_lines) = 0 then raise exception 'At least one sale line is required'; end if;
  if p_discount < 0 or p_paid_amount < 0 then raise exception 'Discount and paid amount cannot be negative'; end if;

  select id,total_amount,balance_amount into v_existing
  from sales where business_id=p_business_id and sale_number=p_sale_number;
  if found then
    return jsonb_build_object('saleId',v_existing.id,'totalAmount',v_existing.total_amount,'balanceAmount',v_existing.balance_amount,'idempotent',true);
  end if;

  if p_location_id is null or not exists (
    select 1 from locations where id=p_location_id and business_id=p_business_id and is_active
  ) then raise exception 'A valid stock location is required'; end if;

  if p_customer_id is not null and not exists (
    select 1 from customers where id=p_customer_id and business_id=p_business_id and is_active
  ) then raise exception 'Customer not found'; end if;

  for v_line in select * from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity numeric, unit_price numeric) loop
    if v_line.quantity <= 0 or v_line.unit_price < 0 then raise exception 'Invalid sale line'; end if;
    if not exists (select 1 from products where id=v_line.product_id and business_id=p_business_id and is_active) then
      raise exception 'Product not found';
    end if;
    v_subtotal := v_subtotal + (v_line.quantity * v_line.unit_price);
  end loop;

  if p_discount > v_subtotal then raise exception 'Discount cannot exceed subtotal'; end if;
  v_total := v_subtotal - p_discount;
  if p_paid_amount > v_total then raise exception 'Paid amount cannot exceed total'; end if;
  v_balance := v_total - p_paid_amount;

  if p_collection is not null then
    if p_customer_id is null then raise exception 'A customer is required for scheduled collections'; end if;
    v_collection_total := (p_collection->>'totalAmount')::numeric;
    v_installment := (p_collection->>'installmentAmount')::numeric;
    v_frequency := p_collection->>'frequency';
    v_start_date := coalesce((p_collection->>'startDate')::date,current_date);
    if abs(v_collection_total-v_total) > 0.01 then raise exception 'Collection total must equal sale total'; end if;
    if v_installment <= 0 then raise exception 'Installment amount must be greater than zero'; end if;
    if v_frequency not in ('daily','weekly','fortnightly','monthly') then raise exception 'Invalid collection frequency'; end if;
  end if;

  for v_line in
    select distinct (x->>'product_id')::uuid as product_id
    from jsonb_array_elements(p_lines) x
  loop
    perform 1 from products where id=v_line.product_id for update;
    select coalesce(sum(quantity),0) into v_stock
    from inventory_movements
    where business_id=p_business_id and product_id=v_line.product_id and location_id=p_location_id;
    if v_stock < (
      select sum((x->>'quantity')::numeric) from jsonb_array_elements(p_lines) x
      where (x->>'product_id')::uuid=v_line.product_id
    ) then raise exception 'Insufficient stock for one or more items'; end if;
  end loop;

  insert into sales(
    business_id,customer_id,location_id,sale_number,sale_date,subtotal,discount,
    total_amount,paid_amount,balance_amount,payment_method,status,notes,created_by
  ) values (
    p_business_id,p_customer_id,p_location_id,p_sale_number,coalesce(p_sale_date,current_date),
    v_subtotal,p_discount,v_total,p_paid_amount,v_balance,p_payment_method,'confirmed',p_notes,auth.uid()
  ) returning id into v_sale_id;

  for v_line in select * from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity numeric, unit_price numeric) loop
    insert into sale_lines(sale_id,product_id,quantity,unit_price,line_total)
    values(v_sale_id,v_line.product_id,v_line.quantity,v_line.unit_price,v_line.quantity*v_line.unit_price);

    insert into inventory_movements(
      business_id,product_id,location_id,movement_type,quantity,unit_cost,reference_type,reference_id,created_by
    )
    select p_business_id,v_line.product_id,p_location_id,'sale',-v_line.quantity,purchase_price,'sale',v_sale_id,auth.uid()
    from products where id=v_line.product_id;
  end loop;

  if p_paid_amount > 0 then
    insert into payments(business_id,customer_id,sale_id,amount,payment_method,payment_date,notes,created_by)
    values(p_business_id,p_customer_id,v_sale_id,p_paid_amount,coalesce(p_payment_method,'cash'),coalesce(p_sale_date,current_date),'Sale payment',auth.uid());
  end if;

  if p_collection is not null and v_balance > 0 then
    insert into collection_schedules(
      business_id,customer_id,sale_id,title,total_amount,installment_amount,frequency,
      start_date,next_due_date,outstanding_amount,is_active,notes
    ) values(
      p_business_id,p_customer_id,v_sale_id,
      coalesce(p_collection->>'title','Collection'),
      v_collection_total,v_installment,v_frequency,v_start_date,v_start_date,
      v_balance,true,p_collection->>'notes'
    );
  end if;

  insert into audit_log(business_id,user_id,action,entity_type,entity_id,metadata)
  values(p_business_id,auth.uid(),'sale.confirmed','sale',v_sale_id,
    jsonb_build_object('total',v_total,'paidAmount',p_paid_amount,'balance',v_balance));

  return jsonb_build_object('saleId',v_sale_id,'totalAmount',v_total,'balanceAmount',v_balance,'idempotent',false);
end;
$$;

create or replace function public.create_purchase(
  p_business_id uuid, p_supplier_id uuid, p_location_id uuid, p_purchase_number text,
  p_purchase_date date, p_discount numeric, p_paid_amount numeric, p_payment_method text,
  p_notes text, p_lines jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_subtotal numeric := 0;
  v_total numeric;
  v_line record;
  v_existing record;
begin
  if not is_business_member(p_business_id) then raise exception 'Business access denied'; end if;
  if jsonb_array_length(p_lines)=0 then raise exception 'At least one purchase line is required'; end if;
  if p_supplier_id is not null and not exists(select 1 from suppliers where id=p_supplier_id and business_id=p_business_id and is_active) then raise exception 'Supplier not found'; end if;
  if not exists(select 1 from locations where id=p_location_id and business_id=p_business_id and is_active) then raise exception 'A valid stock location is required'; end if;

  select id,total_amount into v_existing from purchases where business_id=p_business_id and purchase_number=p_purchase_number;
  if found then return jsonb_build_object('purchaseId',v_existing.id,'totalAmount',v_existing.total_amount,'idempotent',true); end if;

  for v_line in select * from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity numeric, unit_price numeric) loop
    if v_line.quantity <= 0 or v_line.unit_price < 0 then raise exception 'Invalid purchase line'; end if;
    if not exists(select 1 from products where id=v_line.product_id and business_id=p_business_id and is_active) then raise exception 'Product not found'; end if;
    v_subtotal := v_subtotal + v_line.quantity*v_line.unit_price;
  end loop;

  if p_discount < 0 or p_discount > v_subtotal then raise exception 'Invalid discount'; end if;
  v_total := v_subtotal-p_discount;
  if p_paid_amount < 0 or p_paid_amount > v_total then raise exception 'Invalid paid amount'; end if;

  insert into purchases(
    business_id,supplier_id,location_id,purchase_number,purchase_date,subtotal,discount,
    total_amount,paid_amount,payment_method,status,notes,created_by
  ) values(
    p_business_id,p_supplier_id,p_location_id,p_purchase_number,coalesce(p_purchase_date,current_date),
    v_subtotal,p_discount,v_total,p_paid_amount,p_payment_method,'confirmed',p_notes,auth.uid()
  ) returning id into v_purchase_id;

  for v_line in select * from jsonb_to_recordset(p_lines) as x(product_id uuid, quantity numeric, unit_price numeric) loop
    insert into purchase_lines(purchase_id,product_id,quantity,unit_price,line_total)
    values(v_purchase_id,v_line.product_id,v_line.quantity,v_line.unit_price,v_line.quantity*v_line.unit_price);
    insert into inventory_movements(
      business_id,product_id,location_id,movement_type,quantity,unit_cost,reference_type,reference_id,created_by
    ) values(
      p_business_id,v_line.product_id,p_location_id,'purchase',v_line.quantity,v_line.unit_price,'purchase',v_purchase_id,auth.uid()
    );
  end loop;

  if p_paid_amount > 0 then
    insert into payments(business_id,supplier_id,purchase_id,amount,payment_method,payment_date,notes,created_by)
    values(p_business_id,p_supplier_id,v_purchase_id,p_paid_amount,coalesce(p_payment_method,'cash'),coalesce(p_purchase_date,current_date),'Purchase payment',auth.uid());
  end if;

  insert into audit_log(business_id,user_id,action,entity_type,entity_id,metadata)
  values(p_business_id,auth.uid(),'purchase.confirmed','purchase',v_purchase_id,
    jsonb_build_object('total',v_total,'paidAmount',p_paid_amount));

  return jsonb_build_object('purchaseId',v_purchase_id,'totalAmount',v_total,'idempotent',false);
end;
$$;

revoke all on function public.create_sale(uuid,uuid,uuid,text,date,numeric,numeric,text,text,jsonb,jsonb) from public;
revoke all on function public.create_purchase(uuid,uuid,uuid,text,date,numeric,numeric,text,text,jsonb) from public;
grant execute on function public.create_sale(uuid,uuid,uuid,text,date,numeric,numeric,text,text,jsonb,jsonb) to authenticated;
grant execute on function public.create_purchase(uuid,uuid,uuid,text,date,numeric,numeric,text,text,jsonb) to authenticated;
