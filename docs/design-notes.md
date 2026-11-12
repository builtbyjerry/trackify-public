# Future Features & Architecture Notes

## Multi-business onboarding flow (Owner vs Employee)

### Context
Currently the app supports a single business context per signup. To scale 
to multiple businesses using the app, signup needs to branch based on the 
user's role from the start.

### Proposed flow

1. **Role selection** (new first step)
   - "Are you signing up as a Business Owner or an Employee?"

2. **Business Owner path**
   - Create business profile (business name, contact info, etc.)
   - Add initial product catalogue:
     - Manually enter first product, OR
     - Bulk upload via provided Excel/CSV template
   - On success → redirect to (main)

3. **Employee path**
   - Enter a unique invite link/code provided by the business owner
   - On valid entry → linked to that business's catalogue, access to (main)
   - On invalid/expired code → error state, retry or contact owner

### Schema implications
- `employees` table becomes the join table: user_id + business_id + role
- Business owners need a `businesses` table (name, contact info, settings, etc.)
- Invite links/codes need their own table or a token system tied to `businesses`
- Employee signup creates a `profiles` row + `employees` row (linked via invite)
- Owner signup creates a `profiles` row + `businesses` row + `employees` row 
  (role = owner)

### Open questions
- Can a user be an employee at multiple businesses? (affects employees table 
  uniqueness constraints)
- What happens to invite links after use — single-use, expiring, reusable?
- Does onboarding (PIN setup, avatar) happen before or after business/role 
  selection?
- Product catalogue upload — what format/columns are required? Validation 
  on upload?




## Product schema

### Product vs Variant distinction
- `products` = a distinct item with its own cost basis (`cost_per_base_unit`, `base_unit`)
- `product_variants` = different packaging/quantities of the SAME product (e.g. 
  single bottle vs crate of 12 — same drink, same cost basis, different selling unit)

### Rule for adding new products vs variants
- Different flavor, size, or cost basis → NEW PRODUCT (e.g. Coke 35cl vs Coke 50cl 
  are different products, not variants of "Coke")
- Same item, different packaging/quantity sold → VARIANT (e.g. Fanta sold as single 
  bottle vs crate of 12 — same product, two variants)

This keeps `cost_per_base_unit` accurate per product. If a future business needs 
genuinely different costs per "variant" (e.g. bulk discount pricing from supplier), 
revisit this — may need to move cost tracking to the variant level instead.

### Soft delete
- `is_active` (already on both `products` and `product_variants`) is the deletion 
  mechanism — no separate archive table.
- Deactivating a product/variant hides it from the catalogue but preserves 
  transaction history (never hard-deleted while referenced).
- Hard delete only allowed if zero `transaction_items` reference the product/variant.


## stock_entries — future consideration

The cost calculator ("I bought X units for ₦Y") maps directly to a future
stock_entries row. When implemented:
- base_unit should always be the smallest indivisible selling unit
- stock is tracked at base_unit level, variants are just multiples
- A "bag" purchase would be entered as 20 satchets in stock_entries,
  not 1 bag — keeps tracking consistent with how variants are calculated

Fractional units_per_variant (e.g. 0.15 bags) are a signal that the wrong
base_unit was chosen. The UI hint should guide owners toward atomic units.
