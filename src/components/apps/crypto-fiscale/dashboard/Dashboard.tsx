'use client';

import { KPICards } from './KPICards';
import { AuditAlerts } from './AuditAlerts';
import { AuditAlert } from '@/src/apps/crypto-fiscale/types';

interface DashboardProps {
  righeImportate: number;
  movimentiRilevanti: number;
  realizzi: number;
  proventi: number;
  trasferimentiDaVerificare: number;
  anomalie: number;
  plusMinusNetta: number;
  impostaTeorica: number;
  auditAlerts?: AuditAlert[];
}

export function Dashboard({
  righeImportate,
  movimentiRilevanti,
  realizzi,
  proventi,
  trasferimentiDaVerificare,
  anomalie,
  plusMinusNetta,
  impostaTeorica,
  auditAlerts,
}: DashboardProps) {
  return (
    <div className="space-y-6">
      <KPICards
        righeImportate={righeImportate}
        movimentiRilevanti={movimentiRilevanti}
        realizzi={realizzi}
        proventi={proventi}
        trasferimentiDaVerificare={trasferimentiDaVerificare}
        anomalie={anomalie}
        plusMinusNetta={plusMinusNetta}
        impostaTeorica={impostaTeorica}
      />
      {auditAlerts && auditAlerts.length > 0 && (
        <AuditAlerts alerts={auditAlerts} />
      )}
    </div>
  );
}
