"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { getFirestoreDB, getStoricoCalcoli } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { Calculator, FileText, History, Clock, CheckCircle, TrendingUp, Download, Shield, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DocumentoPDF } from "@/components/pdf/DocumentoPDF";
import { FormRavvedimento } from "@/components/calcolatore/FormRavvedimento";

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [trialInfo, setTrialInfo] = useState<any>(null);
    const [storico, setStorico] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (isLoaded && user) {
            const db = getFirestoreDB();
            try {
                const userDoc = await getDoc(doc(db, "users", user.id));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const startDate = data.trialStartDate?.toDate() || new Date();
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + (data.trialDays || 14));

                    const now = new Date();
                    const diffTime = endDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    setTrialInfo({
                        ...data,
                        daysRemaining: Math.max(0, diffDays),
                        endDate
                    });
                } else {
                    // Default trial info for new users
                    setTrialInfo({
                        plan: 'Free',
                        daysRemaining: 14,
                        trialDays: 14,
                        trialStartDate: new Date()
                    });
                }

                const calcoli = await getStoricoCalcoli(user.id);
                setStorico(calcoli);
            } catch (e) {
                console.error("Errore fetch dati:", e);
            }
            setLoading(false);
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    useEffect(() => {
        fetchData();

        // Listener per aggiornare lo storico quando viene salvato un nuovo calcolo
        const handleRefresh = () => fetchData();
        window.addEventListener('calcoloSaved', handleRefresh);
        return () => window.removeEventListener('calcoloSaved', handleRefresh);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-12 font-sans">
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
                        <div className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                            <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="text-base sm:text-xl font-bold text-neutral-900 tracking-tight truncate max-w-[130px] sm:max-w-none">RavvedimentoFacile</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] md:text-sm font-bold text-neutral-900 leading-none">Ciao, {user?.firstName}</span>
                            <span className="text-[8px] md:text-[10px] text-neutral-500 font-medium uppercase mt-0.5 tracking-wider">Account {trialInfo?.plan || 'Free'}</span>
                        </div>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Calculator */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-1">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Calcolatore Professionale</h2>
                            </div>
                            <p className="text-neutral-500 text-sm">Inserisci i dati per generare sanzioni, interessi e il documento PDF.</p>
                        </div>
                        <FormRavvedimento />
                    </div>

                    {/* Right Column: Status & History */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">

                        {/* Trial Status Card */}
                        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                                <Shield className="h-16 w-16 md:h-24 md:w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 md:mb-4">
                                    <div className="h-5 w-5 md:h-6 md:w-6 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/80">Periodo di prova</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black mb-1">{trialInfo?.daysRemaining} Giorni</h3>
                                <p className="text-primary-foreground/70 text-xs md:text-sm font-medium">Accesso illimitato alle funzioni Pro</p>

                                <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[FileText, History, Download].map((Icon, i) => (
                                            <div key={i} className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/10 flex items-center justify-center border-2 border-primary backdrop-blur-sm">
                                                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                            </div>
                                        ))}
                                    </div>
                                    <Link href="/pricing" className="text-[10px] md:text-[11px] font-bold bg-white text-primary px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                                        Upgrade
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-neutral-200 overflow-hidden shadow-sm flex flex-col h-[400px] md:h-[500px]">
                            <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                                        <History className="h-4 w-4 text-neutral-600" />
                                    </div>
                                    <h2 className="font-bold text-neutral-900 tracking-tight">Recenti</h2>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded-lg">{storico.length} calcoli</span>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 scrollbar-hide">
                                {storico.length === 0 ? (
                                    <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                                        <div className="h-14 w-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-neutral-100">
                                            <History className="h-6 w-6 text-neutral-200" />
                                        </div>
                                        <p className="text-sm text-neutral-400 font-medium max-w-[150px]">Inizia il tuo primo calcolo per vederlo qui.</p>
                                    </div>
                                ) : (
                                    storico.map((item) => (
                                        <div key={item.id} className="p-5 hover:bg-neutral-50/80 transition-all group relative">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h3 className="font-bold text-neutral-900 text-sm truncate group-hover:text-primary transition-colors">
                                                        {item.nomeTributo || `Tributo ${item.codiceTributo}`}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded leading-none">
                                                            {item.codiceTributo}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {format(item.createdAt?.toDate() || new Date(), "d MMM yyyy", { locale: it })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-sm font-black text-neutral-900">
                                                        €{item.totaleDaVersare?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex gap-4">
                                                    <div className="text-[10px] flex flex-col">
                                                        <span className="text-neutral-400 font-medium uppercase tracking-tighter">Sanzione</span>
                                                        <span className="font-bold text-neutral-700 leading-none mt-1">€{item.sanzioneRidotta?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="text-[10px] flex flex-col">
                                                        <span className="text-neutral-400 font-medium uppercase tracking-tighter">Interessi</span>
                                                        <span className="font-bold text-neutral-700 leading-none mt-1">€{item.totaleInteressi?.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <PDFDownloadLink
                                                    document={<DocumentoPDF risultato={{
                                                        ...item,
                                                        input: {
                                                            importoOriginale: item.importoOriginale,
                                                            dataScadenza: item.dataScadenza?.toDate() || new Date(),
                                                            dataVersamento: item.dataVersamento?.toDate() || new Date(),
                                                            codiceTributo: item.codiceTributo,
                                                            nomeTributo: item.nomeTributo
                                                        },
                                                        calcolatoIl: item.createdAt?.toDate() || new Date()
                                                    } as any} />}
                                                    fileName={`ravvedimento_${item.codiceTributo}_${format(item.createdAt?.toDate() || new Date(), 'dd-MM-yyyy')}.pdf`}
                                                >
                                                    {({ loading }) => (
                                                        <button
                                                            className="h-10 w-10 rounded-xl bg-neutral-50 text-neutral-400 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center border border-neutral-100 group/btn"
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Download className="h-4 w-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                            )}
                                                        </button>
                                                    )}
                                                </PDFDownloadLink>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 text-center">
                                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors" onClick={() => fetchData()}>
                                    <RefreshCw className="mr-2 h-3 w-3" /> Aggiorna Storico
                                </Button>
                            </div>
                        </div>

                        {/* Support Info */}
                        <div className="bg-white rounded-[2rem] p-6 border border-neutral-200">
                            <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-success" />
                                Sicurezza & Normativa
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-800 leading-tight">D.Lgs. 87/2024</p>
                                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">Pienamente conforme alla nuova riforma del ravvedimento operoso.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-800 leading-tight">Database cloud sicuro</p>
                                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">I tuoi calcoli sono criptati e accessibili solo da te.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
