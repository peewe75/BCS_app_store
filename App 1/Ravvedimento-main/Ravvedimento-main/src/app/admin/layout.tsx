"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Percent, TrendingUp, Users, FileText, LogOut, Shield } from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/tassi", label: "Tassi Legali", icon: TrendingUp },
    { href: "/admin/sanzioni", label: "Sanzioni", icon: Percent },
    { href: "/admin/utenti", label: "Utenti", icon: Users },
    { href: "/admin/calcoli", label: "Calcoli", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-neutral-950 flex flex-col fixed h-full z-10">
                {/* Brand */}
                <div className="p-6 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight">Admin Panel</p>
                            <p className="text-neutral-600 text-[10px] font-medium">Ravvedimento Facile</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                    }`}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        {loggingOut ? "Disconnessione..." : "Disconnetti"}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
}
