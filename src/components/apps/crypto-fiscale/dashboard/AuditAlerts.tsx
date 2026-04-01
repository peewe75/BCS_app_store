'use client';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';
import { AuditAlert } from '@/src/apps/crypto-fiscale/types';

interface AuditAlertsProps {
  alerts: AuditAlert[];
}

export function AuditAlerts({ alerts }: AuditAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.codice + a.messaggio));

  if (visibleAlerts.length === 0) return null;

  const dismiss = (alert: AuditAlert) => {
    setDismissed((prev) => new Set(prev).add(alert.codice + alert.messaggio));
  };

  const iconMap = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">
        Alert Audit ({visibleAlerts.length})
      </h3>
      <div className="space-y-2">
        {visibleAlerts.map((alert, idx) => {
          const Icon = iconMap[alert.tipo];
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border ${colorMap[alert.tipo]}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{alert.messaggio}</p>
                {alert.transazioneId && (
                  <p className="text-xs opacity-75 mt-1">
                    ID: {alert.transazioneId}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(alert)}
                className="p-1 hover:bg-black/5 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
