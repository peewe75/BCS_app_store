export function Footer() {
    return (
        <footer className="bg-background border-t border-white/10 py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} UGC Video Top. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
}
