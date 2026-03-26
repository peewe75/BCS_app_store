-- Softi AI Analyzer — tabelle per BCS AI Suite
-- Fase 4 del codex_database_plan.txt

-- 1. Segnali MT5 (feed condiviso, read-only per i client)
CREATE TABLE IF NOT EXISTS softi_mt5_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR NOT NULL,
  action VARCHAR,
  confidence_score NUMERIC,
  base_confidence NUMERIC,
  market_regime VARCHAR,
  wyckoff_phase VARCHAR,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS softi_mt5_signals_symbol_idx ON softi_mt5_signals (symbol);
CREATE INDEX IF NOT EXISTS softi_mt5_signals_created_at_idx ON softi_mt5_signals (created_at DESC);

ALTER TABLE softi_mt5_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "softi_read_signals" ON softi_mt5_signals;
CREATE POLICY "softi_read_signals" ON softi_mt5_signals
  FOR SELECT USING (true);

-- 2. Report AI generati per utente (Daily/Weekly/Monthly)
CREATE TABLE IF NOT EXISTS softi_ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  timeframe VARCHAR NOT NULL,
  markdown_content TEXT,
  source_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS softi_ai_reports_user_idx ON softi_ai_reports (user_id);
CREATE INDEX IF NOT EXISTS softi_ai_reports_created_at_idx ON softi_ai_reports (created_at DESC);

ALTER TABLE softi_ai_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "softi_own_reports_select" ON softi_ai_reports;
CREATE POLICY "softi_own_reports_select" ON softi_ai_reports
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "softi_own_reports_insert" ON softi_ai_reports;
CREATE POLICY "softi_own_reports_insert" ON softi_ai_reports
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "softi_own_reports_delete" ON softi_ai_reports;
CREATE POLICY "softi_own_reports_delete" ON softi_ai_reports
  FOR DELETE USING (user_id = (auth.jwt() ->> 'sub'));

-- 3. Storico analisi interattive (chat) per utente
CREATE TABLE IF NOT EXISTS softi_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  asset_symbols TEXT[],
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS softi_analysis_history_user_idx ON softi_analysis_history (user_id);
CREATE INDEX IF NOT EXISTS softi_analysis_history_created_at_idx ON softi_analysis_history (created_at DESC);

ALTER TABLE softi_analysis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "softi_own_history_select" ON softi_analysis_history;
CREATE POLICY "softi_own_history_select" ON softi_analysis_history
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "softi_own_history_insert" ON softi_analysis_history;
CREATE POLICY "softi_own_history_insert" ON softi_analysis_history
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "softi_own_history_delete" ON softi_analysis_history;
CREATE POLICY "softi_own_history_delete" ON softi_analysis_history
  FOR DELETE USING (user_id = (auth.jwt() ->> 'sub'));
