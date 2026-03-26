"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, FileText, Percent, Database, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Stats {
    totaleTassi: number;
    totaleSanzioni: number;
    totaleCalcoli: number;
    totaleUtenti: number;
    tassoCorrente: { tassoPercentuale: number; riferimentoNormativo: string } | null;
    calcoliRecenti: any[];
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            setStats(data);
        } catch {
            console.error("Errore stats");
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!confirm("Questo sovrascriverà tutti i tassi e sanzioni su Firestore con i dati correnti. Sei sicuro?")) return;
        setSeeding(true);
        setSeedMessage(null);
        try {
            const res = await fetch("/api/admin/seed", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setSeedMessage({ type: "success", text: `✅ Seeding completato: ${data.tassiSeedati} tassi e ${data.sanzioniSeedate} sanzioni caricati.` });
                fetchStats();
            } else {
                setSeedMessage({ type: "error", text: data.error || "Errore durante il seeding" });
            }
        } catch {
            setSeedMessage({ type: "error", text: "Errore di connessione" });
        } finally {
            setSeeding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        { label: "Tassi Storici", value: stats?.totaleTassi ?? 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Scaglioni Sanzioni", value: stats?.totaleSanzioni ?? 0, icon: Percent, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "Calcoli Totali", value: stats?.totaleCalcoli ?? 0, icon: FileText, color: "text-green-500", bg: "bg-green-50" },
        { label: "Utenti Firestore", value: stats?.totaleUtenti ?? 0, icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Overview</h1>
                    <p className="text-sm text-neutral-500 mt-1">Gestione dati normativi e statistiche</p>
                </div>
                <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                    {seeding ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Seeding...</>
                    ) : (
                        <><Database className="h-4 w-4" /> Inizializza Dati DB</>
                    )}
                </button>
            </div>

            {seedMessage && (
                <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${seedMessage.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                    {seedMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
                    {seedMessage.text}
                </div>
            )}

            {/* Tasso corrente banner */}
            {stats?.tassoCorrente && (
                <div className="mb-6 p-5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                    <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-1">Tasso Legale Corrente ({new Date().getFullYear()})</p>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-black">{stats.tassoCorrente.tassoPercentuale}%</span>
                        <span className="text-primary-foreground/70 text-sm mb-1">{stats.tassoCorrente.riferimentoNormativo}</span>
                    </div>
                </div>
            )}

            {!stats?.tassoCorrente && (
                <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">Nessun dato su Firestore</p>
                        <p className="text-xs text-amber-600">Clicca &quot;Inizializza Dati DB&quot; per caricare i dati dall&apos;applicazione al database.</p>
                    </div>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
                        <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <p className="text-2xl font-black text-neutral-900">{value}</p>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Calcoli recenti */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="font-bold text-neutral-900">Calcoli Recenti</h2>
                    <span className="text-xs text-neutral-400 font-medium">Ultimi 5</span>
                </div>
                {(!stats?.calcoliRecenti || stats.calcoliRecenti.length === 0) ? (
                    <div className="p-8 text-center text-neutral-400 text-sm">Nessun calcolo ancora eseguito dagli utenti.</div>
                ) : (
                    <div className="divide-y divide-neutral-50">
                        {stats.calcoliRecenti.map((calc: any) => (
                            <div key={calc.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">{calc.nomeTributo || calc.codiceTributo}</p>
                                    <p className="text-xs text-neutral-400">
                                        {calc.createdAt?.toDate ? format(calc.createdAt.toDate(), "d MMM yyyy HH:mm", { locale: it }) : "—"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-neutral-900">€{calc.totaleDaVersare?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{calc.tipoRavvedimento}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
