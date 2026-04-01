import { RawTransaction } from '../types';
import { ExchangeParser } from './types';
import { binanceParser } from './binance-parser';
import { bybitParser } from './bybit-parser';

const PARSERS: Record<string, ExchangeParser> = {
  binance: binanceParser,
  bybit: bybitParser,
};

export function detectExchange(html: string): string | null {
  for (const [name, parser] of Object.entries(PARSERS)) {
    if (parser.detect(html)) {
      return name;
    }
  }
  return null;
}

export function parseExchangeHtml(html: string, sourceFile: string = ''): RawTransaction[] {
  const exchange = detectExchange(html);
  if (!exchange || !PARSERS[exchange]) {
    return [];
  }
  return PARSERS[exchange].parse(html);
}

export function getSupportedExchanges(): string[] {
  return Object.keys(PARSERS);
}
