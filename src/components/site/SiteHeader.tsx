'use client';
import Link from 'next/link';import {useState} from 'react';import {Menu,X,ArrowUpRight} from 'lucide-react';
import {SignedIn,SignedOut} from '@/src/components/PublicAuthState';import {UserButton} from '@clerk/nextjs';
import {ThemeToggle} from './ThemeToggle';
export function SiteHeader(){
 const [open,setOpen]=useState(false);
 return <header className="swa-header"><a href="#main-content" className="swa-skip">Vai al contenuto</a><div className="swa-header-inner">
 <Link href="/marketplace" className="swa-brand" aria-label="SWA — Marketplace"><img src="/tools/swa/logo.webp" width="88" height="39" alt="SWA"/><span>Social Web<br/>Automation</span></Link>
 <button className="swa-menu-button" aria-label={open?'Chiudi menu':'Apri menu'} aria-expanded={open} aria-controls="swa-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
 <nav id="swa-navigation" className={open?'swa-nav open':'swa-nav'} aria-label="Navigazione principale" onClick={()=>setOpen(false)}>
 <a href="https://www.socialautomation.app/servizi">Servizi</a><Link href="/marketplace" className="active">Marketplace <span className="swa-nav-dot"/></Link><a href="https://www.socialautomation.app/metodo">Il metodo SWA</a>
 <ThemeToggle/>
 <SignedOut><a href="https://www.socialautomation.app/login?callbackUrl=/marketplace" className="swa-nav-account">Accedi <ArrowUpRight size={15}/></a></SignedOut>
 <SignedIn><Link href="/dashboard" prefetch={false}>Area personale</Link><UserButton/></SignedIn></nav></div></header>;
}
