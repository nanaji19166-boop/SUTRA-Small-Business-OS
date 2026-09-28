create or replace function public.record_collection_payment(
  p_business_id uuid,p_schedule_id uuid,p_amount numeric,p_payment_method text,
  p_payment_date date,p_reference text,p_notes text
) returns jsonb
language plpgsql security invoker set search_path=public
as $$
declare
  v_payment_id uuid; v_customer_id uuid; v_outstanding numeric; v_new_outstanding numeric;
  v_frequency text; v_due date; v_next date;
begin
  if not private.is_business_member(p_business_id) then raise exception 'Business access denied'; end if;
  if p_amount<=0 then raise exception 'Payment must be greater than zero'; end if;
  select customer_id,outstanding_amount,frequency,next_due_date into v_customer_id,v_outstanding,v_frequency,v_due
  from public.collection_schedules where id=p_schedule_id and business_id=p_business_id and is_active for update;
  if not found then raise exception 'Collection schedule not found'; end if;
  if p_amount>v_outstanding then raise exception 'Payment exceeds collection outstanding'; end if;
  v_new_outstanding:=v_outstanding-p_amount;
  if v_new_outstanding>0 then v_next:=public.next_collection_due_date(coalesce(v_due,current_date),v_frequency); else v_next:=null; end if;
  insert into public.payments(business_id,customer_id,amount,payment_method,payment_date,reference,notes,created_by)
  values(p_business_id,v_customer_id,p_amount,p_payment_method,coalesce(p_payment_date,current_date),p_reference,p_notes,auth.uid())
  returning id into v_payment_id;
  insert into public.collection_payments(schedule_id,payment_id,amount_applied)
  values(p_schedule_id,v_payment_id,p_amount);
  update public.collection_schedules
  set outstanding_amount=v_new_outstanding,is_active=v_new_outstanding>0,next_due_date=v_next,updated_at=now()
  where id=p_schedule_id;
  insert into public.audit_log(business_id,user_id,action,entity_type,entity_id,metadata)
  values(p_business_id,auth.uid(),'collection.payment_recorded','collection_schedule',p_schedule_id,
    jsonb_build_object('paymentId',v_payment_id,'amount',p_amount,'remaining',v_new_outstanding));
  return jsonb_build_object('paymentId',v_payment_id,'scheduleId',p_schedule_id,'appliedAmount',p_amount,'remainingAmount',v_new_outstanding,'nextDueDate',v_next);
end;
$$;
revoke all on function public.record_collection_payment(uuid,uuid,numeric,text,date,text,text) from public,anon;
grant execute on function public.record_collection_payment(uuid,uuid,numeric,text,date,text,text) to authenticated;
