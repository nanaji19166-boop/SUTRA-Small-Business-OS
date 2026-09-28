create schema if not exists private;

create or replace function private.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.business_memberships where business_id = target_business_id and user_id = auth.uid() and status = 'active'); $$;

create or replace function private.is_business_owner(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.business_memberships where business_id = target_business_id and user_id = auth.uid() and role = 'owner' and status = 'active'); $$;

revoke all on function private.is_business_member(uuid) from public, anon, authenticated;
revoke all on function private.is_business_owner(uuid) from public, anon, authenticated;

drop policy if exists business_member_select on public.businesses;
drop policy if exists business_member_write on public.businesses;
create policy business_member_select on public.businesses for select to authenticated using (private.is_business_member(id) or owner_user_id = (select auth.uid()));
create policy business_member_write on public.businesses for all to authenticated using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));

drop policy if exists membership_select on public.business_memberships;
drop policy if exists membership_owner_write on public.business_memberships;
create policy membership_select on public.business_memberships for select to authenticated using (user_id = (select auth.uid()) or private.is_business_member(business_id));
create policy membership_owner_write on public.business_memberships for all to authenticated using (private.is_business_owner(business_id)) with check (private.is_business_owner(business_id));

drop policy if exists business_settings_scope on public.business_settings;
create policy business_settings_scope on public.business_settings for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists locations_scope on public.locations;
create policy locations_scope on public.locations for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists customers_scope on public.customers;
create policy customers_scope on public.customers for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists suppliers_scope on public.suppliers;
create policy suppliers_scope on public.suppliers for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists products_scope on public.products;
create policy products_scope on public.products for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists purchases_scope on public.purchases;
create policy purchases_scope on public.purchases for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists sales_scope on public.sales;
create policy sales_scope on public.sales for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists payments_scope on public.payments;
create policy payments_scope on public.payments for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists collection_schedules_scope on public.collection_schedules;
create policy collection_schedules_scope on public.collection_schedules for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists expenses_scope on public.expenses;
create policy expenses_scope on public.expenses for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists inventory_scope on public.inventory_movements;
create policy inventory_scope on public.inventory_movements for all to authenticated using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists audit_scope on public.audit_log;
create policy audit_scope on public.audit_log for select to authenticated using (private.is_business_member(business_id));
drop policy if exists audit_insert on public.audit_log;
create policy audit_insert on public.audit_log for insert to authenticated with check (private.is_business_member(business_id));

drop policy if exists purchase_lines_scope on public.purchase_lines;
create policy purchase_lines_scope on public.purchase_lines for all to authenticated using (exists (select 1 from public.purchases p where p.id=purchase_lines.purchase_id and private.is_business_member(p.business_id))) with check (exists (select 1 from public.purchases p where p.id=purchase_lines.purchase_id and private.is_business_member(p.business_id)));

drop policy if exists sale_lines_scope on public.sale_lines;
create policy sale_lines_scope on public.sale_lines for all to authenticated using (exists (select 1 from public.sales s where s.id=sale_lines.sale_id and private.is_business_member(s.business_id))) with check (exists (select 1 from public.sales s where s.id=sale_lines.sale_id and private.is_business_member(s.business_id)));

drop policy if exists collection_payments_scope on public.collection_payments;
create policy collection_payments_scope on public.collection_payments for all to authenticated using (exists (select 1 from public.collection_schedules c where c.id=collection_payments.schedule_id and private.is_business_member(c.business_id))) with check (exists (select 1 from public.collection_schedules c where c.id=collection_payments.schedule_id and private.is_business_member(c.business_id)));

alter function public.next_collection_due_date(date,text) set search_path = public;
revoke all on function public.is_business_member(uuid) from public, anon, authenticated;
revoke all on function public.is_business_owner(uuid) from public, anon, authenticated;
drop function public.is_business_member(uuid);
drop function public.is_business_owner(uuid);

create index if not exists idx_businesses_owner on public.businesses(owner_user_id);
create index if not exists idx_locations_business on public.locations(business_id);
create index if not exists idx_customers_business on public.customers(business_id);
create index if not exists idx_suppliers_business on public.suppliers(business_id);
create index if not exists idx_purchases_supplier on public.purchases(supplier_id);
create index if not exists idx_purchases_location on public.purchases(location_id);
create index if not exists idx_sales_customer on public.sales(customer_id);
create index if not exists idx_sales_location on public.sales(location_id);
create index if not exists idx_payments_customer on public.payments(customer_id);
create index if not exists idx_payments_supplier on public.payments(supplier_id);
create index if not exists idx_payments_sale on public.payments(sale_id);
create index if not exists idx_payments_purchase on public.payments(purchase_id);
create index if not exists idx_collection_schedules_customer on public.collection_schedules(customer_id);
create index if not exists idx_collection_schedules_sale on public.collection_schedules(sale_id);
create index if not exists idx_collection_payments_schedule on public.collection_payments(schedule_id);
create index if not exists idx_collection_payments_payment on public.collection_payments(payment_id);
create index if not exists idx_expenses_created_by on public.expenses(created_by);
create index if not exists idx_inventory_created_by on public.inventory_movements(created_by);
create index if not exists idx_purchase_lines_purchase on public.purchase_lines(purchase_id);
create index if not exists idx_purchase_lines_product on public.purchase_lines(product_id);
create index if not exists idx_sale_lines_sale on public.sale_lines(sale_id);
create index if not exists idx_sale_lines_product on public.sale_lines(product_id);
create index if not exists idx_sales_created_by on public.sales(created_by);
create index if not exists idx_purchases_created_by on public.purchases(created_by);
create index if not exists idx_payments_created_by on public.payments(created_by);
create index if not exists idx_audit_log_user on public.audit_log(user_id);