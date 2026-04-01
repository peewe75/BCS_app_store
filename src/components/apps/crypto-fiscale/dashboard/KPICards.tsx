'use client';

import { TrendingUp, TrendingDown, FileText, AlertTriangle, CheckCircle, Euro } from 'lucide-react';

interface KPICardsProps {
  righeImportate: number;
  movimentiRilevanti: number;
  realizzi: number;
  proventi: number;
  trasferimentiDaVerificare: number;
  anomalie: number;
  plusMinusNetta: number;
  impostaTeorica: number;
}

export function KPICards({
  righeImportate,
  movimentiRilevanti,
  realizzi,
  proventi,
  trasferimentiDaVerificare,
  anomalie,
  plusMinusNetta,
  impostaTeorica,
}: KPICardsProps) {
  const cards = [
    {
      label: 'Righe Importate',
      value: righeImportate,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Movimenti Rilevanti',
      value: movimentiRilevanti,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Realizzi',
      value: realizzi,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Proventi',
      value: proventi,
      icon: Euro,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Trasferimenti da Verificare',
      value: trasferimentiDaVerificare,
      icon: AlertTriangle,
      color: trasferimentiDaVerificare > 0 ? 'text-orange-600' : 'text-gray-400',
      bg: trasferimentiDaVerificare > 0 ? 'bg-orange-50' : 'bg-gray-50',
    },
    {
      label: 'Anomalie',
      value: anomalie,
      icon: AlertTriangle,
      color: anomalie > 0 ? 'text-red-600' : 'text-gray-400',
      bg: anomalie > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.bg} rounded-xl p-4 border border-gray-100`}
            >
              <Icon className={`h-5 w-5 ${card.color}`} />
              <p className="text-2xl font-bold mt-2">{card.value}</p>
              <p className="text-xs text-gray-600 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`rounded-xl p-4 border ${
            plusMinusNetta >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {plusMinusNetta >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-700">Plus/Minusvalenza Netta</span>
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              plusMinusNetta >= 0 ? 'text-green-700' : 'text-red-700'
            }`}
          >
            EUR {plusMinusNetta.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Imposta Teorica</span>
          </div>
          <p className="text-2xl font-bold mt-2 text-amber-700">
            EUR {impostaTeorica.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
