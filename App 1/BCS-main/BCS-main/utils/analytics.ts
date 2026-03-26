/**
 * Funzione stub per il tracciamento degli eventi (Analytics/Pixel).
 * In produzione, sostituire il console.log con le chiamate reali (es. window.gtag).
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    // Simulazione invio evento
    console.groupCollapsed(`[Analytics] Event: ${eventName}`);
    if (properties) {
      console.log('Properties:', properties);
    }
    console.groupEnd();

    // Esempio integrazione futura:
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', eventName, properties);
    // }
  } catch (error) {
    console.warn('[Analytics] Failed to track event:', error);
  }
};