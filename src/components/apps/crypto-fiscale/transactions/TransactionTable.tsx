'use client';

import { useState } from 'react';
import { NormalizedTransaction } from '@/src/apps/crypto-fiscale/types';

interface TransactionTableProps {
  transactions: NormalizedTransaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'timestampUTC' | 'asset' | 'direzione'>('timestampUTC');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = transactions
    .filter((t) => {
      if (filter !== 'all' && t.mapping?.categoriaNormalizzata !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          t.asset.toLowerCase().includes(s) ||
          t.causaleRaw.toLowerCase().includes(s) ||
          t.exchange.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'timestampUTC') {
        cmp = (a.timestampUTC?.getTime() || 0) - (b.timestampUTC?.getTime() || 0);
      } else if (sortField === 'asset') {
        cmp = a.asset.localeCompare(b.asset);
      } else {
        cmp = a.direzione.localeCompare(b.direzione);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const categorie = [
    ...new Set(transactions.map((t) => t.mapping?.categoriaNormalizzata).filter(Boolean)),
  ];

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <h3 className="font-semibold text-gray-900">Transazioni</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cerca asset, causale, exchange..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Tutte le categorie</option>
            {categorie.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('timestampUTC')}
              >
                Data {sortField === 'timestampUTC' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left">Exchange</th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('asset')}
              >
                Asset {sortField === 'asset' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left">Quantita</th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('direzione')}
              >
                Direzione {sortField === 'direzione' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left">Valore EUR</th>
              <th className="px-4 py-2 text-left">Aliquota</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.slice(0, 100).map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {tx.timestampUTC?.toLocaleDateString('it-IT') || '-'}
                </td>
                <td className="px-4 py-2">{tx.exchange}</td>
                <td className="px-4 py-2 font-medium">{tx.asset}</td>
                <td className="px-4 py-2">{tx.qty}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tx.direzione === 'entrata'
                        ? 'bg-green-100 text-green-700'
                        : tx.direzione === 'uscita'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tx.direzione}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {tx.valoreEUR
                    ? `EUR ${tx.valoreEUR.toFixed(2)}`
                    : '-'}
                </td>
                <td className="px-4 py-2">
                  {(tx.aliquotaApplicabile * 100).toFixed(0)}%
                  {tx.isEMT && <span className="ml-1 text-xs text-amber-600">(EMT)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <p className="text-xs text-gray-500 p-4 text-center">
            Mostrando 100 di {filtered.length} transazioni
          </p>
        )}
      </div>
    </div>
  );
}
