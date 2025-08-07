drop view if exists referral_view;

create view public.referral_view with (security_invoker = on) as
select
  referred_store_url,
  sum(
    referrals.commission_rate * referrals.quantity_of_order
  ) as total_amount,
  count(referrals.id) as count,
  sum(referrals.quantity_of_order) as order_count
from
  referrals
group by
  referrals.customer_number