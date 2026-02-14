-- AfnanBakes: Orders table for Supabase
-- Run this SQL in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create the orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  order_ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  occasion TEXT NOT NULL,
  product_type TEXT DEFAULT '',
  package_name TEXT DEFAULT '',
  package_price NUMERIC DEFAULT NULL,
  is_custom_design BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  ideas TEXT DEFAULT '',
  cake_name TEXT DEFAULT '',
  cake_text TEXT DEFAULT '',
  quantity TEXT DEFAULT '',
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- 2. Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to INSERT orders (public ordering form)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Allow anyone to SELECT orders (needed for admin panel + cancel page using anon key)
CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Allow anyone to UPDATE orders (needed for admin status updates + cancellation)
CREATE POLICY "Anyone can update orders"
  ON orders
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Create storage bucket for order images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('orders', 'orders', true);

-- ============================================================
-- MIGRATION: Run this on an EXISTING table to add new columns
-- ============================================================
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_name TEXT DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_price NUMERIC DEFAULT NULL;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_custom_design BOOLEAN DEFAULT false;
-- ALTER TABLE orders ALTER COLUMN quantity DROP NOT NULL;
-- ALTER TABLE orders ALTER COLUMN quantity SET DEFAULT '';
-- ALTER TABLE orders ALTER COLUMN product_type DROP NOT NULL;
-- ALTER TABLE orders ALTER COLUMN product_type SET DEFAULT '';
--
-- -- Add UPDATE policy (if it doesn't exist):
-- CREATE POLICY "Anyone can update orders"
--   ON orders FOR UPDATE TO anon, authenticated
--   USING (true) WITH CHECK (true);

