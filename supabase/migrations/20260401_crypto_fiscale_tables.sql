-- Crypto Fiscale module tables
-- Migration: 20260401_crypto_fiscale_tables

-- Main session table
CREATE TABLE IF NOT EXISTS crypto_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id),
  anno_fiscale INT NOT NULL,
  modello TEXT CHECK (modello IN ('730', 'Redditi PF')),
  status TEXT DEFAULT 'draft',
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Raw imported transactions
CREATE TABLE IF NOT EXISTS crypto_raw_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES crypto_sessions(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,
  timestamp_utc TIMESTAMPTZ,
  causale_raw TEXT,
  asset_in TEXT, qty_in NUMERIC(24,8),
  asset_out TEXT, qty_out NUMERIC(24,8),
  fee_asset TEXT, fee_qty NUMERIC(24,8),
  valore_eur NUMERIC(18,2),
  order_id TEXT, tx_hash TEXT,
  source_file TEXT, riga_sorgente INT,
  raw_data JSONB
);

-- Calculation results (denormalized for performance)
CREATE TABLE IF NOT EXISTS crypto_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES crypto_sessions(id) ON DELETE CASCADE,
  quadro_rw JSONB,
  quadro_rt JSONB,
  proventi JSONB,
  realizzi JSONB,
  lotti JSONB,
  allocazioni JSONB,
  audit_errors JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_sessions_user ON crypto_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_raw_session ON crypto_raw_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_crypto_results_session ON crypto_results(session_id);

-- RLS policies
ALTER TABLE crypto_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_raw_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crypto_sessions_user ON crypto_sessions;
CREATE POLICY crypto_sessions_user ON crypto_sessions
  FOR ALL USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS crypto_raw_user ON crypto_raw_transactions;
CREATE POLICY crypto_raw_user ON crypto_raw_transactions
  FOR ALL USING (session_id IN (SELECT id FROM crypto_sessions WHERE user_id = (auth.jwt() ->> 'sub')));

DROP POLICY IF EXISTS crypto_results_user ON crypto_results;
CREATE POLICY crypto_results_user ON crypto_results
  FOR ALL USING (session_id IN (SELECT id FROM crypto_sessions WHERE user_id = (auth.jwt() ->> 'sub')));
