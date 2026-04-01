import { AssetInfo } from '../types';

export const ASSET_REGISTRY: Record<string, AssetInfo> = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', isEMT: false, categoria: 'crypto' },
  ETH: { symbol: 'ETH', name: 'Ethereum', isEMT: false, categoria: 'crypto' },
  USDT: { symbol: 'USDT', name: 'Tether', isEMT: true, categoria: 'stablecoin' },
  USDC: { symbol: 'USDC', name: 'USD Coin', isEMT: true, categoria: 'stablecoin' },
  BUSD: { symbol: 'BUSD', name: 'Binance USD', isEMT: true, categoria: 'stablecoin' },
  BNB: { symbol: 'BNB', name: 'Binance Coin', isEMT: false, categoria: 'crypto' },
  SOL: { symbol: 'SOL', name: 'Solana', isEMT: false, categoria: 'crypto' },
  XRP: { symbol: 'XRP', name: 'Ripple', isEMT: false, categoria: 'crypto' },
  ADA: { symbol: 'ADA', name: 'Cardano', isEMT: false, categoria: 'crypto' },
  DOT: { symbol: 'DOT', name: 'Polkadot', isEMT: false, categoria: 'crypto' },
  EUR: { symbol: 'EUR', name: 'Euro', isEMT: true, categoria: 'fiat' },
  USD: { symbol: 'USD', name: 'US Dollar', isEMT: true, categoria: 'fiat' },
};

export function getAssetInfo(symbol: string): AssetInfo {
  const upper = symbol.toUpperCase();
  return ASSET_REGISTRY[upper] || {
    symbol: upper,
    name: upper,
    isEMT: false,
    categoria: 'token',
  };
}

export function isEMTAsset(symbol: string): boolean {
  return getAssetInfo(symbol).isEMT;
}
