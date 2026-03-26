// Stub per Stripe Payments
// Da configurare dopo con le chiavi Stripe

export type SubscriptionPlan = 'free' | 'pro' | 'studio'

export interface PlanLimits {
  maxCalcoli: number
  pdfDownload: boolean
  emailInvio: boolean
  storico: boolean
  utenti: number
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxCalcoli: 5,
    pdfDownload: false,
    emailInvio: false,
    storico: false,
    utenti: 1,
  },
  pro: {
    maxCalcoli: -1, // illimitati
    pdfDownload: true,
    emailInvio: true,
    storico: true,
    utenti: 1,
  },
  studio: {
    maxCalcoli: -1,
    pdfDownload: true,
    emailInvio: true,
    storico: true,
    utenti: 5,
  },
}

export async function createCheckoutSession(priceId: string, userId: string) {
  console.log('[STRIPE STUB] createCheckoutSession:', { priceId, userId })
  return { url: '/checkout-stub' }
}

export async function createPortalSession(userId: string) {
  console.log('[STRIPE STUB] createPortalSession:', { userId })
  return { url: '/portal-stub' }
}

export async function getSubscription(userId: string) {
  console.log('[STRIPE STUB] getSubscription:', { userId })
  return {
    plan: 'free' as SubscriptionPlan,
    status: 'active',
    currentPeriodEnd: new Date(),
  }
}

export async function checkLimit(userId: string, limitType: keyof PlanLimits) {
  const subscription = await getSubscription(userId)
  const limits = PLAN_LIMITS[subscription.plan]
  console.log('[STRIPE STUB] checkLimit:', { userId, limitType, limit: limits[limitType] })
  return true
}
