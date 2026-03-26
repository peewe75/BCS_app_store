import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Video, Globe, User, MoreVertical, Play } from "lucide-react";
import { Button } from "../components/ui/button";
import { ReactNode } from "react";

export default function Dashboard() {
    const recentProjects = [
        { title: "Tech Review 2026", status: "Completed", date: "2 hours ago", thumbnail: "bg-violet-900/20" },
        { title: "Product Launch Teaser", status: "Rendering", date: "5 hours ago", thumbnail: "bg-fuchsia-900/20" },
        { title: "Social Media Ad", status: "Draft", date: "1 day ago", thumbnail: "bg-blue-900/20" },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Quick Start Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Create New</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickStartCard
                            icon={<Video className="w-8 h-8 text-violet-400" />}
                            title="Text to Video"
                            description="Turn your script into a video instantly."
                        />
                        <QuickStartCard
                            icon={<Globe className="w-8 h-8 text-fuchsia-400" />}
                            title="URL to Video"
                            description="Convert a blog post or news article."
                        />
                        <QuickStartCard
                            icon={<User className="w-8 h-8 text-blue-400" />}
                            title="AI Avatar"
                            description="Create a video with a digital twin."
                        />
                    </div>
                </section>

                {/* Recent Projects Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Recent Projects</h2>
                        <Button variant="ghost" className="text-sm text-gray-400 hover:text-white">View All</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentProjects.map((project, index) => (
                            <div key={index} className="group relative rounded-xl overflow-hidden bg-card border border-white/5 hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/10">
                                {/* Thumbnail */}
                                <div className={`aspect-video ${project.thumbnail} flex items-center justify-center group-hover:bg-opacity-30 transition-colors relative`}>
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 cursor-pointer">
                                        <Play fill="white" className="w-5 h-5 ml-1 text-white" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold truncate pr-4">{project.title}</h3>
                                        <button className="text-gray-500 hover:text-white">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">{project.date}</span>
                                        <StatusBadge status={project.status} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

function QuickStartCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
    return (
        <button className="flex flex-col items-start p-6 rounded-xl bg-card border border-white/5 hover:border-primary/50 hover:bg-white/5 transition-all text-left">
            <div className="mb-4 p-3 rounded-lg bg-background border border-white/5">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        Completed: "bg-green-500/10 text-green-400 border-green-500/20",
        Rendering: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        Draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
            {status}
        </span>
    );
}
