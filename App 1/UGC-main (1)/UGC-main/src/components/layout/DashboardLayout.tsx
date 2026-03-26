import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "../ui/button";

export function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                    {/* Search */}
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full h-9 pl-10 pr-4 rounded-full bg-secondary/50 border border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-sm font-medium text-gray-300">
                            Credits: <span className="text-violet-400 font-bold">120</span>
                        </div>
                        <button className="relative text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent" />
                        </button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Plus size={16} className="mr-2" /> New Project
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
