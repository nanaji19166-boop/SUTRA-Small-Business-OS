create or replace function public.adjust_stock(
  p_business_id uuid,p_product_id uuid,p_location_id uuid,p_quantity numeric,p_unit_cost numeric,p_reason text
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_id uuid; v_current numeric;
begin
  if not private.is_business_member(p_business_id) then raise exception 'Business access denied'; end if;
  if p_quantity=0 then raise exception 'Adjustment quantity cannot be zero'; end if;
  if not exists(select 1 from products where id=p_product_id and business_id=p_business_id and is_active) then raise exception 'Product not found'; end if;
  if not exists(select 1 from locations where id=p_location_id and business_id=p_business_id and is_active) then raise exception 'Location not found'; end if;
  if p_quantity<0 then
    select coalesce(sum(quantity),0) into v_current from inventory_movements where business_id=p_business_id and product_id=p_product_id and location_id=p_location_id;
    if v_current+p_quantity<0 then raise exception 'Insufficient stock for adjustment'; end if;
  end if;
  insert into inventory_movements(business_id,product_id,location_id,movement_type,quantity,unit_cost,notes,created_by)
  values(p_business_id,p_product_id,p_location_id,case when p_quantity>0 then 'adjustment_in' else 'adjustment_out' end,p_quantity,coalesce(p_unit_cost,0),p_reason,auth.uid())
  returning id into v_id;
  insert into audit_log(business_id,user_id,action,entity_type,entity_id,metadata)
  values(p_business_id,auth.uid(),'stock.adjusted','inventory_movement',v_id,jsonb_build_object('quantity',p_quantity,'reason',p_reason));
  return jsonb_build_object('movementId',v_id);
end; $$;
revoke all on function public.adjust_stock(uuid,uuid,uuid,numeric,numeric,text) from public,anon;
grant execute on function public.adjust_stock(uuid,uuid,uuid,numeric,numeric,text) to authenticated;
