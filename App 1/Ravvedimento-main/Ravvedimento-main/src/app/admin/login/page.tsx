"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const data = await res.json();
                setError(data.error || "Password errata");
            }
        } catch {
            setError("Errore di connessione. Riprova.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Admin Panel</h1>
                    <p className="text-sm text-neutral-500 mt-1">Ravvedimento Facile</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password amministratore"
                                className="w-full h-11 bg-neutral-800 border border-neutral-700 rounded-xl px-4 pr-11 text-white font-medium placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-3">
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full h-11 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Accesso...</>
                        ) : (
                            "Accedi"
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-neutral-700 mt-6">
                    Area riservata agli amministratori
                </p>
            </div>
        </div>
    );
}
