import { NormalizedTransaction, TransferMatch } from '../types';

const TOLERANZA_SECONDI = 3600;
const TOLERANZA_QTY = 0.00000001;

export function matchTransfers(
  transactions: NormalizedTransaction[],
): { matched: NormalizedTransaction[]; unmatched: TransferMatch[] } {
  const transfers = transactions.filter(
    (t) => t.direzione === 'trasferimento' && t.transferKey,
  );

  const transferOuts = transfers.filter(
    (t) => t.causaleRaw.includes('TRANSFER_OUT') || t.causaleRaw.includes('WITHDRAWAL'),
  );
  const transferIns = transfers.filter(
    (t) => t.causaleRaw.includes('TRANSFER_IN') || t.causaleRaw.includes('DEPOSIT'),
  );

  const matched = [...transactions];
  const unmatched: TransferMatch[] = [];

  for (const out of transferOuts) {
    let foundMatch = false;
    for (const inp of transferIns) {
      if (
        out.transferKey === inp.transferKey &&
        out.exchange !== inp.exchange &&
        timestampsWithinTolerance(out.timestampUTC, inp.timestampUTC)
      ) {
        const outIdx = matched.findIndex((t) => t.id === out.id);
        const inIdx = matched.findIndex((t) => t.id === inp.id);
        if (outIdx !== -1) {
          matched[outIdx] = { ...matched[outIdx], isTransferMatched: true };
        }
        if (inIdx !== -1) {
          matched[inIdx] = { ...matched[inIdx], isTransferMatched: true };
        }
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      unmatched.push({
        asset: out.asset,
        qty: out.qty,
        timestampDa: out.timestampUTC,
        timestampA: null,
        exchangeDa: out.exchange,
        exchangeA: '',
        matched: false,
        transazioneDaId: out.id,
        transazioneAId: '',
      });
    }
  }

  return { matched, unmatched };
}

function timestampsWithinTolerance(
  ts1: Date | null,
  ts2: Date | null,
): boolean {
  if (!ts1 || !ts2) return false;
  const diff = Math.abs(ts1.getTime() - ts2.getTime()) / 1000;
  return diff <= TOLERANZA_SECONDI;
}
