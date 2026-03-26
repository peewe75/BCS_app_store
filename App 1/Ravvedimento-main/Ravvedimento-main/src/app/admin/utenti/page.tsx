"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";

interface Utente {
    id: string;
    email?: string;
    plan?: string;
    createdAt?: any;
    trialDays?: number;
    trialStartDate?: any;
}

export default function AdminUtentiPage() {
    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/utenti")
            .then(r => r.json())
            .then(data => { setUtenti(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2 tracking-tight">
                    <Users className="h-6 w-6 text-orange-500" /> Utenti Registrati
                </h1>
                <p className="text-sm text-neutral-500 mt-1">Utenti salvati su Firestore al primo accesso</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Totale: {utenti.length}</span>
                    <Link href="/admin/calcoli" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Vedi tutti i calcoli
                    </Link>
                </div>
                {loading ? (
                    <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /></div>
                ) : utenti.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm">
                        Nessun utente ancora registrato con profilo Firestore.
                        <br /><span className="text-xs text-neutral-300">Gli utenti vengono creati su Firestore solo quando si effettua il primo calcolo.</span>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-50">
                        {utenti.map(u => (
                            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-neutral-900 font-mono">{u.id.substring(0, 20)}...</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        Piano: <strong className="text-neutral-600">{u.plan || "Free"}</strong>
                                        {u.trialDays && <> · Trial: {u.trialDays} giorni</>}
                                        {u.createdAt?.toDate && <> · {format(u.createdAt.toDate(), "d MMM yyyy", { locale: it })}</>}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg uppercase tracking-wide">Attivo</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
