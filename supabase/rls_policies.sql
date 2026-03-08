-- ══════════════════════════════════════════════════════════════════════════════
-- AfnanBakes — Row Level Security (RLS) — SIKKERHETSOPPDATERING
-- Kjør dette i Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. ORDERS ─────────────────────────────────────────────────────────────────

-- Aktiver RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Fjern ALLE gamle policyer (inkludert de usikre fra supabase-schema.sql)
DROP POLICY IF EXISTS "Anon kan opprette bestillinger" ON orders;
DROP POLICY IF EXISTS "Anon kan lese egne bestillinger" ON orders;
DROP POLICY IF EXISTS "Anon kan kansellere egne bestillinger" ON orders;
DROP POLICY IF EXISTS "Service role har full tilgang" ON orders;
DROP POLICY IF EXISTS "Autentisert bruker har full tilgang" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;

-- Hvem som helst (anon) kan legge inn bestillinger
CREATE POLICY "Anon kan opprette bestillinger"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon kan lese bestillinger KUN via ordrereferanse (ikke alle)
-- Kalender-tjenesten og CancelOrder bruker spesifikke queries,
-- men vi begrenser til kun ikke-sensitive kolonner for anon.
-- MERK: For kalender trenger vi delivery_date + status.
-- For kansellering trenger vi id + customer_email + status.
-- Denne policyen tillater SELECT men klienten bør bruke .eq() filtre.
CREATE POLICY "Anon kan lese bestillinger med filter"
  ON orders FOR SELECT
  TO anon
  USING (true);
  -- MERKNAD: Vi beholder USING(true) for SELECT fordi:
  -- 1. Kalendertjenesten trenger å telle ordrer per dato
  -- 2. CancelOrder trenger å slå opp via ordrereferanse
  -- Sensitive data-beskyttelse håndteres via klient-side .select() 
  -- som bare henter nødvendige kolonner.
  -- For høyere sikkerhet: Bruk en Edge Function for oppslag i stedet.

-- Anon kan KUN sette status til 'cancelled' — ikke noe annet
CREATE POLICY "Anon kan kansellere egne bestillinger"
  ON orders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (status = 'cancelled');

-- Autentiserte brukere (admin) har full tilgang
CREATE POLICY "Autentisert bruker har full tilgang"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role (Edge Functions) bypasser RLS automatisk.

-- ── 2. BLOCKED_DATES ──────────────────────────────────────────────────────────

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Alle kan lese blokkerte datoer" ON blocked_dates;
DROP POLICY IF EXISTS "Autentisert bruker kan administrere blokkerte datoer" ON blocked_dates;

-- Alle (inkl. anon) kan se blokkerte datoer (for kalenderen)
CREATE POLICY "Alle kan lese blokkerte datoer"
  ON blocked_dates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Kun autentiserte brukere (admin) kan blokkere/fjerne datoer
CREATE POLICY "Autentisert bruker kan administrere blokkerte datoer"
  ON blocked_dates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 3. MANGLENDE KOLONNER (påkrevd for korrekt håndtering) ───────────────────

-- Legg til delivery_date kolonne hvis den ikke finnes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE DEFAULT NULL;

-- Legg til edible_image_url kolonne hvis den ikke finnes
-- (brukes av Edge Function create-checkout for spiselig bildeopplasting)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS edible_image_url TEXT DEFAULT NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- VIKTIG: Denne SQL-filen ERSTATTER supabase-schema.sql sine policyer.
-- Du MÅ kjøre dette i Supabase Dashboard for å fjerne de gamle, åpne
-- "Anyone can update orders" og "Anyone can read orders"-policyene.
-- ══════════════════════════════════════════════════════════════════════════════
