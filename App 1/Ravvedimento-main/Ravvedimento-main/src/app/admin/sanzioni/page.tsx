"use client";

import { useEffect, useState } from "react";
import { Percent, Save, Loader2, Trash2, Plus, X } from "lucide-react";

interface Sanzione {
    id?: string;
    tipoRavvedimento: string;
    nomeDisplay: string;
    giorniDa: number;
    giorniA: number | null;
    riduzioneSanzione: number;
    descrizioneRiduzione: string;
    sanzioneBasePercentuale: number;
    riferimentoNormativo: string;
    validoDa?: string;
}

const emptySanzione: Omit<Sanzione, "id"> = {
    tipoRavvedimento: "",
    nomeDisplay: "",
    giorniDa: 0,
    giorniA: null,
    riduzioneSanzione: 0,
    descrizioneRiduzione: "",
    sanzioneBasePercentuale: 30,
    riferimentoNormativo: "",
    validoDa: "",
};

export default function AdminSanzioniPage() {
    const [sanzioni, setSanzioni] = useState<Sanzione[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Sanzione>>({});
    const [showForm, setShowForm] = useState(false);
    const [newSanzione, setNewSanzione] = useState({ ...emptySanzione });

    useEffect(() => { fetchSanzioni(); }, []);

    const fetchSanzioni = async () => {
        const res = await fetch("/api/admin/sanzioni");
        const data = await res.json();
        setSanzioni(data);
        setLoading(false);
    };

    const handleAdd = async () => {
        setSaving("new");
        const res = await fetch("/api/admin/sanzioni", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSanzione),
        });
        if (res.ok) {
            setShowForm(false);
            setNewSanzione({ ...emptySanzione });
            fetchSanzioni();
        }
        setSaving(null);
    };

    const handleSave = async (id: string) => {
        setSaving(id);
        await fetch("/api/admin/sanzioni", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...editValues }),
        });
        setEditingId(null);
        setEditValues({});
        setSaving(null);
        fetchSanzioni();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Eliminare questo scaglione?")) return;
        setDeleting(id);
        await fetch("/api/admin/sanzioni", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setDeleting(null);
        fetchSanzioni();
    };

    const startEdit = (s: Sanzione) => {
        setEditingId(s.id!);
        setEditValues({
            nomeDisplay: s.nomeDisplay,
            riduzioneSanzione: s.riduzioneSanzione,
            descrizioneRiduzione: s.descrizioneRiduzione,
            sanzioneBasePercentuale: s.sanzioneBasePercentuale,
            riferimentoNormativo: s.riferimentoNormativo,
            giorniDa: s.giorniDa,
            giorniA: s.giorniA,
        });
    };

    const InlineInput = ({ fieldKey, type = "text", step }: { fieldKey: keyof Sanzione; type?: string; step?: string }) => (
        <input
            type={type}
            step={step}
            value={(editValues[fieldKey] as any) ?? ""}
            onChange={e => setEditValues(prev => ({
                ...prev,
                [fieldKey]: type === "number" ? parseFloat(e.target.value) : e.target.value
            }))}
            className="w-full h-8 bg-neutral-50 border border-primary/30 rounded-lg px-2 text-sm font-medium focus:outline-none"
        />
    );

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2 tracking-tight">
                        <Percent className="h-6 w-6 text-purple-500" /> Scaglioni Sanzioni
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">Gestisci i tipi di ravvedimento e le relative percentuali</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-primary/20"
                >
                    <Plus className="h-4 w-4" /> Nuovo Scaglione
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="mb-6 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-neutral-900">Nuovo Scaglione</h3>
                        <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {[
                            { label: "Tipo (codice)", key: "tipoRavvedimento" },
                            { label: "Nome Visualizzato", key: "nomeDisplay" },
                            { label: "Giorni Da", key: "giorniDa", type: "number" },
                            { label: "Giorni A (vuoto = nessun limite)", key: "giorniA", type: "number" },
                            { label: "Riduzione (es. 0.1 per 10%)", key: "riduzioneSanzione", type: "number", step: "0.0001" },
                            { label: "Sanzione Base %", key: "sanzioneBasePercentuale", type: "number", step: "0.01" },
                        ].map(({ label, key, type = "text", step }) => (
                            <div key={key}>
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</label>
                                <input
                                    type={type}
                                    step={step}
                                    value={(newSanzione as any)[key] ?? ""}
                                    onChange={e => setNewSanzione(prev => ({ ...prev, [key]: type === "number" ? parseFloat(e.target.value) : e.target.value }))}
                                    className="mt-1 w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Descrizione Riduzione</label>
                        <input type="text" value={newSanzione.descrizioneRiduzione} onChange={e => setNewSanzione(p => ({ ...p, descrizioneRiduzione: e.target.value }))} placeholder="Es. 1/10 del minimo (3%)" className="mt-1 w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Riferimento Normativo</label>
                        <input type="text" value={newSanzione.riferimentoNormativo} onChange={e => setNewSanzione(p => ({ ...p, riferimentoNormativo: e.target.value }))} placeholder="Es. Art. 13 D.Lgs. 472/1997" className="mt-1 w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <button onClick={handleAdd} disabled={saving === "new"} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all">
                        {saving === "new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Salva
                    </button>
                </div>
            )}

            {/* Tabella */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /></div>
                ) : (
                    <div className="divide-y divide-neutral-50">
                        {sanzioni.map(s => (
                            <div key={s.id} className={`p-5 hover:bg-neutral-50/50 transition-colors ${editingId === s.id ? "bg-primary/5 border-l-4 border-primary" : ""}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {editingId === s.id ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Nome</label><InlineInput fieldKey="nomeDisplay" /></div>
                                                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Giorni Da</label><InlineInput fieldKey="giorniDa" type="number" /></div>
                                                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Giorni A</label><InlineInput fieldKey="giorniA" type="number" /></div>
                                                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Riduzione</label><InlineInput fieldKey="riduzioneSanzione" type="number" step="0.0001" /></div>
                                                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Descrizione</label><InlineInput fieldKey="descrizioneRiduzione" /></div>
                                                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Riferimento</label><InlineInput fieldKey="riferimentoNormativo" /></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-lg uppercase">{s.tipoRavvedimento}</span>
                                                    <h3 className="font-bold text-neutral-900 text-sm">{s.nomeDisplay}</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                                                    <span>Giorni: <strong className="text-neutral-700">{s.giorniDa} – {s.giorniA ?? "∞"}</strong></span>
                                                    <span>Riduzione: <strong className="text-primary">{(s.riduzioneSanzione * 100).toFixed(4)}%</strong></span>
                                                    <span className="text-neutral-400">{s.descrizioneRiduzione}</span>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 mt-1">{s.riferimentoNormativo}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {editingId === s.id ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSave(s.id!)} disabled={saving === s.id} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
                                                    {saving === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Salva
                                                </button>
                                                <button onClick={() => { setEditingId(null); setEditValues({}); }} className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg hover:bg-neutral-200">Annulla</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(s)} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200 transition-all">Modifica</button>
                                                <button onClick={() => handleDelete(s.id!)} disabled={deleting === s.id} className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50">
                                                    {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
