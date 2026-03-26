import { Button } from "../components/ui/button";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Play, Sparkles, Zap, Users, Scissors } from "lucide-react";
import { ReactNode } from "react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

                <div className="container mx-auto px-4 text-center z-10 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm">
                        <Sparkles size={14} className="text-accent" />
                        <span>AI Video Generation Revolution</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Create Viral UGC Videos <br />
                        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">in Seconds with AI</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Generate engaging scripts, realistic avatars, and professional edits automatically.
                        No camera or editing skills required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 transition-all hover:scale-105">
                            Start Creating for Free <Zap className="ml-2 w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                            <Play className="mr-2 w-4 h-4 fill-white" /> Watch Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-black/40">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything needed to go viral</h2>
                        <p className="text-gray-400">Powerful AI tools to automate your content creation workflow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-violet-400" />}
                            title="AI Scriptwriter"
                            description="Generate hook-filled scripts optimized for TikTok and Reels in seconds."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-fuchsia-400" />}
                            title="Realistic Avatars"
                            description="Choose from 100+ lifelike AI avatars that speak any language perfectly."
                        />
                        <FeatureCard
                            icon={<Scissors className="w-8 h-8 text-blue-400" />}
                            title="Auto-Editing"
                            description="Professional cuts, captions, and b-roll added automatically to your video."
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">From Idea to Video in 3 Steps</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />

                        <Step
                            number="01"
                            title="Select Template"
                            description="Choose a video style or start from scratch with a prompt."
                        />
                        <Step
                            number="02"
                            title="Customize"
                            description="Edit script, choose avatar, and adjust branding assets."
                        />
                        <Step
                            number="03"
                            title="Download"
                            description="Export in 4K resolution ready for all social platforms."
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group">
            <div className="mb-6 p-3 rounded-lg bg-white/5 w-fit group-hover:bg-violet-500/20 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="text-center relative">
            <div className="w-16 h-16 rounded-full bg-background border border-white/20 flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-xl shadow-fuchsia-500/10 z-10 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">{number}</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    )
}
