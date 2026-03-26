import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Play, Pause, Save, Download, Wand2, Type, User, Mic, Image as ImageIcon, Settings as SettingsIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "@/lib/utils";

export default function Editor() {
    const [activeTab, setActiveTab] = useState("script");
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">

            {/* Top Bar */}
            <header className="h-14 border-b border-white/5 bg-background flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold">Untitled Project</h1>
                        <span className="text-xs text-gray-500">Last saved 2m ago</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-gray-400">
                        <Save size={16} className="mr-2" /> Save Draft
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0">
                        <Download size={16} className="mr-2" /> Export
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Tools Panel */}
                <aside className="w-16 flex flex-col border-r border-white/5 bg-secondary/20">
                    <ToolTab icon={Type} label="Script" isActive={activeTab === "script"} onClick={() => setActiveTab("script")} />
                    <ToolTab icon={User} label="Avatar" isActive={activeTab === "avatar"} onClick={() => setActiveTab("avatar")} />
                    <ToolTab icon={Mic} label="Voice" isActive={activeTab === "voice"} onClick={() => setActiveTab("voice")} />
                    <ToolTab icon={ImageIcon} label="Media" isActive={activeTab === "media"} onClick={() => setActiveTab("media")} />
                </aside>

                {/* Tools Config Panel */}
                <div className="w-80 border-r border-white/5 bg-background/50 p-6 overflow-y-auto">
                    {activeTab === "script" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Type size={18} className="text-violet-400" /> Script
                            </h2>
                            <div className="space-y-4">
                                <label className="text-xs font-medium text-gray-400">Video Topic</label>
                                <input type="text" placeholder="e.g. New iPhone Review" className="w-full bg-secondary/50 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-violet-500" />

                                <label className="text-xs font-medium text-gray-400">Script Content</label>
                                <textarea
                                    className="w-full h-64 bg-secondary/50 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-violet-500 resize-none font-mono leading-relaxed"
                                    placeholder="Type your script here..."
                                    defaultValue="Hey guys! Check out this amazing new gadget that just dropped..."
                                ></textarea>

                                <Button className="w-full bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30">
                                    <Wand2 size={16} className="mr-2" /> AI Enhance Script
                                </Button>
                            </div>
                        </div>
                    )}
                    {/* Add other tab content conditions here */}
                </div>

                {/* Center Stage (Preview) */}
                <main className="flex-1 bg-black/50 flex flex-col items-center justify-center relative p-8">
                    <div className="aspect-[9/16] h-[600px] bg-gray-900 rounded-lg border border-white/10 shadow-2xl relative overflow-hidden group">
                        {/* Fake Avatar Preview */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                            <User size={64} className="text-gray-700" />
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <button
                                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause fill="white" className="text-white" /> : <Play fill="white" className="text-white ml-1" />}
                            </button>
                        </div>
                    </div>

                    {/* Zoom / Layout Controls (Bottom of Preview) */}
                    <div className="absolute bottom-4 flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-black/40 text-xs text-gray-400 border border-white/5">Fit</div>
                        <div className="px-3 py-1 rounded-full bg-black/40 text-xs text-gray-400 border border-white/5">100%</div>
                    </div>
                </main>

                {/* Right Settings Panel */}
                <aside className="w-72 border-l border-white/5 bg-background p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Properties</h3>
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-secondary/30 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Avatar Scale</span>
                                <span className="text-xs text-gray-400">100%</span>
                            </div>
                            <input type="range" className="w-full accent-violet-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Voice Speed</span>
                                <span className="text-xs text-gray-400">1.0x</span>
                            </div>
                            <input type="range" className="w-full accent-violet-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Timeline */}
            <div className="h-32 border-t border-white/5 bg-secondary/10 flex flex-col">
                <div className="h-8 border-b border-white/5 flex items-center px-4 gap-2 text-xs text-gray-500">
                    <span>00:00</span>
                    <span className="flex-1 text-center">Timeline</span>
                    <span>00:15</span>
                </div>
                <div className="flex-1 p-2 overflow-x-auto">
                    <div className="h-full bg-primary/20 rounded-md border border-primary/30 relative w-[800px]">
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500 h-full"></div>
                        <div className="p-2 text-xs text-white/50">Scene 1</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToolTab({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "h-16 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors border-l-2",
                isActive
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
            )}
        >
            <Icon size={20} />
            {label}
        </button>
    )
}
