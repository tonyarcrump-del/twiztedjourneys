# Admin Merch Orders

Tonya should review customer merch orders from:

`admin/shop.html#merch-orders`

The admin order view is meant to replace opening Supabase for daily order review. It shows customer contact details, item details, shipping address, notes, payment status, order status, Stripe session ID if present, and created date.

Before orders appear, run this SQL manually in the Supabase SQL Editor:

`admin/sql/admin-merch-orders-rls.sql`

That policy keeps anonymous checkout/order capture working, does not allow anonymous order reads, and does not add any delete access.

The admin page has no delete button for merch orders. Status changes only update the `order_status` column; they do not update customer info, item info, payment status, Stripe session ID, or shipping details.

If Supabase Auth is ever opened to non-admin users, tighten the SQL policy before running it by replacing the authenticated-role check with a true admin claim or allowlist.
