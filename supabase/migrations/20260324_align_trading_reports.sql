-- Align trading_reports to match the application code schema
ALTER TABLE trading_reports
  ADD COLUMN IF NOT EXISTS filename text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS storage_key text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'base',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS net_profit numeric,
  ADD COLUMN IF NOT EXISTS report_data jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE trading_reports SET year = tax_year WHERE year IS NULL AND tax_year IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_trading_reports_user_id ON trading_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_reports_user_year ON trading_reports(user_id, year);
CREATE INDEX IF NOT EXISTS idx_user_apps_user_id ON user_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_forfapp_user_id ON forfapp_calculations(user_id);
