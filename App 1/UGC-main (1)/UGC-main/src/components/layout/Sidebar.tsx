import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderOpen, User, Mic, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const location = useLocation();

    const links = [
        { name: "Home", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Projects", href: "/dashboard/projects", icon: FolderOpen },
        { name: "Avatars", href: "/dashboard/avatars", icon: User },
        { name: "Voice Clones", href: "/dashboard/voices", icon: Mic },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-secondary/30 border-r border-white/5 h-screen flex flex-col fixed left-0 top-0">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    UGC Video Top
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs">
                        JD
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">John Doe</p>
                        <p className="text-xs text-gray-500 truncate">Free Plan</p>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
