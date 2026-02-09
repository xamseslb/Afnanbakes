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
  product_type TEXT NOT NULL,
  description TEXT DEFAULT '',
  ideas TEXT DEFAULT '',
  cake_name TEXT DEFAULT '',
  cake_text TEXT DEFAULT '',
  quantity TEXT NOT NULL,
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

-- 4. Only authenticated users (admin) can read orders
CREATE POLICY "Authenticated users can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Create storage bucket for order images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('orders', 'orders', true);

-- ============================================================
-- MIGRATION: Run this on an EXISTING table to add new columns
-- ============================================================
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_ref TEXT UNIQUE;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT NOT NULL DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT '';
