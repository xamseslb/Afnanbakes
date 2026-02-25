-- ══════════════════════════════════════════════════════════════════════════════
-- AfnanBakes — Row Level Security (RLS)
-- Kjør dette i Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. ORDERS ─────────────────────────────────────────────────────────────────

-- Aktiver RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Fjern eventuelle gamle policyer
DROP POLICY IF EXISTS "Anon kan opprette bestillinger" ON orders;
DROP POLICY IF EXISTS "Anon kan lese egne bestillinger" ON orders;
DROP POLICY IF EXISTS "Anon kan kansellere egne bestillinger" ON orders;
DROP POLICY IF EXISTS "Service role har full tilgang" ON orders;

-- Hvem som helst (anon) kan legge inn bestillinger
CREATE POLICY "Anon kan opprette bestillinger"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon kan lese bestillinger som matcher e-posten de oppgir
-- (brukes av ordre-bekreftelse og kansellering)
CREATE POLICY "Anon kan lese egne bestillinger"
  ON orders FOR SELECT
  TO anon
  USING (true);
  -- MERK: Vi bruker 'true' her fordi kunden trenger å slå opp ordrer via
  -- ordrereferanse i CancelOrder-siden. Kalender-tjenesten trenger også å
  -- telle ordrer per dato. Sensitive data (navn, e-post) er synlig, men
  -- det er nødvendig for korrekt funksjonalitet.
  -- I en fremtidig versjon kan dette strammes inn med en Edge Function.

-- Anon kan oppdatere status til 'cancelled' (kun for kansellering)
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

-- Service role (Edge Functions) trenger også tilgang
-- service_role bypasser RLS automatisk, så ingen policy nødvendig.

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
