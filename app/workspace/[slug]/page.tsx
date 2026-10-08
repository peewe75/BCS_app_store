import Link from 'next/link';
import AppShell from '@/src/components/shells/AppShell';
import {env} from '@/src/lib/env';
import {getSwaTools,toolHref,contactHref} from '@/src/lib/swa-marketplace';
import {notFound} from 'next/navigation';
import {headers} from 'next/headers';
import UgcWorkspace from '@/src/components/apps/UgcWorkspace';
import {getTrustedSwaUser} from '@/src/lib/auth/request-user';
export default async function WorkspacePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const swaUser=getTrustedSwaUser(await headers());
 if(swaUser&&slug==='ugc') return <main id="main-content"><UgcWorkspace/></main>;
 if(!env.clerkPublishableKey){
  const app=(await getSwaTools()).find(t=>t.id===slug);if(!app)notFound();
  return <main id="main-content" className="swa-section swa-access"><p className="swa-kicker">ANTEPRIMA LOCALE</p><h1>{app.copy.name}</h1><p>La pagina del servizio è pronta da esplorare. Accesso personale, crediti e generazione richiedono il collegamento dei servizi del marketplace.</p><div className="swa-actions"><Link className="swa-button" href={toolHref(slug)}>Torna alla pagina del tool</Link><a className="swa-text-link" href={contactHref('informazioni su '+app.copy.name)}>Parla con SWA</a></div></main>;
 }
 return <AppShell slug={slug}/>;
}
