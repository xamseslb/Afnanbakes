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

-- ══════════════════════════════════════════════════════════════════════════════
-- VIKTIG: RLS-policyene er FLYTTET til supabase/rls_policies.sql
-- IKKE kjør de gamle policyene nedenfor — de er USIKRE!
-- Kjør supabase/rls_policies.sql i stedet.
-- ══════════════════════════════════════════════════════════════════════════════

-- 3. Create storage bucket for order images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('orders', 'orders', true);

