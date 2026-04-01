import { RawTransaction } from '../types';

export interface ExchangeParser {
  detect(html: string): boolean;
  parse(html: string): RawTransaction[];
}
