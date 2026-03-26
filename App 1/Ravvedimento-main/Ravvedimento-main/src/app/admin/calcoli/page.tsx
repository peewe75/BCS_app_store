"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DocumentoPDF } from "@/components/pdf/DocumentoPDF";

export default function AdminCalcoliPage() {
    const [calcoli, setCalcoli] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroUtente, setFiltroUtente] = useState("");

    useEffect(() => {
        fetch("/api/admin/calcoli")
            .then(r => r.json())
            .then(data => { setCalcoli(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtrati = filtroUtente
        ? calcoli.filter(c => c.userId?.includes(filtroUtente))
        : calcoli;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2 tracking-tight">
                        <FileText className="h-6 w-6 text-green-500" /> Tutti i Calcoli
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">Riepilogo di tutti i calcoli effettuati dagli utenti</p>
                </div>
                <div className="flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Filtra per User ID..."
                        value={filtroUtente}
                        onChange={e => setFiltroUtente(e.target.value)}
                        className="h-10 bg-white border border-neutral-200 rounded-xl px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-100">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        {filtrati.length} calcoli {filtroUtente && `· filtrati per "${filtroUtente}"`}
                    </span>
                </div>
                {loading ? (
                    <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /></div>
                ) : filtrati.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm">Nessun calcolo trovato.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="p-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data</th>
                                    <th className="p-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tributo</th>
                                    <th className="p-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden md:table-cell">Tipo</th>
                                    <th className="p-3 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Totale</th>
                                    <th className="p-3 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Sanzione</th>
                                    <th className="p-3 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Interessi</th>
                                    <th className="p-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest">PDF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filtrati.map(calc => (
                                    <tr key={calc.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="p-3 text-neutral-500 text-xs">
                                            {calc.createdAt?.toDate ? format(calc.createdAt.toDate(), "d MMM yy HH:mm", { locale: it }) : "—"}
                                        </td>
                                        <td className="p-3">
                                            <p className="font-bold text-neutral-900 text-xs">{calc.nomeTributo || calc.input?.nomeTributo || "—"}</p>
                                            <p className="text-[10px] text-neutral-400 font-mono">{calc.userId?.substring(0, 12)}...</p>
                                        </td>
                                        <td className="p-3 hidden md:table-cell">
                                            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg uppercase">
                                                {calc.tipoRavvedimento || "—"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-black text-neutral-900">
                                            €{calc.totaleDaVersare?.toLocaleString("it-IT", { minimumFractionDigits: 2 }) ?? "—"}
                                        </td>
                                        <td className="p-3 text-right text-neutral-600 hidden lg:table-cell">
                                            €{calc.sanzioneRidotta?.toFixed(2) ?? "—"}
                                        </td>
                                        <td className="p-3 text-right text-neutral-600 hidden lg:table-cell">
                                            €{calc.totaleInteressi?.toFixed(2) ?? "—"}
                                        </td>
                                        <td className="p-3 text-center">
                                            <PDFDownloadLink
                                                document={<DocumentoPDF risultato={{
                                                    ...calc,
                                                    input: {
                                                        importoOriginale: calc.importoOriginale ?? calc.input?.importoOriginale,
                                                        dataScadenza: calc.dataScadenza?.toDate?.() || new Date(),
                                                        dataVersamento: calc.dataVersamento?.toDate?.() || new Date(),
                                                        codiceTributo: calc.codiceTributo ?? calc.input?.codiceTributo,
                                                        nomeTributo: calc.nomeTributo ?? calc.input?.nomeTributo,
                                                    },
                                                } as any} />}
                                                fileName={`ravvedimento_${calc.codiceTributo ?? "calc"}_${format(calc.createdAt?.toDate?.() || new Date(), "dd-MM-yyyy")}.pdf`}
                                            >
                                                {({ loading: pdfLoading }) => (
                                                    <button className="h-7 w-7 rounded-lg bg-neutral-50 text-neutral-400 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center mx-auto border border-neutral-100" disabled={pdfLoading}>
                                                        {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                                    </button>
                                                )}
                                            </PDFDownloadLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
