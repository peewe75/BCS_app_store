"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2, TrendingUp, X } from "lucide-react";

interface Tasso {
    id?: string;
    anno: number;
    tassoPercentuale: number;
    dataDecorrenza: string;
    dataFine?: string;
    riferimentoNormativo: string;
}

const emptyTasso: Omit<Tasso, "id"> = {
    anno: new Date().getFullYear(),
    tassoPercentuale: 0,
    dataDecorrenza: `${new Date().getFullYear()}-01-01`,
    dataFine: `${new Date().getFullYear()}-12-31`,
    riferimentoNormativo: "",
};

export default function AdminTassiPage() {
    const [tassi, setTassi] = useState<Tasso[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [newTasso, setNewTasso] = useState({ ...emptyTasso });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Tasso>>({});

    useEffect(() => { fetchTassi(); }, []);

    const fetchTassi = async () => {
        const res = await fetch("/api/admin/tassi");
        const data = await res.json();
        setTassi(data);
        setLoading(false);
    };

    const handleAdd = async () => {
        setSaving("new");
        const res = await fetch("/api/admin/tassi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTasso),
        });
        if (res.ok) {
            setShowForm(false);
            setNewTasso({ ...emptyTasso });
            fetchTassi();
        }
        setSaving(null);
    };

    const handleSaveEdit = async (id: string) => {
        setSaving(id);
        await fetch("/api/admin/tassi", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...editValues }),
        });
        setEditingId(null);
        setEditValues({});
        setSaving(null);
        fetchTassi();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Eliminare questo tasso?")) return;
        setDeleting(id);
        await fetch("/api/admin/tassi", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setDeleting(null);
        fetchTassi();
    };

    const startEdit = (t: Tasso) => {
        setEditingId(t.id!);
        setEditValues({
            tassoPercentuale: t.tassoPercentuale,
            riferimentoNormativo: t.riferimentoNormativo,
            dataDecorrenza: t.dataDecorrenza,
            dataFine: t.dataFine,
        });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2 tracking-tight">
                        <TrendingUp className="h-6 w-6 text-primary" /> Tassi Interesse Legale
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">Gestisci i tassi storici e aggiungi gli anni futuri</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-primary/20"
                >
                    <Plus className="h-4 w-4" /> Aggiungi Anno
                </button>
            </div>

            {/* Form aggiunta */}
            {showForm && (
                <div className="mb-6 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-neutral-900">Nuovo Tasso</h3>
                        <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                            { label: "Anno", key: "anno", type: "number" },
                            { label: "Tasso %", key: "tassoPercentuale", type: "number" },
                            { label: "Decorrenza", key: "dataDecorrenza", type: "date" },
                            { label: "Scadenza", key: "dataFine", type: "date" },
                        ].map(({ label, key, type }) => (
                            <div key={key}>
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</label>
                                <input
                                    type={type}
                                    step={key === "tassoPercentuale" ? "0.01" : undefined}
                                    value={(newTasso as any)[key] ?? ""}
                                    onChange={e => setNewTasso(prev => ({ ...prev, [key]: type === "number" ? parseFloat(e.target.value) : e.target.value }))}
                                    className="mt-1 w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Riferimento Normativo</label>
                        <input
                            type="text"
                            value={newTasso.riferimentoNormativo}
                            onChange={e => setNewTasso(prev => ({ ...prev, riferimentoNormativo: e.target.value }))}
                            placeholder="Es. D.M. 10 dicembre 2025"
                            className="mt-1 w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={saving === "new"}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {saving === "new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Salva
                    </button>
                </div>
            )}

            {/* Tabella */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                            <th className="p-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Anno</th>
                            <th className="p-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tasso %</th>
                            <th className="p-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden md:table-cell">Decorrenza</th>
                            <th className="p-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Riferimento</th>
                            <th className="p-4 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /></td></tr>
                        ) : tassi.map(tasso => (
                            <tr key={tasso.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="p-4 font-black text-neutral-900">{tasso.anno}</td>
                                <td className="p-4">
                                    {editingId === tasso.id ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editValues.tassoPercentuale ?? tasso.tassoPercentuale}
                                            onChange={e => setEditValues(prev => ({ ...prev, tassoPercentuale: parseFloat(e.target.value) }))}
                                            className="w-20 h-8 bg-neutral-50 border border-primary/30 rounded-lg px-2 text-sm font-bold text-primary focus:outline-none"
                                        />
                                    ) : (
                                        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${tasso.anno === new Date().getFullYear() ? "bg-primary/10 text-primary" : "text-neutral-700"}`}>
                                            {tasso.tassoPercentuale}%
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-neutral-500 hidden md:table-cell">{tasso.dataDecorrenza}</td>
                                <td className="p-4 text-neutral-400 text-xs hidden lg:table-cell max-w-[200px] truncate">{tasso.riferimentoNormativo}</td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {editingId === tasso.id ? (
                                            <>
                                                <button onClick={() => handleSaveEdit(tasso.id!)} disabled={saving === tasso.id} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 transition-all">
                                                    {saving === tasso.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Salva
                                                </button>
                                                <button onClick={() => { setEditingId(null); setEditValues({}); }} className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg hover:bg-neutral-200 transition-all">
                                                    Annulla
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(tasso)} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200 transition-all">
                                                    Modifica
                                                </button>
                                                <button onClick={() => handleDelete(tasso.id!)} disabled={deleting === tasso.id} className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50">
                                                    {deleting === tasso.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
