import type { SupabaseClient } from '@supabase/supabase-js';

export class CreditError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export async function reserveCredits(client: SupabaseClient, userId: string, appId: string, amount: number) {
  const id = crypto.randomUUID();
  const { data, error } = await client.rpc('reserve_app_credits', {
    p_id: id, p_user_id: userId, p_app_id: appId, p_amount: amount,
  });
  if (error) {
    if (error.code === 'P0002') throw new CreditError(`Crediti insufficienti. Servono ${amount} crediti.`, 402);
    console.error('[credits/reserve]', error);
    throw new CreditError('Servizio crediti temporaneamente non disponibile.', 503);
  }
  return { id, credits: data as number };
}

export async function refundCredits(client: SupabaseClient, id: string) {
  const { error } = await client.rpc('refund_app_credits', { p_id: id });
  if (error) {
    console.error('[credits/refund]', { reservationId: id, error });
    throw new CreditError('Rimborso crediti in sospeso. Contatta l’assistenza.', 503);
  }
}
