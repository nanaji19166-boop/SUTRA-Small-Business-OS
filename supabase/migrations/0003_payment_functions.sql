create or replace function public.next_collection_due_date(p_from date, p_frequency text)
returns date
language plpgsql
immutable
as $$
declare
  v_year int;
  v_month int;
  v_day int;
  v_last_day int;
begin
  if p_frequency='daily' then return p_from + 1; end if;
  if p_frequency='weekly' then return p_from + 7; end if;
  if p_frequency='fortnightly' then return p_from + 14; end if;
  if p_frequency='monthly' then
    v_year := extract(year from (p_from + interval '1 month'))::int;
    v_month := extract(month from (p_from + interval '1 month'))::int;
    v_day := extract(day from p_from)::int;
    v_last_day := extract(day from (date_trunc('month', make_date(v_year,v_month,1)) + interval '1 month - 1 day'))::int;
    return make_date(v_year,v_month,least(v_day,v_last_day));
  end if;
  raise exception 'Invalid collection frequency';
end;
$$;

create or replace function public.record_payment(
  p_business_id uuid,
  p_customer_id uuid,
  p_supplier_id uuid,
  p_sale_id uuid,
  p_purchase_id uuid,
  p_schedule_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_date date,
  p_reference text,
  p_notes text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_customer_id uuid := p_customer_id;
  v_supplier_id uuid := p_supplier_id;
  v_schedule_customer_id uuid;
  v_outstanding numeric;
  v_new_outstanding numeric;
  v_next date;
  v_frequency text;
  v_due date;
begin
  if not is_business_member(p_business_id) then raise exception 'Business access denied'; end if;
  if p_amount <= 0 then raise exception 'Payment must be greater than zero'; end if;
  if p_sale_id is null and p_purchase_id is null and p_schedule_id is null and p_customer_id is null and p_supplier_id is null then
    raise exception 'A payment target is required';
  end if;

  if p_sale_id is not null then
    select customer_id,balance_amount into v_customer_id,v_outstanding
    from sales where id=p_sale_id and business_id=p_business_id and status='confirmed' for update;
    if not found then raise exception 'Sale not found'; end if;
    if p_amount > v_outstanding then raise exception 'Payment exceeds sale balance'; end if;
    update sales
      set paid_amount=paid_amount+p_amount,
          balance_amount=balance_amount-p_amount,
          updated_at=now()
    where id=p_sale_id;
  end if;

  if p_purchase_id is not null then
    select supplier_id,total_amount-paid_amount into v_supplier_id,v_outstanding
    from purchases where id=p_purchase_id and business_id=p_business_id and status='confirmed' for update;
    if not found then raise exception 'Purchase not found'; end if;
    if p_amount > v_outstanding then raise exception 'Payment exceeds purchase balance'; end if;
    update purchases
      set paid_amount=paid_amount+p_amount, updated_at=now()
    where id=p_purchase_id;
  end if;

  insert into payments(
    business_id,customer_id,supplier_id,sale_id,purchase_id,amount,payment_method,
    payment_date,reference,notes,created_by
  ) values(
    p_business_id,v_customer_id,v_supplier_id,p_sale_id,p_purchase_id,p_amount,
    p_payment_method,coalesce(p_payment_date,current_date),p_reference,p_notes,auth.uid()
  ) returning id into v_payment_id;

  if p_schedule_id is not null then
    select customer_id,outstanding_amount,frequency,next_due_date
      into v_schedule_customer_id,v_outstanding,v_frequency,v_due
    from collection_schedules
    where id=p_schedule_id and business_id=p_business_id and is_active
    for update;

    if not found then raise exception 'Collection schedule not found'; end if;
    if p_customer_id is not null and p_customer_id is distinct from v_schedule_customer_id then
      raise exception 'Payment customer does not match collection';
    end if;
    v_customer_id := v_schedule_customer_id;
    if p_sale_id is not null then
      if not exists (
        select 1 from sales
        where id=p_sale_id and business_id=p_business_id and customer_id=v_schedule_customer_id
      ) then raise exception 'Sale does not match collection customer'; end if;
    end if;
    if p_amount > v_outstanding then raise exception 'Payment exceeds collection outstanding'; end if;

    v_new_outstanding := v_outstanding-p_amount;
    if v_new_outstanding > 0 then
      v_next := next_collection_due_date(coalesce(v_due,current_date),v_frequency);
    else
      v_next := null;
    end if;

    insert into collection_payments(schedule_id,payment_id,amount_applied)
    values(p_schedule_id,v_payment_id,p_amount);

    update collection_schedules
      set outstanding_amount=v_new_outstanding,
          is_active=v_new_outstanding>0,
          next_due_date=v_next,
          updated_at=now()
    where id=p_schedule_id;
  end if;

  insert into audit_log(business_id,user_id,action,entity_type,entity_id,metadata)
  values(p_business_id,auth.uid(),'payment.recorded','payment',v_payment_id,
    jsonb_build_object('amount',p_amount,'saleId',p_sale_id,'purchaseId',p_purchase_id,'scheduleId',p_schedule_id));

  return jsonb_build_object('paymentId',v_payment_id,'appliedAmount',p_amount);
end;
$$;

revoke all on function public.next_collection_due_date(date,text) from public;
revoke all on function public.record_payment(uuid,uuid,uuid,uuid,uuid,uuid,numeric,text,date,text,text) from public;
grant execute on function public.next_collection_due_date(date,text) to authenticated;
grant execute on function public.record_payment(uuid,uuid,uuid,uuid,uuid,uuid,numeric,text,date,text,text) to authenticated;
