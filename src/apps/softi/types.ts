export interface Mt5Signal {
  id: string;
  symbol: string;
  action: string | null;
  confidence_score: number | null;
  base_confidence: number | null;
  market_regime: string | null;
  wyckoff_phase: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface AiReport {
  id: string;
  user_id: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  markdown_content: string | null;
  source_metadata: {
    signals_count: number;
    symbols: string[];
    since: string;
  } | null;
  created_at: string;
}

export interface AnalysisHistoryItem {
  id: string;
  user_id: string;
  asset_symbols: string[] | null;
  prompt: string | null;
  response: string | null;
  created_at: string;
}

export type SoftiTab = 'feed' | 'analysis' | 'reports' | 'chat';
