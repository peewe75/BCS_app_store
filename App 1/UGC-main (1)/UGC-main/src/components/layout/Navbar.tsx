import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    UGC Video Top
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link to="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link to="#showcase" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Showcase
                    </Link>
                    <Link to="/login">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Login
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-background border-b border-white/10">
                    <div className="flex flex-col p-4 gap-4">
                        <Link to="#features" className="text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                            Features
                        </Link>
                        <Link to="#pricing" className="text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                            Pricing
                        </Link>
                        <Link to="#showcase" className="text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                            Showcase
                        </Link>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                            <Button className="w-full">Login</Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
