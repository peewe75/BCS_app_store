import { RawTransaction } from '../types';
import { ExchangeParser } from './types';

function generateId(): string {
  return `bybit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseBybitTimestamp(ts: string): Date | null {
  if (!ts) return null;
  try {
    return new Date(ts.replace(' ', 'T') + 'Z');
  } catch {
    return null;
  }
}

function mapBybitOperation(type: string): string {
  const upper = type.toUpperCase().trim();
  if (upper.includes('BUY') || upper.includes('PURCHASE')) return 'BUY';
  if (upper.includes('SELL') || upper.includes('SALE')) return 'SELL';
  if (upper.includes('DEPOSIT')) return 'DEPOSIT';
  if (upper.includes('WITHDRAW')) return 'WITHDRAWAL';
  if (upper.includes('STAKING') || upper.includes('EARN')) return 'STAKING_REWARD';
  if (upper.includes('AIRDROP')) return 'AIRDROP';
  if (upper.includes('REFERRAL')) return 'REFERRAL_BONUS';
  if (upper.includes('LAUNCHPOOL')) return 'LAUNCHPOOL_REWARD';
  if (upper.includes('CASHBACK')) return 'CASHBACK';
  if (upper.includes('CONVERT')) return 'CONVERT';
  if (upper.includes('TRANSFER') && upper.includes('IN')) return 'TRANSFER_IN';
  if (upper.includes('TRANSFER') && upper.includes('OUT')) return 'TRANSFER_OUT';
  if (upper.includes('FEE') || upper.includes('COMMISSION')) return 'FEE';
  if (upper.includes('REBATE')) return 'REBATE';
  if (upper.includes('DISTRIBUTION')) return 'DISTRIBUTION';
  if (upper.includes('FUTURES')) {
    if (upper.includes('SETTLE')) return 'FUTURES_SETTLEMENT';
    if (upper.includes('FUNDING')) return 'FUTURES_FUNDING';
  }
  if (upper.includes('SWAP')) return 'SWAP';
  if (upper.includes('DUST')) return 'DUST_CONVERSION';
  if (upper.includes('INTEREST')) return 'INTEREST';
  return upper;
}

export const bybitParser: ExchangeParser = {
  detect(html: string): boolean {
    const markers = [
      'Bybit',
      'Time(UTC)',
      'Type',
      'Coin',
      'Change',
      'Fee',
    ];
    return markers.some((m) => html.includes(m));
  },

  parse(html: string): RawTransaction[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const transactions: RawTransaction[] = [];

    const tables = doc.querySelectorAll('table');
    if (!tables.length) {
      const rows = doc.querySelectorAll('tr');
      rows.forEach((row, idx) => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 4) {
          const values = Array.from(cells).map((c) => c.textContent?.trim() || '');
          const tx = extractBybitTransaction(values, idx, '');
          if (tx) transactions.push(tx);
        }
      });
    } else {
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, idx) => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 4) {
            const values = Array.from(cells).map((c) => c.textContent?.trim() || '');
            const tx = extractBybitTransaction(values, idx, '');
            if (tx) transactions.push(tx);
          }
        });
      });
    }

    return transactions;
  },
};

function extractBybitTransaction(
  values: string[],
  rowIndex: number,
  sourceFile: string,
): RawTransaction | null {
  if (values.length < 4) return null;

  const timestamp = parseBybitTimestamp(values[0]);
  const type = values[1];
  const coin = values[2];
  const change = values[3];
  const fee = values[4] || '';

  if (!type || !coin) return null;
  if (type === 'Type' || type === 'Time(UTC)') return null;

  const causale = mapBybitOperation(type);
  const qty = parseFloat(change) || 0;

  const isPositive = qty >= 0;
  const assetIn = isPositive ? coin.toUpperCase() : null;
  const assetOut = !isPositive ? coin.toUpperCase() : null;
  const qtyIn = isPositive ? Math.abs(qty) : null;
  const qtyOut = !isPositive ? Math.abs(qty) : null;

  let feeAsset: string | null = null;
  let feeQty: number | null = null;
  if (fee) {
    const feeNum = parseFloat(fee);
    if (!isNaN(feeNum) && feeNum !== 0) {
      feeAsset = coin.toUpperCase();
      feeQty = Math.abs(feeNum);
    }
  }

  return {
    id: generateId(),
    exchange: 'Bybit',
    timestampUTC: timestamp,
    causaleRaw: causale,
    assetIn,
    qtyIn,
    assetOut,
    qtyOut,
    feeAsset,
    feeQty,
    valoreEUR: null,
    orderID: null,
    txHash: null,
    sourceFile,
    rigaSorgente: rowIndex,
    rawData: { type, change, fee },
  };
}
