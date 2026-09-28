create index if not exists idx_audit_log_business on public.audit_log(business_id);
create index if not exists idx_locations_responsible_user on public.locations(responsible_user_id);

drop policy if exists membership_select on public.business_memberships;
drop policy if exists membership_owner_write on public.business_memberships;
create policy membership_select on public.business_memberships for select to authenticated
using ((user_id = (select auth.uid())) or private.is_business_member(business_id));
create policy membership_owner_write on public.business_memberships for insert to authenticated
with check (private.is_business_owner(business_id));
create policy membership_owner_update on public.business_memberships for update to authenticated
using (private.is_business_owner(business_id)) with check (private.is_business_owner(business_id));
create policy membership_owner_delete on public.business_memberships for delete to authenticated
using (private.is_business_owner(business_id));

drop policy if exists business_member_select on public.businesses;
drop policy if exists business_member_write on public.businesses;
create policy business_member_select on public.businesses for select to authenticated
using (private.is_business_member(id) or owner_user_id = (select auth.uid()));
create policy business_member_insert on public.businesses for insert to authenticated
with check (owner_user_id = (select auth.uid()));
create policy business_member_update on public.businesses for update to authenticated
using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));
create policy business_member_delete on public.businesses for delete to authenticated
using (owner_user_id = (select auth.uid()));
