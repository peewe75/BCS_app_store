import type {Metadata} from 'next';
import {ClerkProvider} from '@clerk/nextjs';
import {env} from '@/src/lib/env';
import {SiteHeader} from '@/src/components/site/SiteHeader';
import {SiteFooter} from '@/src/components/site/SiteFooter';
import './globals.css';
import './swa.css';
export const metadata:Metadata={
 metadataBase:new URL('https://www.socialautomation.app'),
 title:{default:'Marketplace SWA — Strumenti per la tua attività',template:'%s | SWA'},
 description:'Esplora gli strumenti SWA per contenuti, fisco, professioni e automazioni. Odino ti presenta le applicazioni, un argomento alla volta.',
 robots:{index:false,follow:false},
 openGraph:{siteName:'SWA — Social Web Automation',locale:'it_IT',type:'website'},
};
export default function RootLayout({children}:{children:React.ReactNode}){
 const content=<><SiteHeader/>{children}<SiteFooter/></>;
 return <html lang="it" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`(()=>{try{const saved=localStorage.getItem('swa-theme');const theme=saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme='light'}})()`}}/></head><body>{env.clerkPublishableKey?<ClerkProvider publishableKey={env.clerkPublishableKey}>{content}</ClerkProvider>:content}</body></html>;
}
