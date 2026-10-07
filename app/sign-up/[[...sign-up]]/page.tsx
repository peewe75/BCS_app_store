import SignUpShell from '@/src/components/shells/SignUpShell';
import {env} from '@/src/lib/env';
import Link from 'next/link';

export default function SignUpPage() {
  if (!env.clerkPublishableKey) return <main id="main-content" className="swa-section swa-access"><h1>Il tuo spazio SWA.</h1><p>Registrazione non disponibile nell’anteprima locale. Puoi esplorare tutti gli strumenti del marketplace.</p><Link className="swa-button" href="/marketplace">Esplora il marketplace</Link></main>;
  return <SignUpShell />;
}
