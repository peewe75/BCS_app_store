import { RawTransaction, NormalizedTransaction, Realizzo, Provento, QuadroRWEntry, QuadroRTEntry } from '../types';
import { normalizeTransactions } from '../engine/normalizer';
import { allocateLIFO } from '../engine/lifo-allocator';
import { calculateGains, calculateIncome } from '../engine/gains-calculator';
import { generateQuadroRW, generateQuadroRT } from '../engine/tax-schedule';
import { runAudit } from '../engine/audit';
import { matchTransfers } from '../engine/transfer-matcher';
import { classifyIncome } from '../engine/income-classifier';

// ============================================================
// Test runner helpers
// ============================================================
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function assertCloseTo(actual: number, expected: number, tolerance: number, message: string): void {
  if (Math.abs(actual - expected) <= tolerance) {
    console.log(`  ✅ PASS: ${message} (expected ${expected}, got ${actual})`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message} (expected ${expected}, got ${actual}, tolerance ${tolerance})`);
    failed++;
  }
}

function section(title: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

// ============================================================
// Helper: create a RawTransaction
// ============================================================
function rawTx(
  id: string,
  exchange: string,
  timestampUTC: Date,
  causaleRaw: string,
  assetIn: string | null,
  qtyIn: number | null,
  assetOut: string | null,
  qtyOut: number | null,
  feeAsset: string | null,
  feeQty: number | null,
  valoreEUR: number | null,
  sourceFile: string = 'test.csv',
  rigaSorgente: number = 1,
): RawTransaction {
  return {
    id,
    exchange,
    timestampUTC,
    causaleRaw,
    assetIn,
    qtyIn,
    assetOut,
    qtyOut,
    feeAsset,
    feeQty,
    valoreEUR,
    orderID: null,
    txHash: null,
    sourceFile,
    rigaSorgente,
    rawData: {},
  };
}

// ============================================================
// TEST 1: Basic Buy/Sell
// ============================================================
section('TEST 1: Basic Buy/Sell');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-03-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
    rawTx('tx2', 'Binance', new Date('2025-06-15T14:00:00Z'), 'SELL', null, null, 'BTC', 0.5, null, null, 30000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  assert(normalized.length === 2, 'Should produce 2 normalized transactions');
  assert(normalized[0].direzione === 'entrata', 'Buy should be entrata');
  assert(normalized[1].direzione === 'uscita', 'Sell should be uscita');

  const { lots, realizzi } = allocateLIFO(normalized);
  assert(realizzi.length === 1, 'Should produce 1 realizzo');

  const realizzo = realizzi[0];
  assert(realizzo.asset === 'BTC', 'Realizzo asset should be BTC');
  assertCloseTo(realizzo.qtyVenduta, 0.5, 0.0001, 'Quantity sold should be 0.5');
  assertCloseTo(realizzo.corrispettivoNetto, 30000, 0.01, 'Corrispettivo should be €30,000');

  // LIFO: only one lot exists (1 BTC @ €20,000), so 0.5 BTC costs €10,000
  assertCloseTo(realizzo.costoFiscaleAllocato, 10000, 0.01, 'Costo fiscale should be €10,000');

  // Gain = 30,000 - 10,000 = 20,000
  assertCloseTo(realizzo.plusMinusValenza, 20000, 0.01, 'Plusvalenza should be €20,000');

  // Tax at 26% for 2025: 20,000 * 0.26 = 5,200
  assertCloseTo(realizzo.impostaTeorica, 5200, 0.01, 'Imposta should be €5,200 (26% of €20,000)');

  const gains = calculateGains(realizzi);
  assertCloseTo(gains.plusvalenzeTotali, 20000, 0.01, 'Total plusvalenze should be €20,000');
  assertCloseTo(gains.plusMinusNetta, 20000, 0.01, 'Net plus/minus should be €20,000');
  assertCloseTo(gains.impostaTeoricaTotale, 5200, 0.01, 'Total imposta should be €5,200');
}

// ============================================================
// TEST 2: Multiple LIFO lots
// ============================================================
section('TEST 2: Multiple LIFO lots');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-10T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 15000),
    rawTx('tx2', 'Kraken', new Date('2025-04-20T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 25000),
    rawTx('tx3', 'Binance', new Date('2025-07-05T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 35000),
    rawTx('tx4', 'Binance', new Date('2025-09-15T14:00:00Z'), 'SELL', null, null, 'BTC', 1.5, null, null, 60000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const { lots, realizzi } = allocateLIFO(normalized);

  assert(realizzi.length === 1, 'Should produce 1 realizzo');
  const realizzo = realizzi[0];

  // LIFO: consume most recent first
  // Lot 3 (€35,000): 1.0 BTC consumed → €35,000
  // Lot 2 (€25,000): 0.5 BTC consumed → €12,500
  // Total cost: €47,500
  assertCloseTo(realizzo.costoFiscaleAllocato, 47500, 0.01, 'LIFO cost should be €47,500 (1×35k + 0.5×25k)');

  // Gain = 60,000 - 47,500 = 12,500
  assertCloseTo(realizzo.plusMinusValenza, 12500, 0.01, 'Plusvalenza should be €12,500');

  // Tax: 12,500 * 0.26 = 3,250
  assertCloseTo(realizzo.impostaTeorica, 3250, 0.01, 'Imposta should be €3,250');

  assert(realizzo.allocazioni.length === 2, 'Should have 2 LIFO allocations');
  assertCloseTo(realizzo.allocazioni[0].qtyAllocata, 1.0, 0.0001, 'First allocation should be 1.0 BTC (most recent lot)');
  assertCloseTo(realizzo.allocazioni[1].qtyAllocata, 0.5, 0.0001, 'Second allocation should be 0.5 BTC');

  // Verify remaining lots
  const remainingLots = lots.filter(l => l.qtyRemaining > 0);
  assert(remainingLots.length === 2, 'Should have 2 remaining lots');
}

// ============================================================
// TEST 3: Multiple assets (BTC and ETH)
// ============================================================
section('TEST 3: Multiple assets (BTC and ETH)');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-02-01T10:00:00Z'), 'BUY', 'BTC', 2.0, null, null, null, null, 40000),
    rawTx('tx2', 'Binance', new Date('2025-02-15T10:00:00Z'), 'BUY', 'ETH', 10.0, null, null, null, null, 20000),
    rawTx('tx3', 'Kraken', new Date('2025-05-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 30000),
    rawTx('tx4', 'Binance', new Date('2025-08-01T14:00:00Z'), 'SELL', null, null, 'BTC', 1.5, null, null, 50000),
    rawTx('tx5', 'Kraken', new Date('2025-09-01T14:00:00Z'), 'SELL', null, null, 'ETH', 5.0, null, null, 15000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const { lots, realizzi } = allocateLIFO(normalized);

  assert(realizzi.length === 2, 'Should produce 2 realizzi (BTC + ETH)');

  const btcRealizzo = realizzi.find(r => r.asset === 'BTC')!;
  const ethRealizzo = realizzi.find(r => r.asset === 'ETH')!;

  assert(btcRealizzo, 'Should have BTC realizzo');
  assert(ethRealizzo, 'Should have ETH realizzo');

  // BTC LIFO: most recent lot (tx3: 1 BTC @ €30,000) + older (tx1: 0.5 BTC @ €20,000)
  // Cost = 30,000 + 10,000 = 40,000
  assertCloseTo(btcRealizzo.costoFiscaleAllocato, 40000, 0.01, 'BTC LIFO cost should be €40,000');
  assertCloseTo(btcRealizzo.plusMinusValenza, 10000, 0.01, 'BTC plusvalenza should be €10,000');

  // ETH: only one lot (10 ETH @ €20,000 → €2,000/ETH)
  // 5 ETH sold, cost = 5 × 2,000 = 10,000
  assertCloseTo(ethRealizzo.costoFiscaleAllocato, 10000, 0.01, 'ETH cost should be €10,000');
  assertCloseTo(ethRealizzo.plusMinusValenza, 5000, 0.01, 'ETH plusvalenza should be €5,000');

  const gains = calculateGains(realizzi);
  assertCloseTo(gains.plusvalenzeTotali, 15000, 0.01, 'Total plusvalenze should be €15,000');
  assertCloseTo(gains.impostaTeoricaTotale, 3900, 0.01, 'Total imposta should be €3,900 (15,000 × 26%)');
}

// ============================================================
// TEST 4: Transfer matching
// ============================================================
section('TEST 4: Transfer matching');

{
  const baseTime = new Date('2025-06-01T12:00:00Z');
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
    rawTx('tx2', 'Binance', baseTime, 'TRANSFER_OUT', null, null, 'BTC', 0.5, null, null, null),
    rawTx('tx3', 'Bybit', new Date('2025-06-01T12:30:00Z'), 'TRANSFER_IN', 'BTC', 0.5, null, null, null, null, null),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  assert(normalized[1].direzione === 'trasferimento', 'TRANSFER_OUT should be direzione trasferimento');
  assert(normalized[2].direzione === 'trasferimento', 'TRANSFER_IN should be direzione trasferimento');

  const { matched, unmatched } = matchTransfers(normalized);

  const matchedOut = matched.find(t => t.id === 'tx2');
  const matchedIn = matched.find(t => t.id === 'tx3');

  assert(matchedOut?.isTransferMatched === true, 'TRANSFER_OUT should be matched');
  assert(matchedIn?.isTransferMatched === true, 'TRANSFER_IN should be matched');
  assert(unmatched.length === 0, 'Should have no unmatched transfers');

  // Verify transfers don't create lots or realizzi
  const { lots, realizzi } = allocateLIFO(matched);
  assert(lots.length === 1, 'Should only have 1 lot (the BUY)');
  assert(realizzi.length === 0, 'Transfers should not generate realizzi');
}

// ============================================================
// TEST 4b: Unmatched transfer
// ============================================================
section('TEST 4b: Unmatched transfer');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
    rawTx('tx2', 'Binance', new Date('2025-06-01T12:00:00Z'), 'TRANSFER_OUT', null, null, 'BTC', 0.5, null, null, null),
    // No matching TRANSFER_IN
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const { matched, unmatched } = matchTransfers(normalized);

  assert(unmatched.length === 1, 'Should have 1 unmatched transfer');
  assert(unmatched[0].asset === 'BTC', 'Unmatched transfer asset should be BTC');
  assertCloseTo(unmatched[0].qty, 0.5, 0.0001, 'Unmatched transfer qty should be 0.5');
  assert(unmatched[0].exchangeDa === 'Binance', 'Unmatched transfer should be from Binance');
}

// ============================================================
// TEST 5: Fee handling
// ============================================================
section('TEST 5: Fee handling');

{
  // BUY with fee capitalization: fee is added to cost basis
  const buyTx: RawTransaction = {
    id: 'tx1',
    exchange: 'Binance',
    timestampUTC: new Date('2025-03-01T10:00:00Z'),
    causaleRaw: 'BUY',
    assetIn: 'BTC',
    qtyIn: 1.0,
    assetOut: null,
    qtyOut: null,
    feeAsset: 'EUR',
    feeQty: 50,
    valoreEUR: 20000,
    orderID: null,
    txHash: null,
    sourceFile: 'test.csv',
    rigaSorgente: 1,
    rawData: {},
  };

  const sellTx: RawTransaction = {
    id: 'tx2',
    exchange: 'Binance',
    timestampUTC: new Date('2025-06-15T14:00:00Z'),
    causaleRaw: 'SELL',
    assetIn: null,
    qtyIn: null,
    assetOut: 'BTC',
    qtyOut: 1.0,
    feeAsset: 'EUR',
    feeQty: 30,
    valoreEUR: 30000,
    orderID: null,
    txHash: null,
    sourceFile: 'test.csv',
    rigaSorgente: 2,
    rawData: {},
  };

  const normalized = normalizeTransactions([buyTx, sellTx], 2025);

  // BUY: feeCapitalizzata should be 0 (calcolaFeeEUR returns 0 currently)
  // But the mapping says 'capitalizza' for BUY
  const buyNorm = normalized[0];
  assert(buyNorm.mapping?.trattamentoFee === 'capitalizza', 'BUY should have capitalizza fee treatment');

  const { realizzi } = allocateLIFO(normalized);
  assert(realizzi.length === 1, 'Should produce 1 realizzo');

  const realizzo = realizzi[0];
  // Cost basis: €20,000 / 1 BTC = €20,000 per BTC
  assertCloseTo(realizzo.costoFiscaleAllocato, 20000, 0.01, 'Cost basis should be €20,000');
  assertCloseTo(realizzo.corrispettivoNetto, 30000, 0.01, 'Corrispettivo should be €30,000');
  assertCloseTo(realizzo.plusMinusValenza, 10000, 0.01, 'Gain should be €10,000');
}

// ============================================================
// TEST 6: Quadro RW generation
// ============================================================
section('TEST 6: Quadro RW generation');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-15T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
    rawTx('tx2', 'Kraken', new Date('2025-03-20T10:00:00Z'), 'BUY', 'ETH', 5.0, null, null, null, null, 10000),
    rawTx('tx3', 'Binance', new Date('2025-07-10T14:00:00Z'), 'SELL', null, null, 'BTC', 0.3, null, null, 12000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const { lots } = allocateLIFO(normalized);
  const rwEntries = generateQuadroRW(normalized, lots);

  assert(rwEntries.length === 2, 'Should have 2 RW entries (BTC + ETH)');

  const btcRW = rwEntries.find(e => e.asset === 'BTC')!;
  const ethRW = rwEntries.find(e => e.asset === 'ETH')!;

  assert(btcRW, 'Should have BTC RW entry');
  assert(ethRW, 'Should have ETH RW entry');

  // BTC: bought 1.0, sold 0.3 → final 0.7
  assertCloseTo(btcRW.quantitaFinale, 0.7, 0.0001, 'BTC final quantity should be 0.7');
  assertCloseTo(btcRW.quantitaIniziale, 0, 0.0001, 'BTC initial quantity should be 0');

  // ETH: bought 5.0, no sales → final 5.0
  assertCloseTo(ethRW.quantitaFinale, 5.0, 0.0001, 'ETH final quantity should be 5.0');
  assertCloseTo(ethRW.quantitaIniziale, 0, 0.0001, 'ETH initial quantity should be 0');

  assert(btcRW.giorniPossesso === 365, 'Days of possession should be 365');
}

// ============================================================
// TEST 7: Quadro RT generation
// ============================================================
section('TEST 7: Quadro RT generation');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-10T10:00:00Z'), 'BUY', 'BTC', 2.0, null, null, null, null, 40000),
    rawTx('tx2', 'Binance', new Date('2025-02-15T10:00:00Z'), 'BUY', 'ETH', 10.0, null, null, null, null, 20000),
    rawTx('tx3', 'Binance', new Date('2025-08-01T14:00:00Z'), 'SELL', null, null, 'BTC', 1.0, null, null, 35000),
    rawTx('tx4', 'Kraken', new Date('2025-09-15T14:00:00Z'), 'SELL', null, null, 'ETH', 5.0, null, null, 12000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const { realizzi } = allocateLIFO(normalized);
  const rtEntries = generateQuadroRT(realizzi);

  assert(rtEntries.length === 2, 'Should have 2 RT entries (BTC + ETH)');

  const btcRT = rtEntries.find(e => e.asset === 'BTC')!;
  const ethRT = rtEntries.find(e => e.asset === 'ETH')!;

  assert(btcRT, 'Should have BTC RT entry');
  assert(ethRT, 'Should have ETH RT entry');

  // BTC: sold 1 BTC @ €35,000, LIFO cost = €20,000 (from the single lot @ €20,000/BTC)
  assertCloseTo(btcRT.corrispettivoTotale, 35000, 0.01, 'BTC corrispettivo should be €35,000');
  assertCloseTo(btcRT.costoTotale, 20000, 0.01, 'BTC cost should be €20,000');
  assertCloseTo(btcRT.plusMinusValenza, 15000, 0.01, 'BTC plusvalenza should be €15,000');
  assertCloseTo(btcRT.imposta, 3900, 0.01, 'BTC imposta should be €3,900 (15,000 × 26%)');

  // ETH: sold 5 ETH @ €12,000, LIFO cost = 5 × €2,000 = €10,000
  assertCloseTo(ethRT.corrispettivoTotale, 12000, 0.01, 'ETH corrispettivo should be €12,000');
  assertCloseTo(ethRT.costoTotale, 10000, 0.01, 'ETH cost should be €10,000');
  assertCloseTo(ethRT.plusMinusValenza, 2000, 0.01, 'ETH plusvalenza should be €2,000');
  assertCloseTo(ethRT.imposta, 520, 0.01, 'ETH imposta should be €520 (2,000 × 26%)');
}

// ============================================================
// TEST 8: Audit alerts
// ============================================================
section('TEST 8: Audit alerts');

{
  // Test 8a: Missing EUR value
  {
    const transactions = [
      rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
      rawTx('tx2', 'Binance', new Date('2025-06-01T10:00:00Z'), 'SELL', null, null, 'BTC', 0.5, null, null, null),
    ];

    const normalized = normalizeTransactions(transactions, 2025);
    const { realizzi } = allocateLIFO(normalized);
    const alerts = runAudit(normalized, realizzi, []);

    const missingValueAlert = alerts.find(a => a.codice === 'MISSING_EUR_VALUE');
    assert(missingValueAlert !== undefined, 'Should detect missing EUR value on SELL');
    assert(missingValueAlert?.transazioneId === 'tx2', 'Alert should reference tx2');
  }

  // Test 8b: Unmatched transfers
  {
    const transactions = [
      rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
      rawTx('tx2', 'Binance', new Date('2025-06-01T12:00:00Z'), 'TRANSFER_OUT', null, null, 'BTC', 0.5, null, null, null),
    ];

    const normalized = normalizeTransactions(transactions, 2025);
    const { unmatched } = matchTransfers(normalized);
    const { realizzi } = allocateLIFO(normalized);
    const alerts = runAudit(normalized, realizzi, unmatched);

    const unmatchedAlert = alerts.find(a => a.codice === 'UNMATCHED_TRANSFER');
    assert(unmatchedAlert !== undefined, 'Should detect unmatched transfer');
  }

  // Test 8c: Unmapped causale
  {
    const unknownTx: RawTransaction = {
      id: 'tx_unknown',
      exchange: 'Binance',
      timestampUTC: new Date('2025-03-01T10:00:00Z'),
      causaleRaw: 'UNKNOWN_OPERATION',
      assetIn: 'BTC',
      qtyIn: 1.0,
      assetOut: null,
      qtyOut: null,
      feeAsset: null,
      feeQty: null,
      valoreEUR: 20000,
      orderID: null,
      txHash: null,
      sourceFile: 'test.csv',
      rigaSorgente: 1,
      rawData: {},
    };

    const normalized = normalizeTransactions([unknownTx], 2025);
    const { realizzi } = allocateLIFO(normalized);
    const alerts = runAudit(normalized, realizzi, []);

    const unmappedAlert = alerts.find(a => a.codice === 'UNMAPPED_CAUSALE');
    assert(unmappedAlert !== undefined, 'Should detect unmapped causale');
    assert(unmappedAlert?.tipo === 'error', 'Unmapped causale should be error type');
  }

  // Test 8d: Incomplete allocation (sell more than owned)
  {
    const transactions = [
      rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 0.5, null, null, null, null, 10000),
      rawTx('tx2', 'Binance', new Date('2025-06-01T14:00:00Z'), 'SELL', null, null, 'BTC', 1.0, null, null, 40000),
    ];

    const normalized = normalizeTransactions(transactions, 2025);
    const { realizzi } = allocateLIFO(normalized);
    const alerts = runAudit(normalized, realizzi, []);

    const incompleteAlert = alerts.find(a => a.codice === 'INCOMPLETE_ALLOCATION');
    assert(incompleteAlert !== undefined, 'Should detect incomplete allocation when selling more than owned');
  }
}

// ============================================================
// TEST 9: Income classification
// ============================================================
section('TEST 9: Income classification');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-03-01T10:00:00Z'), 'STAKING_REWARD', 'ETH', 0.5, null, null, null, null, 1000),
    rawTx('tx2', 'Binance', new Date('2025-04-15T10:00:00Z'), 'AIRDROP', 'TOKEN', 100.0, null, null, null, null, 500),
    rawTx('tx3', 'Kraken', new Date('2025-05-01T10:00:00Z'), 'INTEREST', 'USDC', 50.0, null, null, null, null, 50),
    rawTx('tx4', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 20000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const proventi = classifyIncome(normalized);

  assert(proventi.length === 3, 'Should classify 3 proventi (staking, airdrop, interest)');

  const staking = proventi.find(p => p.tipo === 'provento_staking');
  const airdrop = proventi.find(p => p.tipo === 'provento_airdrop');
  const interest = proventi.find(p => p.tipo === 'provento_interessi');

  assert(staking !== undefined, 'Should have staking provento');
  assert(airdrop !== undefined, 'Should have airdrop provento');
  assert(interest !== undefined, 'Should have interest provento');

  assertCloseTo(staking?.valoreEUR || 0, 1000, 0.01, 'Staking value should be €1,000');
  assertCloseTo(airdrop?.valoreEUR || 0, 500, 0.01, 'Airdrop value should be €500');
  assertCloseTo(interest?.valoreEUR || 0, 50, 0.01, 'Interest value should be €50');

  const incomeSummary = calculateIncome(proventi);
  assertCloseTo(incomeSummary.proventiTotali, 1550, 0.01, 'Total proventi should be €1,550');
  assert(Object.keys(incomeSummary.breakdownPerTipo).length === 3, 'Should have 3 breakdown categories');
}

// ============================================================
// TEST 10: Full pipeline integration
// ============================================================
section('TEST 10: Full pipeline integration');

{
  const transactions = [
    // Buys
    rawTx('tx1', 'Binance', new Date('2025-01-10T10:00:00Z'), 'BUY', 'BTC', 2.0, null, null, null, null, 40000),
    rawTx('tx2', 'Kraken', new Date('2025-03-15T10:00:00Z'), 'BUY', 'ETH', 10.0, null, null, null, null, 20000),
    rawTx('tx3', 'Binance', new Date('2025-05-20T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 30000),

    // Income
    rawTx('tx4', 'Binance', new Date('2025-04-01T10:00:00Z'), 'STAKING_REWARD', 'ETH', 0.2, null, null, null, null, 400),

    // Transfer
    rawTx('tx5', 'Binance', new Date('2025-06-01T12:00:00Z'), 'TRANSFER_OUT', null, null, 'BTC', 0.5, null, null, null),
    rawTx('tx6', 'Bybit', new Date('2025-06-01T12:30:00Z'), 'TRANSFER_IN', 'BTC', 0.5, null, null, null, null, null),

    // Sells
    rawTx('tx7', 'Binance', new Date('2025-08-15T14:00:00Z'), 'SELL', null, null, 'BTC', 1.0, null, null, 35000),
    rawTx('tx8', 'Kraken', new Date('2025-09-01T14:00:00Z'), 'SELL', null, null, 'ETH', 5.0, null, null, 12000),
  ];

  // Step 1: Normalize
  const normalized = normalizeTransactions(transactions, 2025);
  assert(normalized.length === 8, 'Should normalize all 8 transactions');

  // Step 2: Match transfers
  const { matched, unmatched } = matchTransfers(normalized);
  assert(unmatched.length === 0, 'All transfers should be matched');

  // Step 3: LIFO allocation
  const { lots, realizzi } = allocateLIFO(matched);
  assert(realizzi.length === 2, 'Should have 2 realizzi');

  // Step 4: Calculate gains
  const gains = calculateGains(realizzi);
  assert(gains.plusvalenzeTotali > 0, 'Should have positive plusvalenze');

  // Step 5: Classify income
  const proventi = classifyIncome(matched);
  assert(proventi.length === 1, 'Should have 1 provento (staking)');

  // Step 6: Calculate income
  const income = calculateIncome(proventi);
  assertCloseTo(income.proventiTotali, 400, 0.01, 'Total income should be €400');

  // Step 7: Generate tax schedules
  const rwEntries = generateQuadroRW(matched, lots);
  const rtEntries = generateQuadroRT(realizzi);

  assert(rwEntries.length === 2, 'Should have 2 RW entries (BTC + ETH)');
  assert(rtEntries.length === 2, 'Should have 2 RT entries (BTC + ETH)');

  // Step 8: Run audit
  const alerts = runAudit(matched, realizzi, unmatched);
  assert(alerts.length === 0, 'Should have no audit alerts for clean data');

  // Summary
  console.log('\n  📊 Pipeline Summary:');
  console.log(`     Plusvalenze: €${gains.plusvalenzeTotali.toFixed(2)}`);
  console.log(`     Minusvalenze: €${gains.minusvalenzeTotali.toFixed(2)}`);
  console.log(`     Plus/Minus Netta: €${gains.plusMinusNetta.toFixed(2)}`);
  console.log(`     Imposta Teorica: €${gains.impostaTeoricaTotale.toFixed(2)}`);
  console.log(`     Proventi: €${income.proventiTotali.toFixed(2)}`);
  console.log(`     RW Entries: ${rwEntries.length}`);
  console.log(`     RT Entries: ${rtEntries.length}`);
  console.log(`     Audit Alerts: ${alerts.length}`);
}

// ============================================================
// TEST 11: EMT asset (stablecoin) tax rate
// ============================================================
section('TEST 11: EMT asset (stablecoin) tax rate');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'USDT', 10000, null, null, null, null, 10000),
    rawTx('tx2', 'Binance', new Date('2025-06-01T14:00:00Z'), 'SELL', null, null, 'USDT', 5000, null, null, 5200),
  ];

  const normalized = normalizeTransactions(transactions, 2025);

  // USDT is EMT → 26% rate
  assert(normalized[0].isEMT === true, 'USDT should be EMT');
  assertCloseTo(normalized[0].aliquotaApplicabile, 0.26, 0.001, 'USDT aliquota should be 26%');

  const { realizzi } = allocateLIFO(normalized);
  assert(realizzi.length === 1, 'Should produce 1 realizzo');

  const realizzo = realizzi[0];
  assertCloseTo(realizzo.aliquota, 0.26, 0.001, 'Realizzo aliquota should be 26%');

  // Cost: 5000 USDT × (10000/10000) = 5000
  // Gain: 5200 - 5000 = 200
  assertCloseTo(realizzo.plusMinusValenza, 200, 0.01, 'USDT plusvalenza should be €200');
  assertCloseTo(realizzo.impostaTeorica, 52, 0.01, 'USDT imposta should be €52 (200 × 26%)');
}

// ============================================================
// TEST 12: 2026 tax rate (33%)
// ============================================================
section('TEST 12: 2026 tax rate (33%)');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2026-01-15T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 30000),
    rawTx('tx2', 'Binance', new Date('2026-06-15T14:00:00Z'), 'SELL', null, null, 'BTC', 0.5, null, null, 25000),
  ];

  const normalized = normalizeTransactions(transactions, 2026);

  // 2026 non-EMT → 33% rate
  assertCloseTo(normalized[0].aliquotaApplicabile, 0.33, 0.001, '2026 BTC aliquota should be 33%');

  const { realizzi } = allocateLIFO(normalized);
  assert(realizzi.length === 1, 'Should produce 1 realizzo');

  const realizzo = realizzi[0];
  assertCloseTo(realizzo.aliquota, 0.33, 0.001, 'Realizzo aliquota should be 33%');

  // Cost: 0.5 × 30,000 = 15,000
  // Gain: 25,000 - 15,000 = 10,000
  assertCloseTo(realizzo.plusMinusValenza, 10000, 0.01, 'Plusvalenza should be €10,000');
  assertCloseTo(realizzo.impostaTeorica, 3300, 0.01, 'Imposta should be €3,300 (10,000 × 33%)');
}

// ============================================================
// TEST 13: Minusvalenza (loss)
// ============================================================
section('TEST 13: Minusvalenza (loss)');

{
  const transactions = [
    rawTx('tx1', 'Binance', new Date('2025-01-01T10:00:00Z'), 'BUY', 'BTC', 1.0, null, null, null, null, 30000),
    rawTx('tx2', 'Binance', new Date('2025-06-01T14:00:00Z'), 'SELL', null, null, 'BTC', 1.0, null, null, 20000),
  ];

  const normalized = normalizeTransactions(transactions, 2025);
  const { realizzi } = allocateLIFO(normalized);

  assert(realizzi.length === 1, 'Should produce 1 realizzo');
  const realizzo = realizzi[0];

  // Cost: 30,000, Proceeds: 20,000 → Loss: -10,000
  assertCloseTo(realizzo.plusMinusValenza, -10000, 0.01, 'Minusvalenza should be -€10,000');
  assertCloseTo(realizzo.impostaTeorica, 0, 0.01, 'Imposta on loss should be €0');

  const gains = calculateGains(realizzi);
  assertCloseTo(gains.minusvalenzeTotali, 10000, 0.01, 'Total minusvalenze should be €10,000');
  assertCloseTo(gains.plusMinusNetta, -10000, 0.01, 'Net plus/minus should be -€10,000');
  assertCloseTo(gains.impostaTeoricaTotale, 0, 0.01, 'Total imposta should be €0');
}

// ============================================================
// Summary
// ============================================================
console.log(`\n${'='.repeat(60)}`);
console.log(`  TEST RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log(`\n⚠️  ${failed} test(s) failed. Review the output above.`);
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
