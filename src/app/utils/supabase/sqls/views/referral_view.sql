drop view if exists referral_view;

create view public.referral_view with (security_invoker = on) as
select
  affiliate_id,
  sum(
    referrals.commission_rate * referrals.quantity_of_order
  ) as total_amount,
  count(referrals.id) as count,
  sum(referrals.quantity_of_order) as order_count
from
  referrals
group by
  referrals.affiliate_id